import { IconProps } from "@shared/types/iconProps.type";

const WideBookmarkIcon = ({
  size = 24,
  className = "",
  ...props
}: IconProps) => {
  return (
    <svg
      xmlns="http://w3.org"
      viewBox="0 0 24 24"
      width={size.toString()}
      height={size.toString()}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M4 3h16a2 2 0 0 1 2 2v16l-10-6-10 6V5a2 2 0 0 1 2-2z"></path>
    </svg>
  );
};

export default WideBookmarkIcon;
