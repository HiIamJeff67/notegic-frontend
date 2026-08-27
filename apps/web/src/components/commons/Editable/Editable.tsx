import { PenLineIcon } from "lucide-react";
import { CSSProperties } from "react";

interface EditableProps {
  children?: React.ReactNode;
  className?: string;
  size?: number;
  onEdit: () => void | Promise<void>;
  hasParent?: boolean;
  parentClassName?: string;
  parentStyle?: CSSProperties;
  disabled?: boolean;
}

const Editable = ({
  children,
  className,
  size,
  onEdit,
  hasParent = false,
  parentClassName = "w-16 h-16",
  parentStyle,
  disabled,
}: EditableProps) => {
  if (hasParent) {
    return (
      <>
        {(disabled === undefined || !disabled) && (
          <button
            className={`
            absolute top-1 left-1 w-3 h-3
            flex justify-center items-center
            rounded-full bg-white transition
            ${className}
         `}
            onClick={onEdit}
            type="button"
          >
            <PenLineIcon size={size ?? 8} />
          </button>
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
        <button
          className={`
            absolute top-1 left-1 w-3 h-3
            flex justify-center items-center
            rounded-full bg-white transition
            ${className}
         `}
          onClick={onEdit}
          type="button"
        >
          <PenLineIcon size={size ?? 8} />
        </button>
      )}
      {children}
    </div>
  );
};
export default Editable;
