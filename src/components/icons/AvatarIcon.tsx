import { IconProps } from "@shared/types/iconProps.type";
import { Image } from "@unpic/react";
import { useEffect, useState } from "react";

interface AvatarIconProps extends IconProps {
  avatarURL: string;
  alt?: string;
  fallbackText?: string;
}

const fallbackColors = [
  "#0f766e",
  "#1d4ed8",
  "#7c3aed",
  "#be123c",
  "#c2410c",
  "#4d7c0f",
];

const getFallbackColor = (value: string) => {
  const hash = Array.from(value).reduce(
    (current, character) => current * 31 + character.charCodeAt(0),
    0
  );

  return fallbackColors[Math.abs(hash) % fallbackColors.length];
};

const getFallbackInitial = (value: string) =>
  value.match(/[A-Za-z]/)?.[0]?.toUpperCase() ||
  value.trim().charAt(0).toUpperCase() ||
  "U";

export const AvatarIcon = ({
  size = 24,
  className = "",
  avatarURL,
  alt = "",
  fallbackText = "U",
}: AvatarIconProps) => {
  const [imageFailed, setImageFailed] = useState(false);
  const fallbackValue = fallbackText.trim() || "U";
  const fallbackInitial = getFallbackInitial(fallbackValue);
  const hasAvatar = Boolean(avatarURL) && !imageFailed;

  useEffect(() => {
    setImageFailed(false);
  }, [avatarURL]);

  return (
    <div
      className={
        "inline-flex items-center justify-center overflow-hidden rounded-full " +
        className
      }
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        backgroundColor: hasAvatar
          ? "#d1d5db"
          : getFallbackColor(fallbackValue),
      }}
    >
      {hasAvatar ? (
        <Image
          src={avatarURL}
          alt={alt}
          width={80}
          height={80}
          className="w-full h-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span
          className="text-white font-medium"
          style={{ fontSize: size * 0.4 }}
        >
          {fallbackInitial}
        </span>
      )}
    </div>
  );
};

export default AvatarIcon;
