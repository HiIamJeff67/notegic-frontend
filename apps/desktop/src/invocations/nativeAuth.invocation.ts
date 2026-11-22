import { APIURLPathDictionary } from "@shared/lib/url/api";
import { WebURLPathDictionary } from "@shared/lib/url/web";
import { invoke } from "@tauri-apps/api/core";

export const startNativeLogin = () =>
  invoke("start_native_login", {
    apiBase: APIURLPathDictionary.base(),
    authorizeUrl: WebURLPathDictionary.nativeLogin(),
  });

export const startNativeRegister = () =>
  invoke("start_native_login", {
    apiBase: APIURLPathDictionary.base(),
    authorizeUrl: WebURLPathDictionary.nativeRegister(),
  });

export const logoutNative = () =>
  invoke("logout_native", {
    apiBase: APIURLPathDictionary.base(),
  });

export const readNativeSession = () =>
  invoke<{
    signedIn: boolean;
    accessToken: string;
    publicId: string;
    name: string;
    displayName: string;
    email: string;
  }>("native_session");
