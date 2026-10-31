import { cn } from "@shared/lib/className/cn";
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
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Ring } from "@/components/ui/ring";
export type VersionTask = {
  title: string;
  description: string;
  completed: boolean;
};

export type VersionData = {
  version: string;
  label: "Next" | "Current" | "Legacy";
  status: "next" | "current" | "released";
  description: string;
  tasks: readonly VersionTask[];
};

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
    <Card className="@container/version-card min-w-0 gap-0">
      <div className="flex min-w-0 flex-col @2xl/version-card:flex-row">
        <CardHeader className="min-w-0 content-start gap-4 border-b border-border/60 pb-5 @2xl/version-card:w-[36%] @2xl/version-card:shrink-0 @2xl/version-card:border-r @2xl/version-card:border-b-0 @2xl/version-card:pb-6">
          <CardDescription className="max-w-xl leading-7">
            {version.description}
          </CardDescription>
          <VersionCardRing completed={completed} total={version.tasks.length} />
        </CardHeader>
        <CardContent className="@container/version-features min-w-0 pt-5 @2xl/version-card:flex-1 @2xl/version-card:pt-6">
          <ul className="grid min-w-0 gap-3 @lg/version-features:grid-cols-2">
            {visibleTasks.map(task => (
              <li
                className={cn(
                  "flex min-w-0 items-start gap-2.5 text-sm leading-6",
                  task.completed
                    ? "text-foreground/85"
                    : "text-muted-foreground"
                )}
                key={task.title}
              >
                {task.completed ? (
                  <CheckCircle2Icon className="mt-1 size-4 shrink-0 text-primary" />
                ) : (
                  <CircleDotIcon className="mt-1 size-4 shrink-0 text-primary/70" />
                )}
                <span className="min-w-0 break-words">
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
      </div>
    </Card>
  );
};
