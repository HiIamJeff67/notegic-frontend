import { getClientRequestHeaders } from "@/api/clientHeaders";
import { useSaveMyMaterialById } from "@/api/hooks/material.hook";
import { MaterialContentType } from "@shared/api/interfaces/enums";
import toast from "@shared/lib/toast";
import {
  DownloadIcon,
  EraserIcon,
  HighlighterIcon,
  MinusIcon,
  MousePointer,
  PencilIcon,
  PlusIcon,
  SaveIcon,
  TypeIcon,
  XIcon,
} from "lucide-react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import * as pdfjs from "pdfjs-dist";
import {
  type FormEvent,
  type MouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import {
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAppRouter } from "@/hooks";
import { translateError } from "@shared/i18n/error";
import { MaterialMeta } from "@shared/reducers/materialMeta.reducer";
import MaterialViewerFrame from "./MaterialViewerFrame";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

interface MaterialPDFViewerContentProps {
  meta: MaterialMeta;
}

interface Annotation {
  id: string;
  type: "highlight" | "text" | "drawing" | "cursor";
  page: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  points?: { x: number; y: number }[];
}

type AnnotationTool = Annotation["type"];

const MaterialPDFViewerContent = ({ meta }: MaterialPDFViewerContentProps) => {
  const router = useAppRouter();
  const { t } = useTranslation();
  const saveMaterialMutator = useSaveMyMaterialById();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const pdfDocumentRef = useRef<pdfjs.PDFDocumentProxy | null>(null);
  const renderTaskRef = useRef<ReturnType<pdfjs.PDFPageProxy["render"]> | null>(
    null
  );
  const renderVersionRef = useRef<number>(0);
  const drawingPointsRef = useRef<{ x: number; y: number }[]>([]);
  const isDrawingRef = useRef<boolean>(false);

  const [pdfDocument, setPdfDocument] = useState<pdfjs.PDFDocumentProxy | null>(
    null
  );
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [currentTool, setCurrentTool] = useState<AnnotationTool>("cursor");
  const [scale, setScale] = useState<number>(1.5);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [textAnnotationPopover, setTextAnnotationPopover] = useState<{
    page: number;
    x: number;
    y: number;
    left: number;
    top: number;
  } | null>(null);
  const [textAnnotationDraft, setTextAnnotationDraft] = useState<string>("");
  const [isApplyingAnnotations, setIsApplyingAnnotations] =
    useState<boolean>(false);
  const contentURL = meta.localContentURL ?? meta.downloadURL;

  const renderAnnotations = (
    context: CanvasRenderingContext2D,
    pageNumber: number
  ) => {
    context.save();

    annotations
      .filter(annotation => annotation.page === pageNumber)
      .forEach(annotation => {
        switch (annotation.type) {
          case "highlight":
            context.fillStyle = "rgba(255, 230, 0, 0.35)";
            context.fillRect(
              annotation.x * scale,
              annotation.y * scale,
              (annotation.width ?? 120) * scale,
              (annotation.height ?? 24) * scale
            );
            break;

          case "text":
            context.fillStyle = "#111827";
            context.font = `${16 * scale}px Arial`;
            context.fillText(
              annotation.text ?? "",
              annotation.x * scale,
              annotation.y * scale
            );
            break;

          case "drawing":
            if (!annotation.points || annotation.points.length < 2) break;
            const [firstPoint, ...nextPoints] = annotation.points;
            if (!firstPoint) break;

            context.strokeStyle = "#ef4444";
            context.lineWidth = 2 * scale;
            context.lineCap = "round";
            context.lineJoin = "round";
            context.beginPath();
            context.moveTo(firstPoint.x * scale, firstPoint.y * scale);
            nextPoints.forEach(point => {
              context.lineTo(point.x * scale, point.y * scale);
            });
            context.stroke();
            break;
        }
      });

    context.restore();
  };

  const renderPage = async (pageNumber: number) => {
    if (!pdfDocument || !canvasRef.current) return;

    const renderVersion = renderVersionRef.current + 1;
    renderVersionRef.current = renderVersion;
    renderTaskRef.current?.cancel();
    renderTaskRef.current = null;
    setIsLoading(true);

    try {
      const page = await pdfDocument.getPage(pageNumber);
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (!context) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;

      const renderTask = page.render({
        canvas,
        canvasContext: context,
        viewport,
      });
      renderTaskRef.current = renderTask;

      await renderTask.promise;
      if (renderVersion !== renderVersionRef.current) return;

      renderAnnotations(context, pageNumber);
      page.cleanup();
    } catch (error) {
      if (
        error instanceof Error &&
        error.name === "RenderingCancelledException"
      ) {
        return;
      }

      if (renderVersion === renderVersionRef.current) {
        setIsAvailable(false);
      }
    } finally {
      if (renderVersion === renderVersionRef.current) {
        renderTaskRef.current = null;
        setIsLoading(false);
      }
    }
  };

  const loadPdf = async (source: string | Uint8Array) => {
    setIsLoading(true);
    setIsAvailable(true);
    setPdfDocument(null);
    setPdfBytes(null);
    setTotalPages(0);

    try {
      if (pdfDocumentRef.current) {
        void pdfDocumentRef.current.destroy();
        pdfDocumentRef.current = null;
      }

      const pdf = await pdfjs.getDocument(
        typeof source === "string" ? source : { data: source.slice() }
      ).promise;
      const data = await pdf.getData();

      pdfDocumentRef.current = pdf;
      setPdfDocument(pdf);
      setPdfBytes(new Uint8Array(data));
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
    } catch {
      setIsAvailable(false);
    } finally {
      setIsLoading(false);
    }
  };

  const getCanvasPoint = (event: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const displayScaleX = canvas.width / rect.width;
    const displayScaleY = canvas.height / rect.height;

    return {
      x: ((event.clientX - rect.left) * displayScaleX) / scale,
      y: ((event.clientY - rect.top) * displayScaleY) / scale,
    };
  };

  const handleCanvasMouseDown = (event: MouseEvent<HTMLCanvasElement>) => {
    if (currentTool === "cursor") return;

    const point = getCanvasPoint(event);
    if (!point) return;

    switch (currentTool) {
      case "highlight":
        setAnnotations(previous => [
          ...previous,
          {
            id: `annotation-${Date.now()}`,
            type: "highlight",
            page: currentPage,
            x: point.x,
            y: point.y,
            width: 120,
            height: 24,
          },
        ]);
        break;

      case "text": {
        const scrollContainer = scrollContainerRef.current;
        if (!scrollContainer) return;

        const rect = scrollContainer.getBoundingClientRect();
        setTextAnnotationDraft("");
        setTextAnnotationPopover({
          page: currentPage,
          x: point.x,
          y: point.y,
          left: event.clientX - rect.left + scrollContainer.scrollLeft,
          top: event.clientY - rect.top + scrollContainer.scrollTop,
        });
        break;
      }

      case "drawing":
        isDrawingRef.current = true;
        drawingPointsRef.current = [point];
        break;
    }
  };

  const handleSubmitTextAnnotation = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!textAnnotationPopover || textAnnotationDraft.trim() === "") return;

    setAnnotations(previous => [
      ...previous,
      {
        id: `annotation-${Date.now()}`,
        type: "text",
        page: textAnnotationPopover.page,
        x: textAnnotationPopover.x,
        y: textAnnotationPopover.y,
        text: textAnnotationDraft.trim(),
      },
    ]);
    setTextAnnotationPopover(null);
    setTextAnnotationDraft("");
  };

  const handleCanvasMouseMove = (event: MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || currentTool !== "drawing") return;

    const point = getCanvasPoint(event);
    const previousPoint =
      drawingPointsRef.current[drawingPointsRef.current.length - 1];
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!point || !previousPoint || !context) return;

    drawingPointsRef.current.push(point);

    context.save();
    context.strokeStyle = "#ef4444";
    context.lineWidth = 2 * scale;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.beginPath();
    context.moveTo(previousPoint.x * scale, previousPoint.y * scale);
    context.lineTo(point.x * scale, point.y * scale);
    context.stroke();
    context.restore();
  };

  const handleCanvasMouseUp = () => {
    if (!isDrawingRef.current) return;

    isDrawingRef.current = false;
    const points = [...drawingPointsRef.current];
    const firstPoint = points[0];
    drawingPointsRef.current = [];

    if (points.length < 2 || !firstPoint) {
      return;
    }

    setAnnotations(previous => [
      ...previous,
      {
        id: `annotation-${Date.now()}`,
        type: "drawing",
        page: currentPage,
        x: firstPoint.x,
        y: firstPoint.y,
        points,
      },
    ]);
  };

  const applyAnnotationsToPdf = async () => {
    if (!pdfBytes) throw new Error("PDF is not loaded");

    const pdf = await PDFDocument.load(pdfBytes);
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const pages = pdf.getPages();

    annotations.forEach(annotation => {
      const page = pages[annotation.page - 1];
      if (!page) return;

      const { height } = page.getSize();

      switch (annotation.type) {
        case "highlight":
          page.drawRectangle({
            x: annotation.x,
            y: height - annotation.y - (annotation.height ?? 24),
            width: annotation.width ?? 120,
            height: annotation.height ?? 24,
            color: rgb(1, 0.9, 0),
            opacity: 0.35,
          });
          break;

        case "text":
          page.drawText(annotation.text ?? "", {
            x: annotation.x,
            y: height - annotation.y - 16,
            size: 16,
            font,
            color: rgb(0.07, 0.09, 0.15),
          });
          break;

        case "drawing":
          annotation.points?.slice(1).forEach((point, index) => {
            const previousPoint = annotation.points?.[index];
            if (!point || !previousPoint) return;

            page.drawLine({
              start: {
                x: previousPoint.x,
                y: height - previousPoint.y,
              },
              end: {
                x: point.x,
                y: height - point.y,
              },
              thickness: 2,
              color: rgb(0.94, 0.27, 0.27),
              opacity: 0.9,
            });
          });
          break;
      }
    });

    return new Uint8Array(await pdf.save());
  };

  const downloadPdfBytes = (bytes: Uint8Array, fileName: string) => {
    const pdfBytes = new Uint8Array(bytes);
    const blob = new Blob([pdfBytes.buffer as ArrayBuffer], {
      type: "application/pdf",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = fileName.toLowerCase().endsWith(".pdf")
      ? fileName
      : `${fileName}.pdf`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const handleSave = async () => {
    if (annotations.length === 0) return;

    setIsApplyingAnnotations(true);

    try {
      const nextPdfBytes = await applyAnnotationsToPdf();
      const nextFile = new File(
        [nextPdfBytes],
        meta.name.toLowerCase().endsWith(".pdf")
          ? meta.name
          : `${meta.name}.pdf`,
        { type: "application/pdf" }
      );
      await saveMaterialMutator.mutateAsync({
        header: getClientRequestHeaders(navigator.userAgent),
        body: {
          materialId: meta.id,
          contentFile: nextFile,
        },
        affected: {
          parentSubShelfId: meta.parentId,
        },
      });
      router.refresh();
      toast.success(t("workspace.notifications.pdfAnnotationsSaved"));
      setAnnotations([]);
      await loadPdf(nextPdfBytes);
    } catch (error) {
      toast.error(translateError(error, t));
    } finally {
      setIsApplyingAnnotations(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!pdfBytes) return;

    downloadPdfBytes(pdfBytes, meta.name);
    toast.success(t("workspace.notifications.pdfDownloaded"));
  };

  const handleDownloadAnnotatedPdf = async () => {
    if (!pdfBytes || annotations.length === 0) return;

    setIsApplyingAnnotations(true);

    try {
      const nextPdfBytes = await applyAnnotationsToPdf();
      downloadPdfBytes(nextPdfBytes, meta.name);
      toast.success(t("workspace.notifications.annotatedPdfDownloaded"));
    } catch (error) {
      toast.error(translateError(error, t));
    } finally {
      setIsApplyingAnnotations(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable
      ) {
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void handleSave();
        return;
      }

      switch (event.key) {
        case "h":
        case "H":
          setCurrentTool(currentTool === "highlight" ? "cursor" : "highlight");
          break;
        case "t":
        case "T":
          setCurrentTool(currentTool === "text" ? "cursor" : "text");
          break;
        case "d":
        case "D":
          setCurrentTool(currentTool === "drawing" ? "cursor" : "drawing");
          break;
        case "Escape":
          setCurrentTool("cursor");
          break;
        case "-":
          setScale(currentScale => Math.max(0.5, currentScale - 0.25));
          break;
        case "0":
          setScale(1);
          break;
        case "+":
        case "=":
          setScale(currentScale => Math.min(3, currentScale + 0.25));
          break;
        case "ArrowLeft":
          setCurrentPage(page => Math.max(1, page - 1));
          break;
        case "ArrowRight":
          setCurrentPage(page => Math.min(totalPages, page + 1));
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentTool, totalPages, annotations.length, pdfBytes]);

  useEffect(() => {
    if (!contentURL) return;

    void loadPdf(contentURL);

    return () => {
      renderTaskRef.current?.cancel();
      if (pdfDocumentRef.current) {
        void pdfDocumentRef.current.destroy();
        pdfDocumentRef.current = null;
      }
    };
  }, [contentURL]);

  useEffect(() => {
    void renderPage(currentPage);
  }, [pdfDocument, currentPage, scale, annotations]);

  return (
    <MaterialViewerFrame
      meta={meta}
      materialContentType={MaterialContentType.PDF}
      contentClassName="p-0 overflow-hidden"
      toolbarChildren={
        <>
          <ButtonGroup>
            <ButtonGroup>
              <Button
                disabled={scale <= 0.5 || isLoading}
                variant="outline"
                size="sm"
                onClick={() =>
                  setScale(currentScale => Math.max(0.5, currentScale - 0.25))
                }
              >
                <MinusIcon />
              </Button>
              <Button
                disabled={scale >= 3 || isLoading}
                variant="outline"
                size="sm"
                onClick={() =>
                  setScale(currentScale => Math.min(3, currentScale + 0.25))
                }
              >
                <PlusIcon />
              </Button>
            </ButtonGroup>
            <ButtonGroup>
              <Button
                disabled={annotations.length === 0 || isLoading}
                variant="outline"
                size="sm"
                onClick={() => setAnnotations([])}
              >
                <EraserIcon />
              </Button>
            </ButtonGroup>
          </ButtonGroup>
          <ToggleGroup
            type="single"
            value={currentTool}
            onValueChange={value =>
              setCurrentTool((value || "cursor") as AnnotationTool)
            }
            variant="outline"
            size="sm"
          >
            <ToggleGroupItem
              disabled={!pdfDocument || isLoading}
              value="highlight"
              aria-label={t("workspace.viewer.highlight")}
            >
              <HighlighterIcon />
            </ToggleGroupItem>
            <ToggleGroupItem
              disabled={!pdfDocument || isLoading}
              value="text"
              aria-label={t("workspace.viewer.text")}
            >
              <TypeIcon />
            </ToggleGroupItem>
            <ToggleGroupItem
              disabled={!pdfDocument || isLoading}
              value="drawing"
              aria-label={t("workspace.viewer.drawing")}
            >
              <PencilIcon />
            </ToggleGroupItem>
            <ToggleGroupItem
              disabled={!pdfDocument || isLoading}
              value="cursor"
              aria-label={t("workspace.viewer.cancel")}
            >
              <MousePointer />
            </ToggleGroupItem>
          </ToggleGroup>
        </>
      }
      menubarChildren={
        <MenubarMenu>
          <MenubarTrigger>{t("workspace.viewer.edit")}</MenubarTrigger>
          <MenubarContent align="end" side="bottom">
            <MenubarItem
              disabled={scale <= 0.5 || isLoading}
              onSelect={() =>
                setScale(currentScale => Math.max(0.5, currentScale - 0.25))
              }
            >
              <MinusIcon />
              {t("workspace.viewer.zoomOut")}
              <MenubarShortcut>-</MenubarShortcut>
            </MenubarItem>
            <MenubarItem disabled={isLoading} onSelect={() => setScale(1)}>
              {t("workspace.viewer.resetZoom", {
                percent: Math.round(scale * 100),
              })}
              <MenubarShortcut>0</MenubarShortcut>
            </MenubarItem>
            <MenubarItem
              disabled={scale >= 3 || isLoading}
              onSelect={() =>
                setScale(currentScale => Math.min(3, currentScale + 0.25))
              }
            >
              <PlusIcon />
              {t("workspace.viewer.zoomIn")}
              <MenubarShortcut>+</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem
              disabled={currentPage <= 1 || isLoading}
              onSelect={() => setCurrentPage(page => Math.max(1, page - 1))}
            >
              {t("workspace.viewer.previousPage")}
              <MenubarShortcut>←</MenubarShortcut>
            </MenubarItem>
            <MenubarItem
              disabled={currentPage >= totalPages || isLoading}
              onSelect={() =>
                setCurrentPage(page => Math.min(totalPages, page + 1))
              }
            >
              {t("workspace.viewer.nextPage", {
                current: currentPage,
                total: totalPages || 1,
              })}
              <MenubarShortcut>→</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      }
      fileAdditionalMenubarChildren={
        <>
          <MenubarItem disabled={!pdfBytes} onSelect={handleDownloadPdf}>
            <DownloadIcon />
            {t("workspace.viewer.downloadPdf")}
          </MenubarItem>
          <MenubarItem
            disabled={annotations.length === 0 || isApplyingAnnotations}
            onSelect={handleDownloadAnnotatedPdf}
          >
            <DownloadIcon />
            {t("workspace.viewer.downloadAnnotatedPdf")}
          </MenubarItem>
          <MenubarItem
            disabled={annotations.length === 0 || isApplyingAnnotations}
            onSelect={handleSave}
          >
            <SaveIcon />
            {t("workspace.viewer.saveAnnotations")}
            <MenubarShortcut>⌘S</MenubarShortcut>
          </MenubarItem>
        </>
      }
    >
      <div className="w-full h-full min-w-0 min-h-0 overflow-hidden flex flex-col bg-neutral-900">
        <div
          ref={scrollContainerRef}
          className="relative w-full min-w-0 flex-1 min-h-0 overflow-auto overscroll-contain bg-neutral-900 p-4"
          style={{ overscrollBehavior: "contain" }}
          onWheel={event => event.stopPropagation()}
        >
          {isLoading && (
            <div className="sticky top-4 z-10 mx-auto w-fit rounded-md bg-neutral-800/95 px-4 py-2 text-sm text-neutral-100 shadow-lg">
              {t("workspace.viewer.loadingPdf")}
            </div>
          )}
          {!isAvailable && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-neutral-100">
              {t("workspace.viewer.failedPdfPreview")}
            </div>
          )}
          <div className="w-max min-w-full min-h-full flex items-start justify-center">
            <div className="shrink-0 bg-white shadow-lg">
              <canvas
                ref={canvasRef}
                className={`block max-w-none ${
                  currentTool === "cursor"
                    ? "cursor-default"
                    : "cursor-crosshair"
                }`}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
              />
            </div>
          </div>
          <Popover
            open={textAnnotationPopover !== null}
            onOpenChange={open => {
              if (open) return;
              setTextAnnotationPopover(null);
              setTextAnnotationDraft("");
            }}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                aria-label={t("workspace.viewer.textAnnotationPosition")}
                className="absolute size-1 -translate-x-1/2 -translate-y-1/2 opacity-0"
                style={{
                  left: textAnnotationPopover?.left ?? 0,
                  top: textAnnotationPopover?.top ?? 0,
                }}
              />
            </PopoverTrigger>
            <PopoverContent
              align="start"
              side="right"
              className="w-72"
              onOpenAutoFocus={event => event.preventDefault()}
            >
              <form
                className="flex items-center gap-2"
                onSubmit={handleSubmitTextAnnotation}
              >
                <Input
                  autoFocus
                  value={textAnnotationDraft}
                  onChange={event => setTextAnnotationDraft(event.target.value)}
                  placeholder={t("workspace.viewer.inputText")}
                />
                <Button variant="secondary" type="submit" size="sm">
                  {t("workspace.viewer.add")}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setTextAnnotationPopover(null);
                    setTextAnnotationDraft("");
                  }}
                >
                  <XIcon />
                </Button>
              </form>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </MaterialViewerFrame>
  );
};

export default MaterialPDFViewerContent;
