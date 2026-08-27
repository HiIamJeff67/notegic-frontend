import { useContext } from "react";
import {
  AppRouterActionsContext,
  AppRouterContext,
  AppRouterStateContext,
} from "@/providers/AppRouterProvider";

export const useAppRouter = () => {
  const context = useContext(AppRouterContext);
  if (!context) {
    throw new Error("useAppRouter must be used within a AppRouterProvider");
  }
  return context;
};

export const useAppRouterState = () => {
  const context = useContext(AppRouterStateContext);
  if (!context) {
    throw new Error(
      "useAppRouterState must be used within a AppRouterProvider"
    );
  }
  return context;
};

export const useAppRouterActions = () => {
  const context = useContext(AppRouterActionsContext);
  if (!context) {
    throw new Error(
      "useAppRouterActions must be used within a AppRouterProvider"
    );
  }
  return context;
};
