import { SidebarMenuItem, SidebarMenuSkeleton } from "@/components/ui/sidebar";

const RootShelfMenuItemSkeleton = ({ number = 1 }: { number?: number }) => {
  return (
    <>
      {Array.from({ length: number }).map((_, index) => (
        <SidebarMenuItem key={index}>
          <SidebarMenuSkeleton className="rounded-sm" />
        </SidebarMenuItem>
      ))}
    </>
  );
};

export default RootShelfMenuItemSkeleton;
