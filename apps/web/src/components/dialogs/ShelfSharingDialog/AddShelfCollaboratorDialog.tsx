import { AccessControlPermission } from "@shared/api/interfaces/enums/accessControlPermission.enum";
import type { UUID } from "crypto";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type ShelfCollaboratorPermission =
  | AccessControlPermission.Admin
  | AccessControlPermission.Write
  | AccessControlPermission.Read;

interface AddShelfCollaboratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userPublicId: string;
  onUserPublicIdChange: (userPublicId: string) => void;
  permission: ShelfCollaboratorPermission;
  onPermissionChange: (permission: ShelfCollaboratorPermission) => void;
  permissionOptions: readonly ShelfCollaboratorPermission[];
  canManageSharing: boolean;
  currentUserPublicId?: UUID;
  isPending: boolean;
  onSubmit: () => void;
}

const AddShelfCollaboratorDialog = ({
  open,
  onOpenChange,
  userPublicId,
  onUserPublicIdChange,
  permission,
  onPermissionChange,
  permissionOptions,
  canManageSharing,
  currentUserPublicId,
  isPending,
  onSubmit,
}: AddShelfCollaboratorDialogProps) => {
  const { t } = useTranslation();
  const permissionLabel = (value: ShelfCollaboratorPermission) => {
    if (value === AccessControlPermission.Admin)
      return t("workspace.viewer.admin");
    if (value === AccessControlPermission.Write)
      return t("workspace.viewer.write");
    return t("workspace.viewer.read");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent overlayClassName="z-[170]" className="z-[180] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("workspace.dialogs.addCollaborator")}</DialogTitle>
          <DialogDescription>
            {t("workspace.dialogs.addCollaboratorDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <Input
            value={userPublicId}
            onChange={event => onUserPublicIdChange(event.target.value)}
            placeholder={t("workspace.dialogs.userPublicId")}
          />
          <Select
            value={permission}
            onValueChange={value =>
              onPermissionChange(value as ShelfCollaboratorPermission)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[190]">
              {permissionOptions.map(value => (
                <SelectItem key={value} value={value}>
                  {permissionLabel(value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("workspace.widgets.cancel")}
          </Button>
          <Button
            disabled={
              !canManageSharing ||
              isPending ||
              !userPublicId.trim() ||
              userPublicId.trim() === currentUserPublicId
            }
            onClick={onSubmit}
          >
            {isPending
              ? t("workspace.dialogs.adding")
              : t("workspace.viewer.add")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddShelfCollaboratorDialog;
