import { createFileRoute } from "@tanstack/react-router";
import AdminPage from "@/pages/app/admin/AdminPage";

export const Route = createFileRoute("/app/admin")({
  component: RouteComponent,
});

function RouteComponent() {
  return <AdminPage />;
}
