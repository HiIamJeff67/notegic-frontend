import { useContext } from "react";
import { ShelfItemContext } from "@/providers/ShelfItemProvider/ShelfItemProvider";

export const useShelfItem = () => {
  const ctx = useContext(ShelfItemContext);
  if (!ctx)
    throw new Error("useShelfItem must be used within ShelfItemProvider");
  return ctx;
};
