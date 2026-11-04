import type { ReactNode } from "react";
import { CommandList } from "@/components/ui/command";

const AppCommandContent = ({ children }: { children: ReactNode }) => {
  return (
    <CommandList className="max-h-[28rem] px-2 pt-1 pb-2">
      {children}
    </CommandList>
  );
};

export default AppCommandContent;
