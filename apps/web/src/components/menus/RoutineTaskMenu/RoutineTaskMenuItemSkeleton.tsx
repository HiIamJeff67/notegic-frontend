import {
  SidebarMenuSkeleton,
  SidebarMenuSubItem,
} from "@shared/components/shadcn/sidebar";

const RoutineTaskMenuItemSkeleton = ({ number = 1 }: { number?: number }) => (
  <>
    {Array.from({ length: number }).map((_, index) => (
      <SidebarMenuSubItem key={index}>
        <SidebarMenuSkeleton showIcon className="h-7 rounded-sm" />
      </SidebarMenuSubItem>
    ))}
  </>
);

export default RoutineTaskMenuItemSkeleton;
