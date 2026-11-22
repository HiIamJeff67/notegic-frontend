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

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct NativeSessionView {
    signed_in: bool,
    access_token: String,
    public_id: String,
    name: String,
    display_name: String,
    email: String,
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
#[serde(rename_all = "camelCase")]
struct Account {
    public_id: String,
    name: String,
    display_name: String,
    email: String,
}

pub(crate) struct NativeSession {
    access_token: Mutex<String>,
    pending: Mutex<Option<PendingAttempt>>,
    exchange_state: Mutex<Option<String>>,
}

impl NativeSession {
    pub(crate) fn manage(app: &AppHandle) {
        let pending = Entry::new(SERVICE, PENDING_ACCOUNT)
            .and_then(|entry| entry.get_password())
            .ok()
            .and_then(|json| serde_json::from_str(&json).ok());
        app.manage(NativeSession {
            access_token: Mutex::new(String::new()),
            pending: Mutex::new(pending),
            exchange_state: Mutex::new(None),
        });
        let handle = app.clone();
        tauri::async_runtime::spawn(async move {
            let _ = Self::restore(&handle).await;
        });
        Self::ensure_dev_callback(app);
    }

    fn ensure_dev_callback(app: &AppHandle) {
        #[cfg(all(debug_assertions, target_os = "macos"))]
        {
            let Ok(binary) = std::env::current_exe() else {
                return;
            };
            let Ok(directory) = app.path().app_data_dir() else {
                return;
            };
            let _ = std::fs::create_dir_all(&directory);
            let marker = directory.join("dev-callback-binary");
            let binary = binary.display().to_string();
            let bundle = directory.join("Notegic Dev.app");
            if marker.exists()
                && std::fs::read_to_string(&marker).ok().as_deref() == Some(binary.as_str())
                && bundle.exists()
            {
                return;
            }
            let script = directory.join("dev-callback.applescript");
            let source = format!(
                "on open location thisURL\n\tdo shell script quoted form of \"{}\" & \" \" & quoted form of thisURL & \" >/dev/null 2>&1 &\"\n\tquit\nend open location\n",
                binary.replace('\\', "\\\\").replace('"', "\\\"")
            );
            if std::fs::write(&script, source).is_err() {
                return;
            }
            let compiled = Command::new("osacompile")
                .args(["-o"])
                .arg(&bundle)
                .arg(&script)
                .status();
            if !compiled.is_ok_and(|status| status.success()) {
                return;
            }
            let info = bundle.join("Contents/Info.plist");
            let _ = Command::new("/usr/libexec/PlistBuddy")
                .args([
                    "-c",
                    "Add :CFBundleURLTypes array",
                    info.to_str().unwrap_or(""),
                ])
                .status();
            for command in [
                "Add :CFBundleURLTypes:0 dict",
                "Add :CFBundleURLTypes:0:CFBundleURLName string Notegic Desktop",
                "Add :CFBundleURLTypes:0:CFBundleURLSchemes array",
                "Add :CFBundleURLTypes:0:CFBundleURLSchemes:0 string com.notegic.desktop",
            ] {
                let _ = Command::new("/usr/libexec/PlistBuddy")
                    .args(["-c", command, info.to_str().unwrap_or("")])
                    .status();
            }
            let _ = Command::new("plutil")
                .args(["-convert", "xml1"])
                .arg(&info)
                .status();
            let listed = std::fs::read_to_string(&info)
                .ok()
                .is_some_and(|xml| xml.contains("com.notegic.desktop"));
            if !listed {
                return;
            }
            let registered = Command::new("/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister")
                .args(["-f"])
                .arg(&bundle)
                .status();
            if registered.is_ok_and(|status| status.success()) {
                let _ = std::fs::write(marker, binary);
            }
        }
        #[cfg(not(all(debug_assertions, target_os = "macos")))]
        {
            let _ = app;
        }
    }

    pub(crate) fn accept_callback(app: &AppHandle, url: &str) {
        if let Err(error) = Self::accept(app, url) {
            let _ = app.emit("native-auth-error", error);
        }
    }

    async fn start_login(&self, api_base: String, authorize_url: String) -> Result<(), String> {
        let verifier = Self::random_token();
        let challenge = Self::challenge(&verifier);
        let csrf_state = Self::random_token();
        let request_id = Self::create_request(&api_base, &challenge, &csrf_state).await?;
        let pending = PendingAttempt {
            state: csrf_state,
            verifier,
            api_base,
        };
        let json = serde_json::to_string(&pending).map_err(|error| error.to_string())?;
        Entry::new(SERVICE, PENDING_ACCOUNT)
            .map_err(|error| error.to_string())?
            .set_password(&json)
            .map_err(|error| error.to_string())?;
        *self.pending.lock().map_err(|error| error.to_string())? = Some(pending);
        *self
            .exchange_state
            .lock()
            .map_err(|error| error.to_string())? = None;
        let url = format!("{authorize_url}#requestId={request_id}");
        Self::open_browser(&url)
    }

    async fn view(&self) -> Result<NativeSessionView, String> {
        let access_token = self
            .access_token
            .lock()
            .map_err(|error| error.to_string())?
            .clone();
        if access_token.is_empty() {
            return Ok(NativeSessionView {
                signed_in: false,
                ..Self::signed_in(access_token, None)
            });
        }
        let api_base = Self::read_refresh()
            .map(|stored| stored.api_base)
            .unwrap_or_default();
        let account = Self::account(&api_base, &access_token).await.ok();
        Ok(Self::signed_in(access_token, account))
    }

    async fn logout(&self, api_base: String) -> Result<(), String> {
        if let Some(stored) = Self::read_refresh() {
            let _ = Self::post_json(
                &format!("{api_base}/auth/native/revoke"),
                serde_json::json!({ "refreshToken": stored.refresh_token }),
            )
            .await;
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
        *session.pending.lock().map_err(|error| error.to_string())? = None;
        let _ = Entry::new(SERVICE, PENDING_ACCOUNT).and_then(|entry| entry.delete_credential());
        let account = Self::account(&pending.api_base, &tokens.access_token)
            .await
            .ok();
        app.emit(
            "native-session",
            Self::signed_in(tokens.access_token, account),
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
        let account = Self::account(&stored.api_base, &tokens.access_token)
            .await
            .ok();
        app.emit(
            "native-session",
            Self::signed_in(tokens.access_token, account),
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

    fn signed_in(access_token: String, account: Option<Account>) -> NativeSessionView {
        let (public_id, name, display_name, email) = match account {
            Some(account) => (
                account.public_id,
                account.name,
                account.display_name,
                account.email,
            ),
            None => (String::new(), String::new(), String::new(), String::new()),
        };
        NativeSessionView {
            signed_in: true,
            access_token,
            public_id,
            name,
            display_name,
            email,
        }
    }

    async fn account(api_base: &str, access_token: &str) -> Result<Account, String> {
        let response = reqwest::Client::builder()
            .user_agent("NotegicDesktop/0.1")
            .build()
            .map_err(|error| error.to_string())?
            .get(format!("{api_base}/users/me"))
            .header("authorization", format!("Bearer {access_token}"))
            .send()
            .await
            .map_err(|error| error.to_string())?;
        let envelope: Envelope<Account> =
            response.json().await.map_err(|error| error.to_string())?;
        envelope.data.ok_or("Account was refused".to_string())
    }

    async fn post_json(url: &str, body: serde_json::Value) -> Result<reqwest::Response, String> {
        reqwest::Client::builder()
            .user_agent("NotegicDesktop/0.1")
            .build()
            .map_err(|error| error.to_string())?
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
pub async fn native_session(state: State<'_, NativeSession>) -> Result<NativeSessionView, String> {
    state.view().await
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
        assert!(
            NativeSession::parse_callback("https://example.test/callback?code=one&state=two")
                .is_err()
        );
        assert!(NativeSession::parse_callback(
            "com.notegic.desktop:/callback?code=one&state=two&extra=3"
        )
        .is_err());
    }
}
