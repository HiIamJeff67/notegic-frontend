import { useContext } from "react";
import { BackgroundImagesContext } from "@/providers/BackgroundImagesProvider";

export function useBackgroundImages() {
  const context = useContext(BackgroundImagesContext);
  if (!context) {
    throw new Error(
      "useBackgroundImages must be used within BackgroundImagesProvider"
    );
  }
  return context;
}
