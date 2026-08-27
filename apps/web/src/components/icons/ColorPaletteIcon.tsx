import { IconProps } from "@shared/types/iconProps.type";

const ColorPaletteIcon = ({ size = 24, className = "" }: IconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ transform: "rotate(45deg)" }}
    >
      {/* 調色盤主體 - 立體效果 */}
      <defs>
        <linearGradient
          id="paletteGradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.3" />
        </linearGradient>
        <filter id="shadow">
          <feDropShadow dx="1" dy="1" stdDeviation="1" floodOpacity="0.2" />
        </filter>
      </defs>

      <path
        d="M12.5 2.5C13.6 2.5 14.7 2.7 15.7 3.2C16.7 3.6 17.6 4.2 18.4 5C19.2 5.8 19.8 6.7 20.2 7.7C20.7 8.7 20.9 9.8 20.9 10.9C20.9 11.9 20.6 12.8 20.1 13.6C19.6 14.4 18.9 15 18.1 15.4L17.4 15.7H16.7C16.4 15.7 16.2 15.8 16 16C15.8 16.2 15.7 16.4 15.7 16.7V17.4C15.7 18 15.5 18.5 15.1 18.9C14.7 19.3 14.2 19.5 13.6 19.5H11.4C10.8 19.5 10.3 19.3 9.9 18.9C9.5 18.5 9.3 18 9.3 17.4V16.7C9.3 16.4 9.2 16.2 9 16C8.8 15.8 8.6 15.7 8.3 15.7H7.6L6.9 15.4C6.1 15 5.4 14.4 4.9 13.6C4.4 12.8 4.1 11.9 4.1 10.9C4.1 8.6 5 6.5 6.6 4.9C8.2 3.3 10.3 2.5 12.5 2.5Z"
        fill="currentColor"
        opacity="0.1"
      />

      <path
        d="M12 2C13.1 2 14.2 2.2 15.2 2.7C16.2 3.1 17.1 3.7 17.9 4.5C18.7 5.3 19.3 6.2 19.7 7.2C20.2 8.2 20.4 9.3 20.4 10.4C20.4 11.4 20.1 12.3 19.6 13.1C19.1 13.9 18.4 14.5 17.6 14.9L16.9 15.2H16.2C15.9 15.2 15.7 15.3 15.5 15.5C15.3 15.7 15.2 15.9 15.2 16.2V16.9C15.2 17.5 15 18 14.6 18.4C14.2 18.8 13.7 19 13.1 19H10.9C10.3 19 9.8 18.8 9.4 18.4C9 18 8.8 17.5 8.8 16.9V16.2C8.8 15.9 8.7 15.7 8.5 15.5C8.3 15.3 8.1 15.2 7.8 15.2H7.1L6.4 14.9C5.6 14.5 4.9 13.9 4.4 13.1C3.9 12.3 3.6 11.4 3.6 10.4C3.6 8.1 4.5 6 6.1 4.4C7.7 2.8 9.8 2 12 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="url(#paletteGradient)"
        filter="url(#shadow)"
      />

      <circle cx="9" cy="8" r="1.8" fill="currentColor" opacity="0.2" />
      <circle cx="9" cy="8" r="1.5" fill="currentColor" opacity="0.8" />

      <circle cx="15" cy="8" r="1.8" fill="currentColor" opacity="0.2" />
      <circle cx="15" cy="8" r="1.5" fill="currentColor" opacity="0.6" />

      <circle cx="12" cy="6" r="1.8" fill="currentColor" opacity="0.2" />
      <circle cx="12" cy="6" r="1.5" fill="currentColor" opacity="0.7" />

      <circle cx="7" cy="11" r="1.8" fill="currentColor" opacity="0.2" />
      <circle cx="7" cy="11" r="1.5" fill="currentColor" opacity="0.5" />

      <circle cx="17" cy="11" r="1.8" fill="currentColor" opacity="0.2" />
      <circle cx="17" cy="11" r="1.5" fill="currentColor" opacity="0.4" />

      <path
        d="M12 19V22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.3"
      />
      <path
        d="M12 19V22"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default ColorPaletteIcon;
