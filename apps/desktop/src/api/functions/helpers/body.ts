export const withoutPathParams = <T extends Record<string, unknown>>(
  body: T,
  ...keys: PropertyKey[]
): Partial<T> => {
  const payload = { ...body };
  for (const key of keys) delete (payload as Record<PropertyKey, unknown>)[key];
  return payload;
};
