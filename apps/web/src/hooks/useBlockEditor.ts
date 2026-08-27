import { useContext } from "react";
import { BlockEditorContext } from "@/providers/BlockEditorProvider";

export const useBlockEditor = () => {
  const context = useContext(BlockEditorContext);
  if (context === undefined) {
    throw new Error("useBlockEditor must be used within a BlockEditorProvider");
  }
  return context;
};
