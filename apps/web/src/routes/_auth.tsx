import { createFileRoute, Outlet } from "@tanstack/react-router";
import { TransactionSynchronizerProvider } from "@/providers/TransactionSynchronizerProvider/TransactionSynchronizerProvider";
import { UserProvider } from "@/providers/UserProvider";

export const Route = createFileRoute("/_auth")({
  component: AuthRouteLayout,
});

function AuthRouteLayout() {
  return (
    <TransactionSynchronizerProvider>
      <UserProvider autoFetchUserData={false}>
        <Outlet />
      </UserProvider>
    </TransactionSynchronizerProvider>
  );
}
