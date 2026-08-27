import { createFileRoute, Outlet } from "@tanstack/react-router";
import RoutinesLayout from "@/pages/app/routines/RoutinesLayout";

export const Route = createFileRoute("/app/routines")({
  ssr: false,
  component: RoutinesRouteLayout,
});

function RoutinesRouteLayout() {
  return (
    <RoutinesLayout>
      <Outlet />
    </RoutinesLayout>
  );
}
