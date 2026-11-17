import { XIcon } from "lucide-react";
import React, { CSSProperties } from "react";

interface CloseableProps {
  children?: React.ReactNode;
  className?: string;
  size?: number;
  onClose: () => void | Promise<void>;
  hasParent?: boolean;
  parentClassName?: string;
  parentStyle?: CSSProperties;
  disabled?: boolean;
}

const Closeable = ({
  children,
  className,
  size,
  onClose,
  hasParent = false,
  parentClassName = "w-16 h-16",
  parentStyle,
  disabled,
}: CloseableProps) => {
  if (hasParent) {
    return (
      <>
        {(disabled === undefined || !disabled) && (
          <button // we don't use <Button /> component here, since it will cause some padding or margin like UI problem
            className={`
            absolute top-1 left-1 w-3 h-3
            flex justify-center items-center
            rounded-full bg-(--destructive) transition
            ${className}
          `}
            onClick={event => {
              event.stopPropagation();
              void onClose();
            }}
            type="button"
          >
            <XIcon size={size ?? 8} />
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
        <button // we don't use <Button /> component here, since it will cause some padding or margin like UI problem
          className={`
            absolute top-1 left-1 w-3 h-3
            flex justify-center items-center
            rounded-full bg-(--destructive) transition
            ${className}
          `}
          onClick={event => {
            event.stopPropagation();
            void onClose();
          }}
          type="button"
        >
          <XIcon size={size ?? 8} />
        </button>
      )}
      {children}
    </div>
  );
};

export default Closeable;
