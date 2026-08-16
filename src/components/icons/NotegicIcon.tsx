import React from "react";
import Notegic from "@/assets/logo/common.png";

interface NotegicIconProps {
  size?: number;
  className?: string;
}

export const NotegicIcon: React.FC<NotegicIconProps> = ({
  size = 200,
  className,
}) => {
  return (
    <img
      src={Notegic}
      alt="Notegic"
      width={size}
      height={size}
      className={className}
      style={{ borderRadius: "16px" }}
    />
  );
};

export default NotegicIcon;
