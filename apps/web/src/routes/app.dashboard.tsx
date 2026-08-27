import { createFileRoute, Outlet } from "@tanstack/react-router";
import DashboardLayout from "@/pages/app/dashboard/DashboardLayout";

export const Route = createFileRoute("/app/dashboard")({
  component: DashboardRouteLayout,
});

function DashboardRouteLayout() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}
