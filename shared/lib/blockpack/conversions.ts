import type { BlockNoteEditor } from "@blocknote/core";
import { DOCXExporter } from "@blocknote/xl-docx-exporter";
import { PDFExporter } from "@blocknote/xl-pdf-exporter";
import * as ReactPDF from "@react-pdf/renderer";
import { Packer } from "docx";
import { createDocxMapping, createPdfMapping } from "./mapping";

export enum FileContentType {
  Markdown = "text/plain",
  PlainText = "text/plain",
  HTML = "text/html",
  JSON = "application/json",
  PDF = "application/pdf",
  DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}

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
    .replaceAll(/#{1,6}\s/g, "") // Remove heading markers.
    .replaceAll(/\*\*(.+?)\*\*/g, "$1") // Remove bold markers.
    .replaceAll(/\*(.+?)\*/g, "$1") // Remove italic markers.
    .replaceAll(/\[(.+?)\]\(.+?\)/g, "$1") // Keep link text without the URL.
    .replaceAll(/`(.+?)`/g, "$1") // Remove inline code markers.
    .replaceAll(/```[\s\S]*?```/g, "") // Remove fenced code blocks.
    .replaceAll(/^\s*[-*+]\s/gm, "") // Remove unordered list markers.
    .replaceAll(/^\s*\d+\.\s/gm, ""); // Remove ordered list markers.
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
  const mappings = createPdfMapping();
  const exporter = new PDFExporter(editor.schema, mappings);
  const pdfDocument = await exporter.toReactPDFDocument(editor.document);
  return await ReactPDF.pdf(pdfDocument).toBlob();
}

export async function convertBlocksToDOCX(
  editor: BlockNoteEditor<any, any, any>
): Promise<Blob> {
  const mappings = createDocxMapping();
  const exporter = new DOCXExporter(editor.schema, mappings);
  const docxDocument = await exporter.toDocxJsDocument(editor.document);
  return await Packer.toBlob(docxDocument);
}
