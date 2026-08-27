import { SidebarMenuItem, SidebarMenuSkeleton } from "@/components/ui/sidebar";

const RoutineTagMenuItemSkeleton = ({ number = 1 }: { number?: number }) => (
  <>
    {Array.from({ length: number }).map((_, index) => (
      <SidebarMenuItem key={index}>
        <SidebarMenuSkeleton showIcon className="rounded-sm" />
      </SidebarMenuItem>
    ))}
  </>
);

export default RoutineTagMenuItemSkeleton;
