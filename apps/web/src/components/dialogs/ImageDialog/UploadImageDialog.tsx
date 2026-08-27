import { Image } from "@unpic/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Closeable from "@/components/commons/Closeable/Closeable";
import DropFileZone from "@/components/commons/DropFileZone/DropFileZone";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";

interface UploadImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maxCount?: number;
  title?: string;
  onUpload: (files: File[]) => void | Promise<void>;
  onCancel: () => void | Promise<void>;
}

const UploadImageDialog: React.FC<UploadImageDialogProps> = ({
  open,
  onOpenChange,
  maxCount = 5,
  title,
  onUpload,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [uploadedImages, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleOnDrop = (files: File[]) => {
    if (files.length > maxCount) {
      setError(t("workspace.dialogs.maxImages", { count: maxCount }));
      return;
    }
    setSelectedFiles(prev => [...prev, ...files]);
    setError("");
  };

  const handleOnUpload = async () => {
    if (uploadedImages.length === 0) {
      setError(t("workspace.dialogs.selectAtLeastOneImage"));
      return;
    }
    try {
      setIsUploading(true);
      await onUpload(uploadedImages);
      setSelectedFiles([]);
      setError("");
      onOpenChange(false);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md shadow-xl rounded-xl p-6 flex flex-col items-center gap-4">
        <DialogHeader>
          <DialogTitle>
            {title ?? t("workspace.dialogs.uploadImage")}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="px-2">
          {t("workspace.dialogs.uploadImagesDescription", { count: maxCount })}
        </DialogDescription>
        <DropFileZone
          accept={{ "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp"] }}
          multiple={maxCount > 1}
          disabled={false}
          width="100%"
          height="140px"
          className="mb-2 bg-muted/45 hover:bg-muted/60"
          onDrop={handleOnDrop}
        >
          <div className="flex-col justify-center items-center">
            <p className="text-sm text-muted-foreground">
              {t("workspace.dialogs.dropImages")}
            </p>
          </div>
        </DropFileZone>
        {uploadedImages.length > 0 && (
          <div className="w-full flex flex-wrap gap-2 mt-2">
            {uploadedImages.map((image, index) => (
              <div
                key={index}
                className="w-16 h-16 relative rounded-lg overflow-hidden"
              >
                <Closeable
                  className="w-2 h-2 top-1 left-1 absolute"
                  onClose={() => {
                    setSelectedFiles(
                      uploadedImages.filter((_, i) => i !== index)
                    );
                  }}
                >
                  <Image
                    src={URL.createObjectURL(image)}
                    width={160}
                    height={160}
                    alt={image.name}
                    className="object-cover w-full h-full"
                  />
                </Closeable>
              </div>
            ))}
          </div>
        )}
        {error && <div className="text-destructive text-sm">{error}</div>}
        <div className="w-full flex justify-end gap-2 mt-4">
          <Button variant="secondary" disabled={isUploading} onClick={onCancel}>
            {t("workspace.widgets.cancel")}
          </Button>
          <Button
            variant="default"
            onClick={handleOnUpload}
            disabled={uploadedImages.length === 0 || isUploading}
          >
            {isUploading && <Spinner />}
            {t("workspace.dialogs.upload")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadImageDialog;
