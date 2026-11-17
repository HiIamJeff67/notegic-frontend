// the sub type to indicate the content type of material files
export enum MaterialContentType {
  None = "none",
  JSON = "application/json",
  PDF = "application/pdf",
  Markdown = "text/markdown",
  PlainText = "text/plain",
  HTML = "text/html",
  PNG = "image/png",
  JPG = "image/jpg",
  JPEG = "image/jpeg",
  GIF = "image/gif",
  SVG = "image/svg+xml",
  WebP = "image/webp",
  MP4 = "video/mp4",
  WebM = "video/webm",
  MP3 = "audio/mpeg",
}

export const AllMaterialContentTypes = Object.values(MaterialContentType);
