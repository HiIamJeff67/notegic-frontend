import { createFileRoute } from "@tanstack/react-router";
import NativeAuthorizePage from "@/pages/native/NativeAuthorizePage";
import { createPrivatePageHead } from "@/seo/publicPage";

export const Route = createFileRoute("/native/authorize")({
  head: () => ({
    ...createPrivatePageHead(),
    meta: [
      ...(createPrivatePageHead().meta ?? []),
      { name: "referrer", content: "no-referrer" },
    ],
  }),
  component: NativeAuthorizePage,
});
