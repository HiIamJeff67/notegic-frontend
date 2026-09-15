import React, { useState } from "react";
import Cropper, { Area } from "react-easy-crop";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

interface ImageCropperProps {
  imageURL: string;
  aspectRatio?: number;
  borderRadius?: React.CSSProperties["borderRadius"];
  onComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  imageURL,
  aspectRatio,
  borderRadius,
  onComplete,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const getCroppedImage = async (
    imageURL: string,
    crop: Area
  ): Promise<Blob> => {
    const image = new Image();
    image.src = imageURL;
    await new Promise(resolve => {
      image.onload = resolve;
    });

    const canvas = document.createElement("canvas");
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get context from canvas");

    ctx.drawImage(
      image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise(resolve => {
      canvas.toBlob(blob => {
        resolve(blob!);
      }, "image/png");
    });
  };

  const handleOnCropComplete = (_croppedArea: Area, croppedAreaPixels: Area) =>
    setCroppedAreaPixels(croppedAreaPixels);

  return (
    <div className="flex w-full flex-col">
      <div className="relative h-64 w-full overflow-hidden">
        <Cropper
          image={imageURL}
          crop={crop}
          zoom={zoom}
          aspect={aspectRatio ?? 16 / 9}
          style={{ cropAreaStyle: { borderRadius } }}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={handleOnCropComplete}
        />
      </div>
      <div className="mt-4 flex w-full justify-end gap-2">
        <Button
          variant="destructive"
          className="px-4 py-2 z-100"
          onClick={onCancel}
        >
          {t("workspace.widgets.cancel")}
        </Button>
        <Button
          variant="default"
          className="px-4 py-2 z-100"
          onClick={async () => {
            if (!croppedAreaPixels) return;
            const croppedBlob = await getCroppedImage(
              imageURL,
              croppedAreaPixels
            );
            onComplete(croppedBlob);
          }}
        >
          {t("workspace.dialogs.complete")}
        </Button>
      </div>
    </div>
  );
};

export default ImageCropper;
