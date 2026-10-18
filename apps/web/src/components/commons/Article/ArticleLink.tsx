import { cn } from "@shared/util/utils";
import { Link } from "@tanstack/react-router";
import type { AnchorHTMLAttributes } from "react";

export const ArticleLink = ({
  href,
  className,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => {
  const [to, hash] = href.split("#", 2);

  return (
    <Link
      to={to}
      hash={hash}
      className={cn(
        "underline underline-offset-4 hover:text-primary",
        className
      )}
      {...props}
    />
  );
};
