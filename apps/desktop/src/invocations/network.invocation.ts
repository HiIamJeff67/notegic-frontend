import { invoke } from "@tauri-apps/api/core";

export const readNetworkOnline = () => invoke<boolean>("network_status");
