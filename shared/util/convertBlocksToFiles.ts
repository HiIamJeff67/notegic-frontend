import { BlockNoteEditor } from "@blocknote/core";
import { diagramBlockMapping as diagramDocxBlockMapping } from "@blocknote/diagram-block/docx-exporter";
import { diagramBlockMapping as diagramPdfBlockMapping } from "@blocknote/diagram-block/pdf-exporter";
import {
  inlineMathMapping as inlineMathDocxMapping,
  mathBlockMapping as mathDocxBlockMapping,
} from "@blocknote/math-block/docx-exporter";
import {
  inlineMathMapping as inlineMathPdfMapping,
  mathBlockMapping as mathPdfBlockMapping,
} from "@blocknote/math-block/pdf-exporter";
import {
  DOCXExporter,
  docxDefaultSchemaMappings,
} from "@blocknote/xl-docx-exporter";
import {
  PDFExporter,
  pdfDefaultSchemaMappings,
} from "@blocknote/xl-pdf-exporter";
import * as ReactPDF from "@react-pdf/renderer";
import { Packer, Paragraph } from "docx";
import * as React from "react";

const calendarPdfBlockMapping = () =>
  React.createElement(ReactPDF.Text, null, "Calendar");

const calendarDocxBlockMapping = () => new Paragraph("Calendar");

export async function convertBlocksToMarkdown(
  editor: BlockNoteEditor
): Promise<Blob> {
  const markdown = await editor.blocksToMarkdownLossy();
  return new Blob([markdown], { type: "text/markdown" });
}

export async function convertBlocksToHTML(
  editor: BlockNoteEditor
): Promise<Blob> {
  const html = await editor.blocksToHTMLLossy();
  const fullHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
  </style>
</head>
<body>
  ${html}
</body>
</html>`;
  return new Blob([fullHTML], { type: "text/html" });
}

export async function convertBlocksToPlainText(
  editor: BlockNoteEditor
): Promise<Blob> {
  const markdown = await editor.blocksToMarkdownLossy();
  const plainText = markdown
    .replaceAll(/#{1,6}\s/g, "") // 移除標題符號
    .replaceAll(/\*\*(.+?)\*\*/g, "$1") // 移除粗體
    .replaceAll(/\*(.+?)\*/g, "$1") // 移除斜體
    .replaceAll(/\[(.+?)\]\(.+?\)/g, "$1") // 移除連結，保留文字
    .replaceAll(/`(.+?)`/g, "$1") // 移除行內程式碼
    .replaceAll(/```[\s\S]*?```/g, "") // 移除程式碼區塊
    .replaceAll(/^\s*[-*+]\s/gm, "") // 移除清單符號
    .replaceAll(/^\s*\d+\.\s/gm, ""); // 移除數字清單
  const blob = new Blob([plainText], { type: "text/plain" });
  return blob;
}

export async function convertBlocksToJSON(
  editor: BlockNoteEditor
): Promise<Blob> {
  const json = JSON.stringify(editor.document);
  return new Blob([json], { type: "application/json" });
}

export async function convertBlocksToPDF(
  editor: BlockNoteEditor<any, any, any>
): Promise<Blob> {
  const mappings = {
    ...pdfDefaultSchemaMappings,
    blockMapping: {
      ...pdfDefaultSchemaMappings.blockMapping,
      mathBlock: mathPdfBlockMapping,
      diagram: diagramPdfBlockMapping,
      calendar: calendarPdfBlockMapping,
    },
    inlineContentMapping: {
      ...pdfDefaultSchemaMappings.inlineContentMapping,
      math: inlineMathPdfMapping,
    },
  } as any;
  const exporter = new PDFExporter(editor.schema, mappings);
  const pdfDocument = await exporter.toReactPDFDocument(editor.document);
  return await ReactPDF.pdf(pdfDocument).toBlob();
}

export async function convertBlocksToDOCX(
  editor: BlockNoteEditor<any, any, any>
): Promise<Blob> {
  const mappings = {
    ...docxDefaultSchemaMappings,
    blockMapping: {
      ...docxDefaultSchemaMappings.blockMapping,
      mathBlock: mathDocxBlockMapping,
      diagram: diagramDocxBlockMapping,
      calendar: calendarDocxBlockMapping,
    },
    inlineContentMapping: {
      ...docxDefaultSchemaMappings.inlineContentMapping,
      math: inlineMathDocxMapping,
    },
  } as any;
  const exporter = new DOCXExporter(editor.schema, mappings);
  const docxDocument = await exporter.toDocxJsDocument(editor.document);
  return await Packer.toBlob(docxDocument);
}
