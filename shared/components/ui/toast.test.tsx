import {
  ToastProvider,
  toastManager,
  useToastManager,
} from "@shared/components/ui/toast";
import toast from "@shared/lib/toast/toast";
import { createElement } from "react";
import { renderToString } from "react-dom/server";

function Probe() {
  const { toasts } = useToastManager();
  return createElement("output", null, toasts.length);
}

describe("Base UI Toast server rendering", () => {
  it("keeps each server render empty without retaining request notifications", () => {
    toast.success("Previous request");
    const render = () =>
      renderToString(
        createElement(ToastProvider, { toastManager }, createElement(Probe))
      );
    expect(render()).toBe("<output>0</output>");
    toast.error("Another request");
    expect(render()).toBe("<output>0</output>");
  });
});
