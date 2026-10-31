export type ByteType = number;

export const Byte: ByteType = 1;
export const KB: ByteType = 1000 * Byte;
export const MB: ByteType = 1000 * KB;
export const GB: ByteType = 1000 * MB;
export const TB: ByteType = 1000 * GB;

export const formatByteSize = (
  bytes = 0,
  maximumFractionDigits = 0
): string => {
  const gigabyte = 1024 ** 3;
  const megabyte = 1024 ** 2;
  const size = bytes >= gigabyte ? bytes / gigabyte : bytes / megabyte;
  const unit = bytes >= gigabyte ? "GB" : "MB";
  const formattedSize =
    maximumFractionDigits > 0
      ? size.toFixed(maximumFractionDigits)
      : String(Math.round(size));

  return `${formattedSize} ${unit}`;
};
