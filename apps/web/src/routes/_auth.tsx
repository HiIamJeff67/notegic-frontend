import { createFileRoute, Outlet } from "@tanstack/react-router";
import { OAuthProvider } from "@/providers/OAuthProvider";
import { TransactionSynchronizerProvider } from "@/providers/TransactionSynchronizerProvider/TransactionSynchronizerProvider";
import { UserProvider } from "@/providers/UserProvider";

export const Route = createFileRoute("/_auth")({
  component: AuthRouteLayout,
});

function AuthRouteLayout() {
  return (
    <TransactionSynchronizerProvider>
      <UserProvider autoFetchUserData={false}>
        <OAuthProvider>
          <Outlet />
        </OAuthProvider>
      </UserProvider>
    </TransactionSynchronizerProvider>
  );
}
