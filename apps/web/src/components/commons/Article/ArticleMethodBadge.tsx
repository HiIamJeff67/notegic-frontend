import { cn } from "@shared/lib/className/cn";

const methodTone: Record<string, string> = {
  GET: "bg-http-get/15 text-http-get-foreground",
  POST: "bg-http-post/15 text-http-post-foreground",
  PUT: "bg-http-put/15 text-http-put-foreground",
  PATCH: "bg-http-patch/15 text-http-patch-foreground",
  DELETE: "bg-destructive/10 text-destructive",
};

export const ArticleMethodBadge = ({
  method,
  className,
}: {
  method: string;
  className?: string;
}) => (
  <span
    data-article-method={method}
    className={cn(
      "inline-flex min-w-10 justify-center rounded-sm px-1.5 py-0.5 font-mono text-[10px] font-semibold",
      methodTone[method] ?? "bg-muted text-muted-foreground",
      className
    )}
  >
    {method}
  </span>
);
