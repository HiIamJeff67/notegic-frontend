import type { UUID } from "crypto";
import { WebDevelopmentVersion, WebTestVersion } from "./version.constants";
/* ============================== Frontend Web URL ============================== */

export const WebDevelopmentNamespace = "development";
export const WebProductionNamespace = ""; // leave this empty for the clean web url of frontend
export const WebTestNamespace = "test";

export const WebDevelopmentBaseURL =
  WebDevelopmentNamespace + "/" + WebDevelopmentVersion;
export const WebProductionBaseURL = ""; // leave this empty for the clean web url of frontend
export const WebTestBaseURL = WebTestNamespace + "/" + WebTestVersion;

export const CurrentWebBaseURL = WebDevelopmentBaseURL;

export const WebURLPathDictionary = {
  home: "",
  document: "document",
  tutorial: "tutorial",
  privacyPolicy: "privacy-policy",
  auth: {
    register: "register",
    login: "login",
    forgetPassword: "forgetPassword",
    redirect: {
      error: (title?: string, description?: string) =>
        `redirect/error?title=${title}&description=${description}`,
      google: "redirect/google",
      meta: "redirect/meta",
    },
  },
  oauth: {
    // the url to start the oauth services
    google: (qs: string) => {
      return `https://accounts.google.com/o/oauth2/v2/auth?${qs}`;
    },
    x: (qs: string) => {
      return `https://x.com/i/oauth2/authorize?${qs}`;
    },
  },
  app: {
    materialViewer: {
      _: "app/material-viewer",
      byId: (materialId: UUID, parentSubShelfId: UUID, rootShelfId: UUID) =>
        `app/material-viewer/${materialId}?parentSubShelfId=${parentSubShelfId}&rootShelfId=${rootShelfId}`,
      notFound: "app/material-viewer/not-found",
    },
    blockPackEditor: {
      index: "app/block-pack-editor",
      _: (blockPackId: UUID, parentSubShelfId: UUID, rootShelfId: UUID) =>
        `app/block-pack-editor/${blockPackId}?parentSubShelfId=${parentSubShelfId}&rootShelfId=${rootShelfId}`,
    },
    dashboard: {
      _: "app/dashboard",
    },
    trash: "app/trash",
    routines: {
      _: "app/routines",
      byStationId: (stationId: UUID) => `app/routines/${stationId}`,
    },
    setting: {
      account: "app/setting/account",
      preferences: "app/setting/preferences",
    },
  },
};
