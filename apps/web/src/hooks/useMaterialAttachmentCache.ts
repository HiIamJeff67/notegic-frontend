import { useContext } from "react";
import { MaterialAttachmentCacheContext } from "@/providers/MaterialAttachmentCacheProvider";

export const useMaterialAttachmentCache = () => {
  const context = useContext(MaterialAttachmentCacheContext);
  if (!context) {
    throw new Error(
      "useMaterialAttachmentCache must be used within MaterialAttachmentCacheProvider"
    );
  }
  return context;
};
