import { cn } from "@shared/util/utils";
import {
  CheckCircle2Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  CircleDotIcon,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Ring } from "@/components/ui/ring";
import type { VersionData } from "./versions";

const getPercentage = (completed: number, total: number) =>
  total === 0 ? 0 : Math.round((completed / total) * 100);

export const VersionCardProgress = ({
  completed,
  total,
  className,
}: {
  completed: number;
  total: number;
  className?: string;
}) => {
  const percentage = getPercentage(completed, total);

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-2 flex items-center justify-between gap-3 text-xs">
        <span className="text-muted-foreground">tasks complete</span>
        <span className="font-mono font-semibold text-foreground">
          {completed} / {total} · {percentage}%
        </span>
      </div>
      <Progress
        value={completed}
        max={total}
        aria-label={`${percentage}% complete`}
      />
    </div>
  );
};

export const VersionCardRing = ({
  completed,
  total,
  className,
}: {
  completed: number;
  total: number;
  className?: string;
}) => {
  const percentage = getPercentage(completed, total);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Ring value={percentage} aria-label={`${percentage}% complete`} size={64}>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-foreground">
          {percentage}%
        </span>
      </Ring>
      <div>
        <p className="font-mono text-sm font-semibold text-foreground">
          {completed} / {total}
        </p>
        <p className="text-xs text-muted-foreground">tasks complete</p>
      </div>
    </div>
  );
};

export const VersionCard = ({ version }: { version: VersionData }) => {
  const [expanded, setExpanded] = useState(false);
  const completed = version.tasks.filter(task => task.completed).length;
  const visibleTasks = expanded ? version.tasks : version.tasks.slice(0, 4);
  const hasMoreTasks = version.tasks.length > visibleTasks.length;

  return (
    <Card className="min-w-0 gap-0 lg:flex-row">
      <CardHeader className="gap-4 border-b border-border/60 pb-5 lg:w-[36%] lg:shrink-0 lg:border-r lg:border-b-0 lg:pb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="font-mono text-lg">
                v{version.version}
              </CardTitle>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-medium",
                  version.status === "next"
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {version.label}
              </span>
            </div>
            <CardDescription className="mt-2 max-w-xl leading-6">
              {version.description}
            </CardDescription>
          </div>
          <VersionCardRing completed={completed} total={version.tasks.length} />
        </div>
      </CardHeader>
      <CardContent className="pt-5 lg:flex-1 lg:pt-6">
        <ul className="grid gap-3 sm:grid-cols-2">
          {visibleTasks.map(task => (
            <li
              className={cn(
                "flex items-start gap-2.5 text-sm leading-6",
                task.completed ? "text-foreground/85" : "text-muted-foreground"
              )}
              key={task.title}
            >
              {task.completed ? (
                <CheckCircle2Icon className="mt-1 size-4 shrink-0 text-primary" />
              ) : (
                <CircleDotIcon className="mt-1 size-4 shrink-0 text-primary/70" />
              )}
              <span>
                <span className="font-medium text-foreground">
                  {task.title}
                </span>
                <span className="mt-0.5 block text-muted-foreground">
                  {task.description}
                </span>
              </span>
            </li>
          ))}
        </ul>
        {(hasMoreTasks || expanded) && (
          <Button
            className="mt-5 h-auto px-0 text-primary hover:bg-transparent hover:text-primary/80 hover:underline"
            variant="ghost"
            onClick={() => setExpanded(value => !value)}
            aria-expanded={expanded}
          >
            {expanded
              ? "Show less"
              : `Show all ${version.tasks.length} features`}
            {expanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
