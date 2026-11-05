import { renderToString } from "react-dom/server";
import { useNetwork } from "./useNetwork";

const Probe = () => <span>{String(useNetwork().isOnline)}</span>;

test.each([
  undefined,
  false,
  true,
])("SSR keeps a deterministic network snapshot when Node navigator.onLine is %s", onLine => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  try {
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: { onLine },
    });
    expect(renderToString(<Probe />)).toBe("<span>true</span>");
  } finally {
    if (previous) Object.defineProperty(globalThis, "navigator", previous);
    else Reflect.deleteProperty(globalThis, "navigator");
  }
});
