import { useLoading } from "@/hooks/useLoading";
import LoadingIndicator from "./LoadingIndicator";

interface LoadingCoverProps {
  condition?: boolean;
  label?: string;
}

const LoadingCover = ({ condition, label }: LoadingCoverProps) => {
  const { isStrictLoading } = useLoading();

  if (condition !== undefined && condition !== null && !condition) return null;
  if (isStrictLoading) return null;

  return (
    <div
      className="fixed inset-0 z-9999 flex cursor-wait items-center justify-center bg-overlay backdrop-blur-sm"
      style={{ pointerEvents: "auto" }}
    >
      <LoadingIndicator label={label} />
    </div>
  );
};

export default LoadingCover;
