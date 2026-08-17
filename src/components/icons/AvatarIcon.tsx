import { IconProps } from "@shared/types/iconProps.type";
import { Image } from "@unpic/react";
import { useEffect, useState } from "react";

interface AvatarIconProps extends IconProps {
  avatarURL: string | null;
  alt?: string;
  fallbackText?: string;
}

export const AvatarIcon = ({
  size = 24,
  className = "",
  avatarURL,
  alt = "",
  fallbackText = "U",
}: AvatarIconProps) => {
  const [imageFailed, setImageFailed] = useState(false);
  const fallbackValue = fallbackText.trim() || "U";
  const firstEnglishLetter = fallbackValue.match(/[A-Za-z]/)?.[0];
  const fallbackInitial =
    firstEnglishLetter?.toUpperCase() ||
    fallbackValue.charAt(0).toUpperCase() ||
    "U";
  const hasAvatar = Boolean(avatarURL) && !imageFailed;

  useEffect(() => {
    setImageFailed(false);
  }, [avatarURL]);

  return (
    <div
      className={
        "inline-flex items-center justify-center overflow-hidden rounded-full bg-primary text-primary-foreground " +
        className
      }
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
      }}
    >
      {hasAvatar ? (
        <Image
          src={avatarURL ?? ""}
          alt={alt}
          width={80}
          height={80}
          className="w-full h-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span
          className="text-primary-foreground font-medium"
          style={{ fontSize: size * 0.4 }}
        >
          {fallbackInitial}
        </span>
      )}
    </div>
  );
};

export default AvatarIcon;
