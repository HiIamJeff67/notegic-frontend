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
