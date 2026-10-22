import { useTranslation } from "@shared/i18n/useTranslation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface RoutineTaskRecordDialogSkeletonProps {
  isOpen: boolean;
  onClose: () => void;
}

const RoutineTaskRecordDialogSkeleton = ({
  isOpen,
  onClose,
}: RoutineTaskRecordDialogSkeletonProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="flex max-h-[90dvh] w-[92vw] max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden rounded-md bg-card p-0 transition-[opacity,transform] sm:max-w-[92vw]">
        <DialogHeader className="shrink-0 border-b border-border bg-secondary px-6 py-5 pr-12">
          <DialogTitle>{t("workspace.records.title")}</DialogTitle>
          <DialogDescription asChild>
            <div>
              <Skeleton className="h-4 w-56" />
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="flex shrink-0 flex-wrap gap-2 border-b border-border px-4 py-3">
          <Skeleton className="h-8 w-32 rounded-sm" />
          <Skeleton className="size-8 rounded-sm" />
          <Skeleton className="size-8 rounded-sm" />
        </div>
        <div className="border-b border-border px-4 py-2">
          <Skeleton className="h-4 w-56 max-w-full" />
        </div>
        <div className="min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain [&>div]:overflow-visible">
          <Table className="min-w-[70rem] table-fixed text-xs">
            <TableHeader className="select-none [&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_th]:border-b [&_th]:border-border/80 [&_th]:bg-secondary [&_th]:text-left">
              <TableRow>
                <TableHead className="h-9 w-40 px-2">
                  <Skeleton className="h-3 w-16 rounded-sm" />
                </TableHead>
                <TableHead className="h-9 w-28 px-2">
                  <Skeleton className="h-3 w-14 rounded-sm" />
                </TableHead>
                <TableHead className="h-9 w-40 px-2">
                  <Skeleton className="h-3 w-16 rounded-sm" />
                </TableHead>
                <TableHead className="h-9 w-36 px-2">
                  <Skeleton className="h-3 w-20 rounded-sm" />
                </TableHead>
                <TableHead className="h-9 w-36 px-2">
                  <Skeleton className="h-3 w-14 rounded-sm" />
                </TableHead>
                <TableHead className="h-9 w-20 px-2">
                  <Skeleton className="h-3 w-8 rounded-sm" />
                </TableHead>
                <TableHead className="h-9 w-40 px-2">
                  <Skeleton className="h-3 w-10 rounded-sm" />
                </TableHead>
                <TableHead className="h-9 w-40 px-2">
                  <Skeleton className="h-3 w-10 rounded-sm" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 8 }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {Array.from({ length: 8 }).map((__, cellIndex) => (
                    <TableCell className="px-2 py-2.5" key={cellIndex}>
                      <Skeleton className="h-4 w-full rounded-sm" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoutineTaskRecordDialogSkeleton;
