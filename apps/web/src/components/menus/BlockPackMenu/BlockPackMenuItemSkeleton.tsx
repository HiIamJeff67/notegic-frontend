import {
  SidebarMenuSkeleton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

const BlockPackMenuItemSkeleton = ({ number = 1 }: { number?: number }) => {
  return (
    <>
      {Array.from({ length: number }).map((_, index) => (
        <SidebarMenuSubItem key={index}>
          <SidebarMenuSkeleton className="rounded-sm" />
        </SidebarMenuSubItem>
      ))}
    </>
  );
};

export default BlockPackMenuItemSkeleton;
