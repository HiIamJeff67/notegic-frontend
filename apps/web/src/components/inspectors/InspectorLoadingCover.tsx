import { Spinner } from "@/components/ui/spinner";

interface InspectorLoadingCoverProps {
  label: string;
  show: boolean;
}

const InspectorLoadingCover = ({ label, show }: InspectorLoadingCoverProps) =>
  show ? (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-sidebar/35 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
        <Spinner className="size-6" />
        <span>{label}</span>
      </div>
    </div>
  ) : null;

export default InspectorLoadingCover;
