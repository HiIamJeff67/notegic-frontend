import "i18next";
import { resources } from "@shared/i18n";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: (typeof resources)["en"];
    strictKeyChecks: true;
  }
}
