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
import { docxDefaultSchemaMappings } from "@blocknote/xl-docx-exporter";
import { pdfDefaultSchemaMappings } from "@blocknote/xl-pdf-exporter";
import * as ReactPDF from "@react-pdf/renderer";
import { Paragraph } from "docx";
import * as React from "react";

export function createPdfMapping() {
  return {
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
}

export function createDocxMapping() {
  return {
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
}

const calendarPdfBlockMapping = () =>
  React.createElement(ReactPDF.Text, null, "Calendar");

const calendarDocxBlockMapping = () => new Paragraph("Calendar");
