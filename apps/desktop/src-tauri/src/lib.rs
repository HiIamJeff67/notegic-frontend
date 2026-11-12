use std::io::{BufRead, BufReader};
use std::process::{Child, Command, Stdio};
use std::sync::Mutex;

use tauri::{Manager, RunEvent, State};

struct Sidecar {
    token: String,
    port: u16,
    child: Mutex<Option<Child>>,
}

#[derive(serde::Serialize)]
struct SidecarSession {
    token: String,
    port: u16,
}

#[tauri::command]
fn sidecar_session(state: State<Sidecar>) -> SidecarSession {
    SidecarSession {
        token: state.token.clone(),
        port: state.port,
    }
}

fn launch_token() -> String {
    let mut bytes = [0u8; 32];
    getrandom::getrandom(&mut bytes).expect("sidecar token");
    bytes.iter().map(|byte| format!("{byte:02x}")).collect()
}

fn free_port() -> u16 {
    let listener = std::net::TcpListener::bind("127.0.0.1:0").expect("sidecar port");
    listener.local_addr().expect("sidecar port").port()
}

fn start_sidecar(token: &str, port: u16) -> Child {
    let server =
        std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../sidecar/server.mjs");
    let mut child = Command::new("node")
        .arg(&server)
        .env("NOTEGIC_SIDECAR_TOKEN", token)
        .env("NOTEGIC_SIDECAR_PORT", port.to_string())
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

fn stop_sidecar(app: &tauri::AppHandle) {
    if let Some(sidecar) = app.try_state::<Sidecar>() {
        if let Some(mut child) = sidecar.child.lock().expect("sidecar").take() {
            let _ = child.kill();
            let _ = child.wait();
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let token = launch_token();
    let port = free_port();
    let child = start_sidecar(&token, port);

    tauri::Builder::default()
        .manage(Sidecar {
            token,
            port,
            child: Mutex::new(Some(child)),
        })
        .invoke_handler(tauri::generate_handler![sidecar_session])
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(|app, event| {
            if let RunEvent::Exit = event {
                stop_sidecar(app);
            }
        });
}
