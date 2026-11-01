export function splitSvgTextLines(
  text: string,
  maxCharsPerLine: number,
  maxLines = 2
) {
  const safeText = text.trim();
  const safeMaxChars = Math.max(1, Math.floor(maxCharsPerLine));
  if (safeText.length <= safeMaxChars) return [safeText];

  const words = safeText.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    if (nextLine.length <= safeMaxChars) {
      currentLine = nextLine;
      continue;
    }

    if (currentLine) lines.push(currentLine);
    if (word.length > safeMaxChars) {
      lines.push(word.slice(0, safeMaxChars));
      currentLine = word.slice(safeMaxChars);
      continue;
    }
    currentLine = word;
  }

  if (currentLine) lines.push(currentLine);

  if (lines.length <= maxLines) return lines;

  return [
    ...lines.slice(0, maxLines - 1),
    `${lines[maxLines - 1].slice(0, Math.max(1, safeMaxChars - 1))}…`,
  ];
}
