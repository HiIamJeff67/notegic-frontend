import type { UUID } from "crypto";

export const WebURLPathDictionary = {
  home: "",
  document: "document",
  privacyPolicy: "privacy-policy",
  auth: {
    register: "register",
    login: "login",
    forgetPassword: "forgetPassword",
    redirect: {
      google: "redirect/google",
      github: "redirect/github",
      x: "redirect/x",
      discord: "redirect/discord",
      apple: "redirect/apple",
    },
  },
  oauth: {
    // the url to start the oauth services
    google: (qs: string) => {
      return `https://accounts.google.com/o/oauth2/v2/auth?${qs}`;
    },
    github: (qs: string) => `https://github.com/login/oauth/authorize?${qs}`,
    x: (qs: string) => {
      return `https://x.com/i/oauth2/authorize?${qs}`;
    },
    discord: (qs: string) => `https://discord.com/oauth2/authorize?${qs}`,
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
      _: (blockPackId: UUID) => `app/block-pack-editor/${blockPackId}`,
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
