import {
  SidebarMenuSkeleton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

const RoutineMenuItemSkeleton = ({ number = 1 }: { number?: number }) => {
  return (
    <>
      {Array.from({ length: number }).map((_, index) => (
        <SidebarMenuSubItem key={index}>
          <SidebarMenuSkeleton className="h-7 rounded-sm" />
        </SidebarMenuSubItem>
      ))}
    </>
  );
};

export default RoutineMenuItemSkeleton;
