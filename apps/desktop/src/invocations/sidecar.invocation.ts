import { invoke } from "@tauri-apps/api/core";

export const sidecarSession = () =>
  invoke<{ port: number; token: string }>("sidecar_session");
