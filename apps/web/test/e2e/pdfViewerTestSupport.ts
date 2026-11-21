import * as pdfjs from "pdfjs-dist";

export const renderPDF = async (bytes: number[]) => {
  // Run the actual viewer's worker configuration before opening a document.
  await import("@/components/core/MaterialViewer/MaterialPDFViewerContent");
  const task = pdfjs.getDocument({ data: new Uint8Array(bytes) });
  try {
    const document = await task.promise;
    const page = await document.getPage(1);
    const viewport = page.getViewport({ scale: 1 });
    const canvas = window.document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext("2d")!;
    await page.render({ canvasContext: context, canvas, viewport }).promise;
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    return {
      pages: document.numPages,
      width: canvas.width,
      height: canvas.height,
      hasInk: pixels.some((value, index) => index % 4 !== 3 && value < 200),
      workerURL: pdfjs.GlobalWorkerOptions.workerSrc,
    };
  } finally {
    await task.destroy();
  }
};
