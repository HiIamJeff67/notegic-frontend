export const isColor = (value: string): boolean =>
  /^#[0-9a-fA-F]{6}$/.test(value);
