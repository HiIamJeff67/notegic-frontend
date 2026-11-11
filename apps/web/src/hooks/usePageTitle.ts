import { useEffect } from "react";

export const usePageTitle = (title: string | null) => {
  useEffect(() => {
    if (!title) return;
    document.title = title;
  }, [title]);
};
