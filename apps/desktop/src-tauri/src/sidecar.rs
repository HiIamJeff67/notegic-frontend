use std::io::{BufRead, BufReader};
use std::process::{Child, Command, Stdio};
use std::sync::Mutex;

use tauri::State;

/* ============================== Sidecar ============================== */

#[derive(serde::Serialize)]
pub(crate) struct Session {
    token: String,
    port: u16,
}

pub(crate) struct Sidecar {
    token: String,
    port: u16,
    child: Mutex<Option<Child>>,
}

impl Sidecar {
    pub(crate) fn start(database_path: &str) -> Self {
        let token = Self::token();
        let port = Self::port();
        let child = Self::spawn(&token, port, database_path);
        Self {
            token,
            port,
            child: Mutex::new(Some(child)),
        }
    }

    pub(crate) fn stop(&self) {
        if let Some(mut child) = self.child.lock().expect("sidecar").take() {
            let _ = child.kill();
            let _ = child.wait();
        }
    }

    fn token() -> String {
        let mut bytes = [0u8; 32];
        getrandom::getrandom(&mut bytes).expect("sidecar token");
        bytes.iter().map(|byte| format!("{byte:02x}")).collect()
    }

    fn port() -> u16 {
        let listener = std::net::TcpListener::bind("127.0.0.1:0").expect("sidecar port");
        listener.local_addr().expect("sidecar port").port()
    }

    fn spawn(token: &str, port: u16, database_path: &str) -> Child {
        let driver =
            std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../sidecars/driver");
        let server = driver.join("server.ts");
        let mut child = Command::new("node")
            .current_dir(&driver)
            .arg("--import")
            .arg("tsx")
            .arg(&server)
            .env("NOTEGIC_SIDECAR_TOKEN", token)
            .env("NOTEGIC_SIDECAR_PORT", port.to_string())
            .env("NOTEGIC_LOCAL_DATABASE_PATH", database_path)
            .stdout(Stdio::piped())
            .stderr(Stdio::inherit())
            .spawn()
            .expect("sidecar");
        let stdout = child.stdout.take().expect("sidecar stdout");
        let mut line = String::new();
        BufReader::new(stdout)
            .read_line(&mut line)
            .expect("sidecar port");
        if !line.starts_with("port ") {
            let _ = child.kill();
            panic!("sidecar did not report a port: {line}");
        }
        child
    }
}

/* ============================== Commands ============================== */

#[tauri::command]
pub fn sidecar_session(state: State<Sidecar>) -> Session {
    Session {
        token: state.token.clone(),
        port: state.port,
    }
}
