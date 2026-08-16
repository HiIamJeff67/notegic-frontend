export class CSRFTokenGenerator {
  private static readonly CSRFTokenPrefix = "notegic_csrf_token_";

  static generate = (): string => {
    if (typeof window === "undefined") return "";
    const array = new Uint32Array(4);
    window.crypto.getRandomValues(array);
    return Array.from(array, dec => dec.toString(16).padStart(8, "0")).join("");
  };
}
