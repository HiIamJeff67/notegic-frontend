export type ClockStyleName = "minimal" | "classic" | "modern";

export type ClockStyleProperties = {
  face: string;
  hour: string;
  minute: string;
  second: string;
  center: string;
};

export type ClockStyle = {
  index: number;
  name: ClockStyleName;
  properties: ClockStyleProperties;
};
export const ClockStyles: ClockStyle[] = [
  {
    index: 0,
    name: "classic",
    properties: {
      face: "stroke-foreground border-2 fill-background",
      hour: "stroke-primary",
      minute: "stroke-primary/80",
      second: "stroke-destructive",
      center: "fill-primary",
    },
  },
  {
    index: 1,
    name: "minimal",
    properties: {
      face: "stroke-foreground/20 fill-transparent",
      hour: "stroke-foreground",
      minute: "stroke-foreground/70",
      second: "stroke-red-500",
      center: "fill-foreground",
    },
  },
  {
    index: 2,
    name: "modern",
    properties: {
      face: "stroke-blue-500/50 fill-blue-500/10",
      hour: "stroke-blue-600 dark:stroke-blue-400",
      minute: "stroke-blue-400 dark:stroke-blue-300",
      second: "stroke-indigo-500",
      center: "fill-blue-600 dark:fill-blue-400",
    },
  },
];
