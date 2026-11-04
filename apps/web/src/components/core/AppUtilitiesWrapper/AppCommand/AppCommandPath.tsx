import { Fragment, useLayoutEffect, useRef } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const AppCommandPath = ({
  path,
  prompt,
  onVisit,
}: {
  path: string[];
  prompt: string | null;
  onVisit: (index: number) => void;
}) => {
  const scrollerRef = useRef<HTMLElement>(null);
  const stickToEnd = useRef(true);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || !stickToEnd.current) return;
    scroller.scrollLeft = scroller.scrollWidth;
  }, [path, prompt]);

  if (path.length === 0) return null;
  return (
    <Breadcrumb
      ref={scrollerRef}
      className="app-command-path"
      onScroll={event => {
        const scroller = event.currentTarget;
        stickToEnd.current =
          scroller.scrollWidth - scroller.clientWidth - scroller.scrollLeft < 4;
      }}
    >
      <BreadcrumbList className="w-max flex-nowrap gap-1 text-sm">
        {path.map((label, index) => {
          const current = index === path.length - 1 && !prompt;
          return (
            <Fragment key={`${index}:${label}`}>
              {index > 0 ? (
                <BreadcrumbSeparator className="[&>svg]:size-3" />
              ) : null}
              <BreadcrumbItem className="shrink-0">
                {current ? (
                  <BreadcrumbPage className="font-medium">
                    {label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <button
                      type="button"
                      className="rounded-sm outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                      onClick={() => onVisit(index)}
                    >
                      {label}
                    </button>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
        {prompt ? (
          <>
            <BreadcrumbSeparator className="[&>svg]:size-3" />
            <BreadcrumbItem className="shrink-0">
              <BreadcrumbPage className="font-bold text-foreground">
                {prompt}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        ) : null}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default AppCommandPath;
