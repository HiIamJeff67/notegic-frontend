import { useState } from "react";
import { createRoot } from "react-dom/client";
import Image, {
  type ImageLoadingStatus,
} from "@/components/commons/Image/Image";
import UploadImageDialog from "@/components/dialogs/ImageDialog/UploadImageDialog";
import ModifyImageHover from "@/components/hovers/ModifyImageHover/ModifyImageHover";
import AvatarIcon from "@/components/icons/AvatarIcon";
import { Button } from "@/components/ui/button";

export const imageStatuses: ImageLoadingStatus[] = [];
export const imageEvents: string[] = [];

const ImageExamples = () => {
  const [src, setSrc] = useState("/__image__/first.svg");
  const [status, setStatus] = useState<ImageLoadingStatus>("loading");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [reveal, setReveal] = useState(true);
  return (
    <div className="space-y-4 p-6">
      <div className="flex gap-2">
        <Button onClick={() => setSrc("/__image__/second.svg")}>Replace</Button>
        <Button onClick={() => setSrc("/__image__/failed.svg")}>Fail</Button>
        <Button onClick={() => setSrc("/__image__/first.svg")}>Retry</Button>
        <Button onClick={() => setUploadOpen(true)}>Upload preview</Button>
        <Button onClick={() => setReveal(value => !value)}>
          {reveal ? "Disable reveal" : "Enable reveal"}
        </Button>
      </div>
      <output data-image-status>{status}</output>
      <div className="w-80 overflow-hidden rounded-md bg-muted">
        <Image
          src={src}
          alt="Shared image"
          width={320}
          height={180}
          loading="eager"
          blur={4}
          duration={600}
          reveal={reveal}
          onLoadingStatusChange={nextStatus => {
            imageStatuses.push(nextStatus);
            setStatus(nextStatus);
          }}
          onLoad={() => imageEvents.push("load")}
          onError={() => imageEvents.push("error")}
        />
      </div>
      <AvatarIcon
        avatarURL={src}
        fallbackText="Fixture"
        alt="Avatar"
        size={80}
      />
      <div className="h-32 w-60 overflow-hidden">
        <ModifyImageHover
          imageSrc={src}
          hoverText="Change image"
          onClick={() => {}}
        />
      </div>
      {uploadOpen && (
        <UploadImageDialog
          open
          onOpenChange={setUploadOpen}
          onCancel={() => setUploadOpen(false)}
          onUpload={() => {}}
        />
      )}
    </div>
  );
};

export const mountImages = () => {
  const container = document.createElement("div");
  container.id = "image-test-root";
  container.className =
    "fixed inset-0 z-1000 overflow-auto bg-background text-foreground";
  document.body.append(container);
  createRoot(container).render(<ImageExamples />);
};
