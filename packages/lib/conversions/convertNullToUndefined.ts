type NullToUndefined<T> = {
  [K in keyof T]: T[K] extends null ? undefined : T[K] | undefined;
};

export function convertNullToUndefined<T extends Record<string, any>>(
  obj: T
): NullToUndefined<T> {
  const result = { ...obj } as NullToUndefined<T>;
  for (const key in result) {
    if (result[key] === null) {
      result[key] = undefined;
    }
  }
  return result;
}
