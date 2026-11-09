import Image from "@/components/commons/Image/Image";

interface ModifyImageHoverProps {
  imageSrc?: string;
  imageAlt?: string;
  onClick: () => void | Promise<void>;
  className?: string;
  hoverText: string;
  hoverTextClassName?: string;
}

const ModifyImageHover = ({
  imageSrc = "",
  imageAlt = "",
  onClick,
  className = "bg-black/30",
  hoverText,
  hoverTextClassName = "text-white text-xl font-semibold",
}: ModifyImageHoverProps) => {
  return (
    <button
      type="button"
      className={`w-full h-full inset-0 opacity-0 enabled:hover:opacity-100 focus-visible:opacity-100 flex items-center justify-center cursor-pointer transition ${className}`}
      onClick={onClick}
    >
      {imageSrc && (
        <Image
          src={imageSrc}
          alt={imageAlt}
          width={240}
          height={240}
          className="select-none w-full h-full"
        />
      )}
      <span className={hoverTextClassName}>{hoverText}</span>
    </button>
  );
};

export default ModifyImageHover;
