import { useContext } from "react";
import { TransactionSynchronizerContext } from "@/providers/TransactionSynchronizerProvider/TransactionSynchronizerProvider";

export function useTransactionSynchronizer() {
  const context = useContext(TransactionSynchronizerContext);
  if (!context) {
    throw new Error(
      "useTransactionSynchronizer must be used within TransactionSynchronizerProvider"
    );
  }
  return context;
}
