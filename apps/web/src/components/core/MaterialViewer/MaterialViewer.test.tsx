import { getDefaultMaterialMeta } from "@shared/reducers/materialMeta.reducer";
import { renderToString } from "react-dom/server";
import MaterialViewer from "./MaterialViewer";

jest.mock("@/hooks", () => ({
  useShelfItem: () => ({ isItemNodeEditing: () => false }),
}));
jest.mock("@/components/covers/LoadingCover/LoadingCover", () => () => null);
jest.mock("./MaterialImageViewerContent", () => () => <p>Image viewer</p>);
jest.mock("./MaterialAudioViewerContent", () => () => null);
jest.mock("./MaterialVideoViewerContent", () => () => null);
jest.mock("./MaterialTextViewerContent", () => () => <p>Text viewer</p>);
jest.mock("./MaterialUnsupportedViewerContent", () => () => null);
jest.mock("./MaterialPDFViewerContent", () => {
  throw new Error("Browser-only PDF module evaluated during SSR");
});

test.each([
  "text/plain",
  "image/png",
])("imports and server-renders %s without evaluating the PDF module", contentType => {
  const meta = getDefaultMaterialMeta(
    "00000000-0000-4000-8000-000000000001",
    "00000000-0000-4000-8000-000000000002"
  );
  const html = renderToString(
    <MaterialViewer
      materialMeta={{ ...meta, contentType }}
      file={{ isLoading: false, isError: false, onRefresh: () => {} }}
    />
  );
  expect(html).toContain(
    contentType === "text/plain" ? "Text viewer" : "Image viewer"
  );
});
