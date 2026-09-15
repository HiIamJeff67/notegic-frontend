import { useTranslation } from "react-i18next";
import ImageCropper from "@/components/commons/ImageCropper/ImageCropper";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CropImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageURL: string;
  aspectRatio?: number;
  borderRadius?: React.CSSProperties["borderRadius"];
  onComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

const CropImageDialog = ({
  open,
  onOpenChange,
  imageURL,
  aspectRatio,
  borderRadius,
  onComplete,
  onCancel,
}: CropImageDialogProps) => {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md shadow-xl rounded-xl p-6 flex flex-col items-center gap-4 data-[state=open]:zoom-in-100! data-[state=closed]:zoom-out-100!">
        <DialogHeader>
          <DialogTitle>{t("workspace.dialogs.cropImage")}</DialogTitle>
        </DialogHeader>
        <DialogDescription className="px-8">
          {t("workspace.dialogs.cropImageDescription")}
        </DialogDescription>
        <ImageCropper
          imageURL={imageURL}
          aspectRatio={aspectRatio}
          borderRadius={borderRadius}
          onComplete={onComplete}
          onCancel={onCancel}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CropImageDialog;
