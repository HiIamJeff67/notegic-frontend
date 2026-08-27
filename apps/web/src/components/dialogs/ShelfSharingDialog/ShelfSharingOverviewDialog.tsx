import { SearchIcon, Trash2Icon, UserPlusIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface ShelfSharingOverviewRow {
  userPublicId: string;
  displayName: string;
  avatarURL?: string | null;
  permission: string;
  status: string;
  isOnline: boolean;
  isSelf: boolean;
}

interface ShelfSharingOverviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rows: ShelfSharingOverviewRow[];
  query: string;
  onQueryChange: (query: string) => void;
  canManageSharing: boolean;
  selectedUserPublicIds: Set<string>;
  isAllRowsSelected: boolean;
  isSomeRowsSelected: boolean;
  selectableRowCount: number;
  selectedRowCount: number;
  isDeleting: boolean;
  onToggleRow: (userPublicId: string, isSelected: boolean) => void;
  onToggleAllRows: (isSelected: boolean) => void;
  onAddClick: () => void;
  onDeleteClick: () => void;
}

const ShelfSharingOverviewDialog = ({
  open,
  onOpenChange,
  rows,
  query,
  onQueryChange,
  canManageSharing,
  selectedUserPublicIds,
  isAllRowsSelected,
  isSomeRowsSelected,
  selectableRowCount,
  selectedRowCount,
  isDeleting,
  onToggleRow,
  onToggleAllRows,
  onAddClick,
  onDeleteClick,
}: ShelfSharingOverviewDialogProps) => {
  const { t } = useTranslation();
  const permissionLabel = (permission: string) => {
    if (permission === "owner") return t("workspace.viewer.owner");
    if (permission === "admin") return t("workspace.viewer.admin");
    if (permission === "write") return t("workspace.viewer.write");
    return t("workspace.viewer.read");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{t("workspace.dialogs.sharingOverview")}</DialogTitle>
          <DialogDescription>
            {t("workspace.dialogs.sharingDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={event => onQueryChange(event.target.value)}
              placeholder={t("workspace.dialogs.searchSharing")}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            disabled={!canManageSharing}
            onClick={onAddClick}
          >
            <UserPlusIcon className="size-4" />
            {t("workspace.viewer.add")}
          </Button>
          <Button
            variant="outline"
            disabled={!canManageSharing || isDeleting || selectedRowCount === 0}
            onClick={onDeleteClick}
          >
            <Trash2Icon className="size-4" />
            {isDeleting
              ? t("workspace.dialogs.deleting")
              : t("workspace.menu.delete")}
          </Button>
        </div>
        <div className="max-h-[52vh] overflow-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    aria-label={
                      isAllRowsSelected
                        ? t("workspace.dialogs.clearAllRows")
                        : t("workspace.dialogs.selectAllRows")
                    }
                    checked={
                      isAllRowsSelected
                        ? true
                        : isSomeRowsSelected
                          ? "indeterminate"
                          : false
                    }
                    onCheckedChange={checked =>
                      onToggleAllRows(checked === true)
                    }
                    disabled={!canManageSharing || selectableRowCount === 0}
                  />
                </TableHead>
                <TableHead className="text-left">
                  {t("workspace.dialogs.user")}
                </TableHead>
                <TableHead className="text-left">
                  {t("workspace.dialogs.publicId")}
                </TableHead>
                <TableHead>{t("workspace.dialogs.permission")}</TableHead>
                <TableHead>{t("workspace.dialogs.status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-28 text-center text-muted-foreground"
                  >
                    {t("workspace.dialogs.noSharingRows")}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map(row => (
                  <TableRow key={row.userPublicId}>
                    <TableCell>
                      <Checkbox
                        aria-label={t("workspace.dialogs.selectUser", {
                          name: row.displayName,
                        })}
                        checked={selectedUserPublicIds.has(row.userPublicId)}
                        disabled={
                          !canManageSharing ||
                          row.isSelf ||
                          row.permission === "owner"
                        }
                        onCheckedChange={checked =>
                          onToggleRow(row.userPublicId, checked === true)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={row.avatarURL ?? undefined}
                            alt={row.displayName}
                          />
                          <AvatarFallback className="text-xs">
                            {row.displayName
                              .trim()
                              .split(/\s+/)
                              .slice(0, 2)
                              .map(part => part[0]?.toUpperCase())
                              .join("") || "?"}
                          </AvatarFallback>
                          <AvatarBadge
                            className={
                              row.isOnline
                                ? "bg-emerald-500"
                                : "bg-muted-foreground"
                            }
                          />
                        </Avatar>
                        <span className="font-medium">{row.displayName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {row.userPublicId}
                    </TableCell>
                    <TableCell className="text-center">
                      {permissionLabel(row.permission)}
                    </TableCell>
                    <TableCell className="text-center">
                      {row.isOnline
                        ? t("workspace.viewer.inChannel")
                        : t("workspace.viewer.notInChannel")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShelfSharingOverviewDialog;
