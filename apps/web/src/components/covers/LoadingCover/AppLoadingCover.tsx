import { useEffect } from "react";
import LoadingIndicator from "./LoadingIndicator";

interface AppLoadingCoverProps {
  isLoading: boolean;
}

const AppLoadingCover = ({ isLoading }: AppLoadingCoverProps) => {
  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = "hidden";
      document.body.style.pointerEvents = "none";
    } else {
      document.body.style.overflow = "unset";
      document.body.style.pointerEvents = "auto";
    }

    return () => {
      document.body.style.overflow = "unset";
      document.body.style.pointerEvents = "auto";
    };
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div
      className="fixed inset-0 z-9999 flex cursor-wait items-center justify-center bg-overlay backdrop-blur-sm"
      style={{ pointerEvents: "auto" }}
    >
      <LoadingIndicator />
    </div>
  );
};

export default AppLoadingCover;
