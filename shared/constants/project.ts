import { Environment } from "@shared/types/environment.type";

export const ServiceName = "notegic-frontend";

export const CurrentEnvironment: Environment = ((): Environment => {
  const runtimeEnvironment =
    import.meta.env.NODE_ENV ??
    import.meta.env.MODE ??
    (typeof process !== "undefined" ? process.env.NODE_ENV : undefined);

  switch (runtimeEnvironment) {
    case Environment.Production:
      return Environment.Production;
    case Environment.Test:
      return Environment.Test;
    case Environment.Development:
      return Environment.Development;
    default:
      return Environment.Development;
  }
})();
