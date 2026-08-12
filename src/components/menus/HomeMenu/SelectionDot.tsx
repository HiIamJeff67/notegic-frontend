export const SelectionDot = ({ selected }: { selected: boolean }) => (
  <span className="relative z-10 flex size-3 shrink-0 items-center justify-center rounded-full border border-foreground">
    {selected && <span className="size-1.5 rounded-full bg-foreground" />}
  </span>
);
