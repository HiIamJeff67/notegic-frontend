export const requiresCrossOriginIsolation = (
  pathname: string,
  basePath = "/"
): boolean => {
  const base = basePath.replace(/^\/+|\/+$/g, "");
  const documentPath = `${base ? `/${base}` : ""}/document`;
  return pathname !== documentPath && pathname !== `${documentPath}/`;
};

export const getCrossOriginIsolationHeaders = (
  pathname: string,
  basePath = "/"
) => ({
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Embedder-Policy": requiresCrossOriginIsolation(
    pathname,
    basePath
  )
    ? "require-corp"
    : "unsafe-none",
});
