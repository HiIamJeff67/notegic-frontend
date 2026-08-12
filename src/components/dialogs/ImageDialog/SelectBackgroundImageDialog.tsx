import toast from "@shared/lib/toast";
import type { UUID } from "crypto";
import { useCallback, useEffect, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { dashboardHeaderBackgroundImageOptions } from "@/assets/backgrounds";
import Closeable from "@/components/commons/Closeable/Closeable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useBackgroundImages } from "@/hooks/useBackgroundImages";
import { useRegisterLoadingDependencies } from "@/hooks/useLoading";
import { translateError } from "@/i18n/error";
import { ModalProps } from "@/providers/ModalProvider";
import CropImageDialog from "./CropImageDialog";
import UploadImageDialog from "./UploadImageDialog";

interface SelectBackgroundImageDialogProps extends ModalProps {
  cropperAspectRatio: number;
}

const SelectBackgroundImageDialog = ({
  isOpen,
  onClose,
  cropperAspectRatio,
}: SelectBackgroundImageDialogProps) => {
  const { t } = useTranslation();

  const backgroundImagesManager = useBackgroundImages();

  const thumbnails = backgroundImagesManager.thumbnails?.contents || [];

  const [selectedBackgroundImageId, setSelectedBackgroundImageId] = useState<
    string | null
  >(null);
  const [croppedBackgroundImagePack, setCroppedBackgroundImagePack] = useState<{
    url: string;
    revoke: () => void;
  } | null>(null);
  const [uploadImageDialogOpen, setUploadImageDialogOpen] =
    useState<boolean>(false);
  const [cropImageDialogOpen, setCropImageDialogOpen] =
    useState<boolean>(false);

  const [isCropImageCompleting, startCompletingCropImageTransition] =
    useTransition();
  const [isCropImageSelecting, startSelectingCropImageTransition] =
    useTransition();

  useRegisterLoadingDependencies(
    () => isCropImageCompleting,
    () => isCropImageSelecting
  );

  useEffect(() => {
    const currentId =
      backgroundImagesManager.currentBackgroundImage?.id ?? null;
    if (currentId && thumbnails.some(thumb => thumb.id === currentId)) {
      setSelectedBackgroundImageId(currentId);
      return;
    }

    if (backgroundImagesManager.currentBackgroundImage === null) {
      setSelectedBackgroundImageId(
        backgroundImagesManager.defaultBackgroundImageId
      );
      return;
    }

    if (selectedBackgroundImageId === null) {
      setSelectedBackgroundImageId(
        thumbnails[thumbnails.length - 1]?.id ??
          backgroundImagesManager.defaultBackgroundImageId
      );
    }
  }, [
    backgroundImagesManager.currentBackgroundImage?.id,
    backgroundImagesManager.defaultBackgroundImageId,
    thumbnails,
    selectedBackgroundImageId,
  ]);

  const handleCropImageOnComplete = useCallback(
    async (croppedBlob: Blob) =>
      startCompletingCropImageTransition(async () => {
        try {
          if (croppedBackgroundImagePack === null) {
            throw new Error("failed to crop null image");
          }

          const croppedFile = new File(
            [croppedBlob],
            `cropped-image-${Date.now()}.png`,
            {
              type: "image/png",
            }
          );
          await backgroundImagesManager.setCurrentBackgroundImageByFile(
            croppedFile
          );
          URL.revokeObjectURL(croppedBackgroundImagePack.url);
          setCroppedBackgroundImagePack(null);
          setCropImageDialogOpen(false);
        } catch (error) {
          toast.error(translateError(error, t));
        }
      }),
    [croppedBackgroundImagePack, backgroundImagesManager, t]
  );

  const handleCropImageOnSelect = useCallback(
    () =>
      startSelectingCropImageTransition(async () => {
        try {
          if (!selectedBackgroundImageId) return;

          const imagePack = await backgroundImagesManager.getFullImageURL(
            selectedBackgroundImageId as UUID
          );
          setCroppedBackgroundImagePack(imagePack);
          setCropImageDialogOpen(true);
        } catch (error) {
          toast.error(translateError(error, t));
        }
      }),
    [selectedBackgroundImageId, backgroundImagesManager, t]
  );

  const handleBackgroundOnSelect = useCallback(
    async (id: string) => {
      setSelectedBackgroundImageId(id);
      try {
        if (id.startsWith("default-")) {
          backgroundImagesManager.setDefaultBackgroundImageById(id);
          await backgroundImagesManager.setCurrentBackgroundImageByFile(null);
        } else {
          await backgroundImagesManager.setCurrentBackgroundImageById(
            id as UUID
          );
        }
      } catch (error) {
        toast.error(translateError(error, t));
      }
    },
    [backgroundImagesManager, t]
  );

  const handleThumbnailOnRemove = useCallback(
    async (id: string) => {
      try {
        const remainingIds = thumbnails
          .filter(thumb => thumb.id !== id)
          .map(thumb => thumb.id);
        const fallbackId =
          remainingIds.length > 0
            ? remainingIds[remainingIds.length - 1]
            : backgroundImagesManager.defaultBackgroundImageId;

        await backgroundImagesManager.remove([id as UUID]);
        setSelectedBackgroundImageId(fallbackId);
        if (fallbackId.startsWith("default-")) {
          backgroundImagesManager.setDefaultBackgroundImageById(fallbackId);
          await backgroundImagesManager.setCurrentBackgroundImageByFile(null);
        } else {
          await backgroundImagesManager.setCurrentBackgroundImageById(
            fallbackId as UUID
          );
        }
      } catch (error) {
        toast.error(translateError(error, t));
      }
    },
    [backgroundImagesManager, t, thumbnails]
  );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className="
          w-[95vw] 
          max-w-md 
          md:max-w-2xl 
          lg:max-w-3xl 
          bg-card shadow-xl rounded-xl p-6 flex flex-col items-center gap-4
        "
      >
        <DialogHeader>
          <DialogTitle>
            {t("workspace.dialogs.selectBackgroundImages")}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="px-4">
          {t("workspace.dialogs.selectBackgroundDescription")}
        </DialogDescription>
        <UploadImageDialog
          open={uploadImageDialogOpen}
          onOpenChange={setUploadImageDialogOpen}
          title={t("workspace.dialogs.uploadBackgroundImages")}
          onUpload={async (files: File[]) => {
            const uploadedIds = await backgroundImagesManager.upload(files);
            if (uploadedIds.length > 0) {
              const lastUploadedId = uploadedIds[uploadedIds.length - 1];
              setSelectedBackgroundImageId(lastUploadedId);
              await backgroundImagesManager.setCurrentBackgroundImageById(
                lastUploadedId
              );
            }
          }}
          onCancel={() => setUploadImageDialogOpen(false)}
        />
        {croppedBackgroundImagePack !== null && (
          <CropImageDialog
            open={cropImageDialogOpen}
            onOpenChange={setCropImageDialogOpen}
            imageURL={croppedBackgroundImagePack.url}
            aspectRatio={cropperAspectRatio}
            onComplete={handleCropImageOnComplete}
            onCancel={() => {
              croppedBackgroundImagePack.revoke();
              setCroppedBackgroundImagePack(null);
              setCropImageDialogOpen(false);
            }}
          />
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto max-h-[60vh] w-full mt-4 p-2">
          {[
            ...dashboardHeaderBackgroundImageOptions.map(image => ({
              id: image.id,
              thumbnailURL: image.src,
              isDefault: true,
            })),
            ...thumbnails.map(thumb => ({
              id: thumb.id,
              thumbnailURL: thumb.thumbnailURL,
              isDefault: false,
            })),
          ].map(image => (
            <div
              key={image.id}
              onClick={() => void handleBackgroundOnSelect(image.id)}
              className={`
                    cursor-pointer relative aspect-video rounded-lg overflow-hidden border-2 transition-all
                    ${
                      selectedBackgroundImageId === image.id
                        ? "border-primary shadow-lg scale-105"
                        : "border-transparent hover:border-foreground/50"
                    }
                    `}
            >
              {image.isDefault ? (
                <img
                  src={image.thumbnailURL}
                  alt={t("workspace.dialogs.backgroundThumbnail")}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Closeable
                  onClose={() => void handleThumbnailOnRemove(image.id)}
                  hasParent
                >
                  <img
                    src={image.thumbnailURL}
                    alt={t("workspace.dialogs.backgroundThumbnail")}
                    className="w-full h-full object-cover"
                  />
                </Closeable>
              )}
            </div>
          ))}
        </div>
        <div className="w-full flex justify-end gap-2 mt-4">
          <Button
            variant="secondary"
            className="w-20"
            disabled={
              selectedBackgroundImageId === null ||
              selectedBackgroundImageId.startsWith("default-")
            }
            onClick={handleCropImageOnSelect}
          >
            {t("workspace.dialogs.crop")}
          </Button>
          <Button
            variant="secondary"
            className="w-20"
            onClick={() => setUploadImageDialogOpen(true)}
          >
            {t("workspace.dialogs.upload")}
          </Button>
          <Button
            variant="default"
            className="w-20"
            disabled={selectedBackgroundImageId === null}
            onClick={() => onClose()}
          >
            {t("workspace.dialogs.confirm")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SelectBackgroundImageDialog;
