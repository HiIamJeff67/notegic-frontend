export const getRequest = (): Request => new Request("http://127.0.0.1/");

export const getRequestHeader = (_name: string): string | undefined =>
  undefined;

export const getRequestHeaders = (): Headers => new Headers();

export const setResponseHeader = (
  _name: string,
  _value: string | string[]
): void => {};

export const setResponseHeaders = (_headers: Headers): void => {};

export const getResponseHeader = (_name: string): string | undefined =>
  undefined;

export const getResponseHeaders = (): Headers => new Headers();

export const removeResponseHeader = (_name: string): void => {};

export const clearResponseHeaders = (): void => {};

export const getResponseStatus = (): number => 200;

export const setResponseStatus = (_code?: number, _text?: string): void => {};
