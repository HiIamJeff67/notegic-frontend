import { Outlet } from "@tanstack/react-router";
import { OAuthProvider } from "@/providers/OAuthProvider";
import { TransactionSynchronizerProvider } from "@/providers/TransactionSynchronizerProvider/TransactionSynchronizerProvider";
import { UserProvider } from "@/providers/UserProvider";

export function AuthLayout() {
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
