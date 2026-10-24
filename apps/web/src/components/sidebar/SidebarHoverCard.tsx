import { type ComponentProps, useState } from "react";
import { HoverCard } from "@/components/ui/hover-card";
import { useLocalPreferences } from "@/hooks/useLocalPreferences";
import { MaxSidebarHoverDelay } from "@/providers/LocalPreferencesProvider";

const SidebarHoverCard = ({
  open,
  defaultOpen = false,
  onOpenChange,
  ...props
}: Omit<ComponentProps<typeof HoverCard>, "openDelay">) => {
  const { preferences } = useLocalPreferences();
  const delay = preferences.sidebarHoverDelay;
  const enabled = delay < MaxSidebarHoverDelay && open !== false;
  const [card, setCard] = useState({ delay, enabled, open: defaultOpen });

  // Reset a pending/open preview when its policy changes, without remounting its trigger.
  if (card.delay !== delay || card.enabled !== enabled) {
    setCard({ delay, enabled, open: false });
  }

  return (
    <HoverCard
      closeDelay={100}
      {...props}
      openDelay={delay}
      open={enabled && (open ?? card.open)}
      onOpenChange={nextOpen => {
        setCard({ delay, enabled, open: enabled && nextOpen });
        onOpenChange?.(enabled && nextOpen);
      }}
    />
  );
};

export default SidebarHoverCard;
