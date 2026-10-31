import { requiresCrossOriginIsolation } from "@shared/lib/browser/crossOriginIsolation";
import { cn } from "@shared/lib/className/cn";
import { Link, useLocation, useRouter } from "@tanstack/react-router";
import type { AnchorHTMLAttributes } from "react";

export const ArticleLink = ({
  href,
  className,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => {
  const [to, hash] = href.split("#", 2);
  const { pathname } = useLocation();
  const router = useRouter();
  const target = router.buildLocation({ to, hash });
  const reloadDocument =
    requiresCrossOriginIsolation(pathname) !==
    requiresCrossOriginIsolation(target.pathname);

  return (
    <Link
      to={to}
      hash={hash}
      reloadDocument={reloadDocument}
      className={cn(
        "underline underline-offset-4 hover:text-primary",
        className
      )}
      {...props}
    />
  );
};
