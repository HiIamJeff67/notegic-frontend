import { WidgetProps } from "@widgets/widget";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type GuideStep = {
  id: string;
  title: string;
  summary: string;
  detail: string;
};

type GuidePage = {
  title: string;
  description: string;
  steps: GuideStep[];
};

const GuideWidget = ({ className, style, data, setData }: WidgetProps) => {
  const { t } = useTranslation();
  const [pageIndex, setPageIndex] = useState(0);
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);

  const pages: GuidePage[] = [
    {
      title: t("workspace.widgets.guideFirstStepsTitle"),
      description: t("workspace.widgets.guideFirstStepsDescription"),
      steps: [
        {
          id: "create-home",
          title: t("workspace.widgets.guideHomeStep1Title"),
          summary: t("workspace.widgets.guideHomeStep1Summary"),
          detail: t("workspace.widgets.guideHomeStep1Detail"),
        },
        {
          id: "name-home",
          title: t("workspace.widgets.guideHomeStep2Title"),
          summary: t("workspace.widgets.guideHomeStep2Summary"),
          detail: t("workspace.widgets.guideHomeStep2Detail"),
        },
        {
          id: "open-dashboard",
          title: t("workspace.widgets.guideHomeStep3Title"),
          summary: t("workspace.widgets.guideHomeStep3Summary"),
          detail: t("workspace.widgets.guideHomeStep3Detail"),
        },
      ],
    },
    {
      title: t("workspace.widgets.guideOrganizeTitle"),
      description: t("workspace.widgets.guideOrganizeDescription"),
      steps: [
        {
          id: "add-material",
          title: t("workspace.widgets.guideOrganizeStep1Title"),
          summary: t("workspace.widgets.guideOrganizeStep1Summary"),
          detail: t("workspace.widgets.guideOrganizeStep1Detail"),
        },
        {
          id: "group-content",
          title: t("workspace.widgets.guideOrganizeStep2Title"),
          summary: t("workspace.widgets.guideOrganizeStep2Summary"),
          detail: t("workspace.widgets.guideOrganizeStep2Detail"),
        },
        {
          id: "use-search",
          title: t("workspace.widgets.guideOrganizeStep3Title"),
          summary: t("workspace.widgets.guideOrganizeStep3Summary"),
          detail: t("workspace.widgets.guideOrganizeStep3Detail"),
        },
      ],
    },
    {
      title: t("workspace.widgets.guideRoutineTitle"),
      description: t("workspace.widgets.guideRoutineDescription"),
      steps: [
        {
          id: "create-routine",
          title: t("workspace.widgets.guideRoutineStep1Title"),
          summary: t("workspace.widgets.guideRoutineStep1Summary"),
          detail: t("workspace.widgets.guideRoutineStep1Detail"),
        },
        {
          id: "choose-schedule",
          title: t("workspace.widgets.guideRoutineStep2Title"),
          summary: t("workspace.widgets.guideRoutineStep2Summary"),
          detail: t("workspace.widgets.guideRoutineStep2Detail"),
        },
        {
          id: "review-routine",
          title: t("workspace.widgets.guideRoutineStep3Title"),
          summary: t("workspace.widgets.guideRoutineStep3Summary"),
          detail: t("workspace.widgets.guideRoutineStep3Detail"),
        },
      ],
    },
  ];

  const page = pages[pageIndex];
  const completedSteps =
    data?.completedSteps && typeof data.completedSteps === "object"
      ? data.completedSteps
      : {};

  const setStepCompleted = (stepId: string, completed: boolean) => {
    setData({
      ...data,
      completedSteps: { ...completedSteps, [stepId]: completed },
    });
  };

  return (
    <div
      className={`flex h-full w-full min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-card p-4 ${className ?? ""}`}
      style={style}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <BookOpen className="size-4 shrink-0 text-primary" />
            <h2 className="font-semibold text-foreground">
              {t("workspace.widgets.guideTitle")}
            </h2>
          </div>
        </div>
        <span className="shrink-0 rounded-full border border-border px-2 py-1 font-mono text-[11px] text-muted-foreground">
          {pageIndex + 1} / {pages.length}
        </span>
      </div>

      <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
        <h3 className="text-base font-semibold text-foreground">
          {page.title}
        </h3>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {page.description}
        </p>
        <div className="mt-3 space-y-2">
          {page.steps.map(step => {
            const completed = completedSteps[step.id] === true;
            const expanded = expandedStepId === step.id;

            return (
              <Collapsible
                key={step.id}
                open={expanded}
                onOpenChange={open => setExpandedStepId(open ? step.id : null)}
                className="rounded-md border border-border/70 bg-background/50"
              >
                <div className="flex items-start gap-2 p-2.5">
                  <Checkbox
                    checked={completed}
                    onCheckedChange={value =>
                      setStepCompleted(step.id, value === true)
                    }
                    onClick={event => event.stopPropagation()}
                    aria-label={step.title}
                    className="mt-0.5 shrink-0"
                  />
                  <CollapsibleTrigger className="flex min-w-0 flex-1 items-start justify-between gap-2 text-left">
                    <span className="min-w-0">
                      <span
                        className={`block text-sm font-medium ${completed ? "text-muted-foreground line-through" : "text-foreground"}`}
                      >
                        {step.title}
                      </span>
                      <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                        {step.summary}
                      </span>
                    </span>
                    {expanded ? (
                      <ChevronDown className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    )}
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="px-10 pb-3 text-xs leading-5 text-muted-foreground">
                  {step.detail}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border/70 pt-3">
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <CheckCircle2 className="size-3.5 text-primary" />
          {page.steps.filter(step => completedSteps[step.id] === true).length}/
          {page.steps.length} {t("workspace.widgets.guideCompleted")}
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            className="inline-flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground transition hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
            onClick={() => {
              setPageIndex(index => Math.max(0, index - 1));
              setExpandedStepId(null);
            }}
            disabled={pageIndex === 0}
            aria-label={t("workspace.widgets.guidePreviousPage")}
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            className="inline-flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground transition hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
            onClick={() => {
              setPageIndex(index => Math.min(pages.length - 1, index + 1));
              setExpandedStepId(null);
            }}
            disabled={pageIndex === pages.length - 1}
            aria-label={t("workspace.widgets.guideNextPage")}
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuideWidget;
