import { IconProps } from "@shared/types/iconProps.type";

const EmptyShelfIcon = ({ size = 24, className = "", ...props }: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 50 50"
      fill="currentColor"
      width={size}
      height={size}
      className={className}
      style={{ minWidth: size, minHeight: size }}
      {...props}
    >
      <path d="M3 32C2.449219 32 2 32.445313 2 33L2 36C2 36.554688 2.449219 37 3 37L47 37C47.554688 37 48 36.554688 48 36L48 33C48 32.445313 47.554688 32 47 32 Z M 6 39L6 44.5C6 45.878906 7.121094 47 8.5 47C9.878906 47 11 45.878906 11 44.5L11 39 Z M 39 39L39 44.5C39 45.878906 40.121094 47 41.5 47C42.878906 47 44 45.878906 44 44.5L44 39Z" />
    </svg>
  );
};

export default EmptyShelfIcon;
