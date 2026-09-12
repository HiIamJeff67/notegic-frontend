import { AvatarImage } from "@/components/ui/avatar";
import type { ComponentProps } from "react";

interface PublicAvatarImageProps extends ComponentProps<typeof AvatarImage> {
  avatarURL?: string | null;
}

const PublicAvatarImage = ({ avatarURL, ...props }: PublicAvatarImageProps) => {
  return <AvatarImage {...props} src={avatarURL ?? undefined} />;
};

export default PublicAvatarImage;
