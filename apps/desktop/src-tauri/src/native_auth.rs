use std::process::Command;
use std::sync::Mutex;

use base64::engine::general_purpose::URL_SAFE_NO_PAD;
use base64::Engine;
use keyring::Entry;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use tauri::{AppHandle, Emitter, Manager, State};

/* ============================== Native session ============================== */

const CALLBACK: &str = "com.notegic.desktop:/callback";
const SERVICE: &str = "com.notegic.desktop";
const REFRESH_ACCOUNT: &str = "native-refresh";
const PENDING_ACCOUNT: &str = "native-pending";

#[derive(Serialize, Deserialize)]
struct StoredRefresh {
    refresh_token: String,
    api_base: String,
}

#[derive(Clone, Serialize, Deserialize)]
struct PendingAttempt {
    state: String,
    verifier: String,
    api_base: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct NativeSessionView {
    signed_in: bool,
    display_name: String,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct NativeSignedIn {
    access_token: String,
    display_name: String,
}

#[derive(Deserialize)]
struct Envelope<T> {
    data: Option<T>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct CreatedRequest {
    request_id: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct ExchangedSession {
    access_token: String,
    refresh_token: String,
}

#[derive(Deserialize)]
struct Account {
    #[serde(rename = "displayName")]
    display_name: String,
}

#[derive(Deserialize)]
struct AccountEnvelope {
    data: Option<Account>,
}

pub(crate) struct NativeSession {
    access_token: Mutex<String>,
    pending: Mutex<Option<PendingAttempt>>,
    exchange_state: Mutex<Option<String>>,
}

impl NativeSession {
    pub(crate) fn manage(app: &AppHandle) {
        let pending = Self::read_pending();
        app.manage(NativeSession {
            access_token: Mutex::new(String::new()),
            pending: Mutex::new(pending),
            exchange_state: Mutex::new(None),
        });
        let handle = app.clone();
        tauri::async_runtime::spawn(async move {
            let _ = Self::restore(&handle).await;
        });
    }

    pub(crate) fn accept_callback(app: &AppHandle, url: &str) {
        if let Err(error) = Self::accept(app, url) {
            let _ = app.emit("native-auth-error", error);
        }
    }

    async fn start_login(
        &self,
        api_base: String,
        authorize_url: String,
    ) -> Result<(), String> {
        let verifier = Self::random_token();
        let challenge = Self::challenge(&verifier);
        let csrf_state = Self::random_token();
        let request_id = Self::create_request(&api_base, &challenge, &csrf_state).await?;
        let pending = PendingAttempt {
            state: csrf_state,
            verifier,
            api_base,
        };
        Self::store_pending(&pending)?;
        *self.pending.lock().map_err(|error| error.to_string())? = Some(pending);
        *self
            .exchange_state
            .lock()
            .map_err(|error| error.to_string())? = None;
        let url = format!("{authorize_url}#requestId={request_id}");
        Self::open_browser(&url)
    }

    fn view(&self) -> Result<NativeSessionView, String> {
        let signed_in = !self
            .access_token
            .lock()
            .map_err(|error| error.to_string())?
            .is_empty();
        Ok(NativeSessionView {
            signed_in,
            display_name: String::new(),
        })
    }

    async fn logout(&self, api_base: String) -> Result<(), String> {
        if let Some(stored) = Self::read_refresh() {
            let _ = Self::revoke(&api_base, &stored.refresh_token).await;
        }
        let _ = Entry::new(SERVICE, REFRESH_ACCOUNT).and_then(|entry| entry.delete_credential());
        *self
            .access_token
            .lock()
            .map_err(|error| error.to_string())? = String::new();
        Ok(())
    }

    fn accept(app: &AppHandle, url: &str) -> Result<(), String> {
        let session = app.state::<NativeSession>();
        let (code, state) = Self::parse_callback(url)?;
        let pending = session
            .pending
            .lock()
            .map_err(|error| error.to_string())?
            .clone()
            .ok_or("No desktop sign-in is waiting")?;
        if pending.state != state {
            return Err("Desktop sign-in state does not match".to_string());
        }
        {
            let mut seen = session
                .exchange_state
                .lock()
                .map_err(|error| error.to_string())?;
            if seen.as_deref() == Some(state.as_str()) {
                return Ok(());
            }
            *seen = Some(state);
        }
        let app_handle = app.clone();
        tauri::async_runtime::spawn(async move {
            if let Err(error) = Self::exchange(&app_handle, pending, code).await {
                let _ = app_handle.emit("native-auth-error", error);
            }
        });
        Ok(())
    }

    async fn exchange(
        app: &AppHandle,
        pending: PendingAttempt,
        code: String,
    ) -> Result<(), String> {
        let tokens = Self::exchange_code(&pending.api_base, &code, &pending.verifier).await?;
        Self::store_refresh(&StoredRefresh {
            refresh_token: tokens.refresh_token,
            api_base: pending.api_base.clone(),
        })?;
        let session = app.state::<NativeSession>();
        *session
            .access_token
            .lock()
            .map_err(|error| error.to_string())? = tokens.access_token.clone();
        *session
            .pending
            .lock()
            .map_err(|error| error.to_string())? = None;
        let _ = Entry::new(SERVICE, PENDING_ACCOUNT).and_then(|entry| entry.delete_credential());
        let display_name = Self::account_name(&pending.api_base, &tokens.access_token)
            .await
            .unwrap_or_default();
        app.emit(
            "native-session",
            NativeSignedIn {
                access_token: tokens.access_token,
                display_name,
            },
        )
        .map_err(|error| error.to_string())
    }

    fn parse_callback(url: &str) -> Result<(String, String), String> {
        let Some(query) = url.strip_prefix("com.notegic.desktop:/callback?") else {
            return Err("Unregistered desktop callback".to_string());
        };
        if query.contains('#') {
            return Err("Unregistered desktop callback".to_string());
        }
        let mut code = None;
        let mut state = None;
        for pair in query.split('&') {
            let Some((key, value)) = pair.split_once('=') else {
                return Err("Unregistered desktop callback".to_string());
            };
            match key {
                "code" if code.is_none() => code = Some(value.to_string()),
                "state" if state.is_none() => state = Some(value.to_string()),
                _ => return Err("Unregistered desktop callback".to_string()),
            }
        }
        Ok((
            code.ok_or("Unregistered desktop callback")?,
            state.ok_or("Unregistered desktop callback")?,
        ))
    }

    fn random_token() -> String {
        let mut bytes = [0u8; 32];
        getrandom::getrandom(&mut bytes).expect("native auth random");
        URL_SAFE_NO_PAD.encode(bytes)
    }

    fn challenge(verifier: &str) -> String {
        let digest = Sha256::digest(verifier.as_bytes());
        URL_SAFE_NO_PAD.encode(digest)
    }

    fn open_browser(url: &str) -> Result<(), String> {
        let mut command = if cfg!(target_os = "windows") {
            let mut command = Command::new("cmd");
            command.args(["/C", "start", "", url]);
            command
        } else if cfg!(target_os = "macos") {
            let mut command = Command::new("open");
            command.arg(url);
            command
        } else {
            let mut command = Command::new("xdg-open");
            command.arg(url);
            command
        };
        command
            .spawn()
            .map(|_| ())
            .map_err(|error| error.to_string())
    }

    async fn create_request(
        api_base: &str,
        challenge: &str,
        state: &str,
    ) -> Result<String, String> {
        let response = Self::post_json(
            &format!("{api_base}/auth/native/requests"),
            serde_json::json!({
                "clientId": "notegic-desktop",
                "codeChallenge": challenge,
                "state": state,
            }),
        )
        .await?;
        let envelope: Envelope<CreatedRequest> =
            response.json().await.map_err(|error| error.to_string())?;
        envelope
            .data
            .map(|data| data.request_id)
            .ok_or("Desktop sign-in request was refused".to_string())
    }

    async fn exchange_code(
        api_base: &str,
        code: &str,
        verifier: &str,
    ) -> Result<ExchangedSession, String> {
        let response = Self::post_json(
            &format!("{api_base}/auth/native/exchange"),
            serde_json::json!({
                "code": code,
                "codeVerifier": verifier,
                "redirectUri": CALLBACK,
            }),
        )
        .await?;
        let envelope: Envelope<ExchangedSession> =
            response.json().await.map_err(|error| error.to_string())?;
        envelope
            .data
            .ok_or("Desktop sign-in exchange was refused".to_string())
    }

    async fn restore(app: &AppHandle) -> Result<(), String> {
        let Some(stored) = Self::read_refresh() else {
            return Ok(());
        };
        let tokens = Self::refresh(&stored.api_base, &stored.refresh_token).await?;
        Self::store_refresh(&StoredRefresh {
            refresh_token: tokens.refresh_token,
            api_base: stored.api_base.clone(),
        })?;
        let session = app.state::<NativeSession>();
        *session
            .access_token
            .lock()
            .map_err(|error| error.to_string())? = tokens.access_token.clone();
        let display_name = Self::account_name(&stored.api_base, &tokens.access_token)
            .await
            .unwrap_or_default();
        app.emit(
            "native-session",
            NativeSignedIn {
                access_token: tokens.access_token,
                display_name,
            },
        )
        .map_err(|error| error.to_string())
    }

    async fn refresh(api_base: &str, refresh_token: &str) -> Result<ExchangedSession, String> {
        let response = Self::post_json(
            &format!("{api_base}/auth/native/refresh"),
            serde_json::json!({ "refreshToken": refresh_token }),
        )
        .await?;
        if !response.status().is_success() {
            let _ =
                Entry::new(SERVICE, REFRESH_ACCOUNT).and_then(|entry| entry.delete_credential());
            return Err("Desktop session ended".to_string());
        }
        let envelope: Envelope<ExchangedSession> =
            response.json().await.map_err(|error| error.to_string())?;
        envelope
            .data
            .ok_or("Desktop session refresh was refused".to_string())
    }

    async fn revoke(api_base: &str, refresh_token: &str) -> Result<(), String> {
        Self::post_json(
            &format!("{api_base}/auth/native/revoke"),
            serde_json::json!({ "refreshToken": refresh_token }),
        )
        .await
        .map(|_| ())
    }

    async fn account_name(api_base: &str, access_token: &str) -> Result<String, String> {
        let response = reqwest::Client::new()
            .get(format!("{api_base}/users/me"))
            .header("authorization", format!("Bearer {access_token}"))
            .send()
            .await
            .map_err(|error| error.to_string())?;
        let envelope: AccountEnvelope =
            response.json().await.map_err(|error| error.to_string())?;
        envelope
            .data
            .map(|account| account.display_name)
            .ok_or("Account was refused".to_string())
    }

    async fn post_json(url: &str, body: serde_json::Value) -> Result<reqwest::Response, String> {
        reqwest::Client::new()
            .post(url)
            .header("content-type", "application/json")
            .header("cache-control", "no-store")
            .json(&body)
            .send()
            .await
            .map_err(|error| error.to_string())
    }

    fn store_refresh(stored: &StoredRefresh) -> Result<(), String> {
        let json = serde_json::to_string(stored).map_err(|error| error.to_string())?;
        Entry::new(SERVICE, REFRESH_ACCOUNT)
            .map_err(|error| error.to_string())?
            .set_password(&json)
            .map_err(|error| error.to_string())
    }

    fn read_refresh() -> Option<StoredRefresh> {
        let json = Entry::new(SERVICE, REFRESH_ACCOUNT)
            .and_then(|entry| entry.get_password())
            .ok()?;
        serde_json::from_str(&json).ok()
    }

    fn store_pending(pending: &PendingAttempt) -> Result<(), String> {
        let json = serde_json::to_string(pending).map_err(|error| error.to_string())?;
        Entry::new(SERVICE, PENDING_ACCOUNT)
            .map_err(|error| error.to_string())?
            .set_password(&json)
            .map_err(|error| error.to_string())
    }

    fn read_pending() -> Option<PendingAttempt> {
        let json = Entry::new(SERVICE, PENDING_ACCOUNT)
            .and_then(|entry| entry.get_password())
            .ok()?;
        serde_json::from_str(&json).ok()
    }
}

/* ============================== Commands ============================== */

#[tauri::command]
pub async fn start_native_login(
    state: State<'_, NativeSession>,
    api_base: String,
    authorize_url: String,
) -> Result<(), String> {
    state.start_login(api_base, authorize_url).await
}

#[tauri::command]
pub fn native_session(state: State<'_, NativeSession>) -> Result<NativeSessionView, String> {
    state.view()
}

#[tauri::command]
pub async fn logout_native(
    state: State<'_, NativeSession>,
    api_base: String,
) -> Result<(), String> {
    state.logout(api_base).await
}

/* ============================== Tests ============================== */

#[cfg(test)]
mod tests {
    use super::NativeSession;

    #[test]
    fn verifier_is_43_url_safe_characters() {
        let token = NativeSession::random_token();
        assert_eq!(token.len(), 43);
        assert!(token
            .chars()
            .all(|char| char.is_ascii_alphanumeric() || char == '-' || char == '_'));
        assert_eq!(NativeSession::challenge(&token).len(), 43);
    }

    #[test]
    fn callback_accepts_only_code_and_state() {
        assert_eq!(
            NativeSession::parse_callback("com.notegic.desktop:/callback?code=one&state=two")
                .unwrap(),
            ("one".to_string(), "two".to_string())
        );
        assert!(NativeSession::parse_callback(
            "https://example.test/callback?code=one&state=two"
        )
        .is_err());
        assert!(NativeSession::parse_callback(
            "com.notegic.desktop:/callback?code=one&state=two&extra=3"
        )
        .is_err());
    }
}
