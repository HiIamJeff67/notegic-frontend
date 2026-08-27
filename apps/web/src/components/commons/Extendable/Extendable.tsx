import { EllipsisVerticalIcon } from "lucide-react";
import { CSSProperties } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExtendableProps {
  children?: React.ReactNode;
  className?: string;
  style?: CSSProperties;
  size?: number;
  optionMenuItems?: React.ReactNode;
  hasParent?: boolean;
  parentClassName?: string;
  parentStyle?: CSSProperties;
  disabled?: boolean;
}

const Extendable = ({
  children,
  className,
  style,
  size,
  optionMenuItems,
  hasParent = false,
  parentClassName,
  parentStyle,
  disabled,
}: ExtendableProps) => {
  if (hasParent) {
    return (
      <>
        {(disabled === undefined || !disabled) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`
                absolute top-1 right-1 w-3 h-3
                flex justify-center items-center
                rounded-full bg-white transition
                ${className}
              `}
                style={style}
                type="button"
              >
                <EllipsisVerticalIcon size={size ?? 8} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="bottom">
              {optionMenuItems}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {children}
      </>
    );
  }

  return (
    <div
      className={`
        relative w-full h-full overflow-hidden
        flex justify-center items-center
        bg-muted border-border rounded-lg
        ${parentClassName}
      `}
      style={parentStyle}
    >
      {(disabled === undefined || !disabled) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={`
                absolute top-1 right-1 w-3 h-3
                flex justify-center items-center
                rounded-full bg-white transition
                ${className}
              `}
              style={style}
              type="button"
            >
              <EllipsisVerticalIcon size={size ?? 8} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="bottom">
            {optionMenuItems}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {children}
    </div>
  );
};
export default Extendable;
