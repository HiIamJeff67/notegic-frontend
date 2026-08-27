import { cn } from "@shared/util/utils";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface ColorPickerProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

const ColorPicker = ({
  value,
  onValueChange,
  disabled = false,
  className,
}: ColorPickerProps) => {
  const { t } = useTranslation();
  const red = Number.parseInt(value.slice(1, 3), 16) / 255;
  const green = Number.parseInt(value.slice(3, 5), 16) / 255;
  const blue = Number.parseInt(value.slice(5, 7), 16) / 255;
  const maximum = Math.max(red, green, blue);
  const minimum = Math.min(red, green, blue);
  const difference = maximum - minimum;

  let colorHue = 0;
  if (difference !== 0) {
    if (maximum === red) {
      colorHue = 60 * (((green - blue) / difference) % 6);
    } else if (maximum === green) {
      colorHue = 60 * ((blue - red) / difference + 2);
    } else {
      colorHue = 60 * ((red - green) / difference + 4);
    }
  }
  if (colorHue < 0) colorHue += 360;

  const saturation = maximum === 0 ? 0 : difference / maximum;
  const brightness = maximum;

  const [hue, setHue] = useState<number>(colorHue);
  const isDraggingColorRef = useRef<boolean>(false);
  const isDraggingHueRef = useRef<boolean>(false);

  useEffect(() => {
    if (saturation > 0) setHue(colorHue);
  }, [colorHue, saturation]);

  const updateColor = (
    nextHue: number,
    nextSaturation: number,
    nextBrightness: number
  ) => {
    const chroma = nextBrightness * nextSaturation;
    const hueSection = nextHue / 60;
    const secondary = chroma * (1 - Math.abs((hueSection % 2) - 1));
    const match = nextBrightness - chroma;

    let nextRed = 0;
    let nextGreen = 0;
    let nextBlue = 0;

    if (hueSection < 1) {
      nextRed = chroma;
      nextGreen = secondary;
    } else if (hueSection < 2) {
      nextRed = secondary;
      nextGreen = chroma;
    } else if (hueSection < 3) {
      nextGreen = chroma;
      nextBlue = secondary;
    } else if (hueSection < 4) {
      nextGreen = secondary;
      nextBlue = chroma;
    } else if (hueSection < 5) {
      nextRed = secondary;
      nextBlue = chroma;
    } else {
      nextRed = chroma;
      nextBlue = secondary;
    }

    onValueChange(
      `#${Math.round((nextRed + match) * 255)
        .toString(16)
        .padStart(2, "0")}${Math.round((nextGreen + match) * 255)
        .toString(16)
        .padStart(2, "0")}${Math.round((nextBlue + match) * 255)
        .toString(16)
        .padStart(2, "0")}`
    );
  };

  const updateColorFromPointer = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const nextSaturation = Math.min(
      1,
      Math.max(0, (event.clientX - bounds.left) / bounds.width)
    );
    const nextBrightness = Math.min(
      1,
      Math.max(0, 1 - (event.clientY - bounds.top) / bounds.height)
    );
    updateColor(hue, nextSaturation, nextBrightness);
  };

  const updateHueFromPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const nextHue =
      Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width)) *
      359;
    setHue(nextHue);
    updateColor(nextHue, saturation, brightness);
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={t("workspace.accessibility.colorSaturationBrightness")}
        aria-disabled={disabled}
        className={cn(
          "relative h-28 w-full touch-none overflow-hidden rounded-sm border border-border shadow-inner",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-crosshair"
        )}
        style={{ backgroundColor: `hsl(${hue} 100% 50%)` }}
        onPointerDown={event => {
          if (disabled) return;
          isDraggingColorRef.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          updateColorFromPointer(event);
        }}
        onPointerMove={event => {
          if (isDraggingColorRef.current) updateColorFromPointer(event);
        }}
        onPointerUp={event => {
          isDraggingColorRef.current = false;
          event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={() => {
          isDraggingColorRef.current = false;
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent to-black" />
        <span
          className="pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.55)]"
          style={{
            left: `${saturation * 100}%`,
            top: `${(1 - brightness) * 100}%`,
          }}
        />
      </div>

      <div
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={t("workspace.accessibility.colorHue")}
        aria-valuemin={0}
        aria-valuemax={359}
        aria-valuenow={Math.round(hue)}
        aria-disabled={disabled}
        className={cn(
          "relative h-3 w-full touch-none rounded-full border border-border",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-ew-resize"
        )}
        style={{
          background:
            "linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)",
        }}
        onPointerDown={event => {
          if (disabled) return;
          isDraggingHueRef.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          updateHueFromPointer(event);
        }}
        onPointerMove={event => {
          if (isDraggingHueRef.current) updateHueFromPointer(event);
        }}
        onPointerUp={event => {
          isDraggingHueRef.current = false;
          event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={() => {
          isDraggingHueRef.current = false;
        }}
      >
        <span
          className="pointer-events-none absolute top-1/2 h-5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-sm border-2 border-background bg-foreground shadow-sm"
          style={{ left: `${(hue / 359) * 100}%` }}
        />
      </div>

      <div className="flex items-center gap-2">
        <span
          className="size-7 shrink-0 rounded-sm border border-foreground/20 shadow-sm"
          style={{ backgroundColor: value }}
        />
        <span className="font-mono text-xs text-muted-foreground">
          {value.toUpperCase()}
        </span>
      </div>
    </div>
  );
};

export default ColorPicker;
