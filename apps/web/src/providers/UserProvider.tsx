import { NotegicAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NetworkExceptions } from "@shared/api/exceptions/network.exception";
import {
  User,
  UserAccount,
  UserData,
  UserInfo,
} from "@shared/api/interfaces/types/user.type";
import type { UserQuota } from "@shared/api/interfaces/types/userQuota.type";
import toast from "@shared/lib/toast/toast";
import { WebURLPathDictionary } from "@shared/lib/url/web";
import React, {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { isVirtualMode } from "@/api/availability";
import { getClientRequestHeaders } from "@/api/clientHeaders";
import { useLogout } from "@/api/hooks/auth.hook";
import { useGetMe, useGetUserData } from "@/api/hooks/user.hook";
import { useGetMyAccount } from "@/api/hooks/userAccount.hook";
import { useGetMyInfo } from "@/api/hooks/userInfo.hook";
import { useGetMyQuota } from "@/api/hooks/userQuota.hook";
import { UserLocalSynchronizer } from "@/api/local/synchronizers/user.synchronizer";
import { useAppRouterActions, useLoading, useNetwork } from "@/hooks";
import { useTranslation } from "@/hooks/useTranslation";
import { clearMaterialAttachmentCache } from "@/providers/MaterialAttachmentCacheProvider";

interface UserContextType {
  userData: UserData | null;
  setUserData: (userData: UserData | null) => void;
  updateUserData: (fields: Partial<UserData>) => boolean;
  fetchUserData: () => Promise<UserData>;

  user: User | null;
  setUser: (user: User | null) => void;
  updateUser: (fields: Partial<User>) => boolean;
  fetchUser: () => Promise<void>;

  userInfo: UserInfo | null;
  setUserInfo: (userInfo: UserInfo | null) => void;
  updateUserInfo: (fields: Partial<UserInfo>) => boolean;
  fetchUserInfo: () => Promise<void>;

  userAccount: UserAccount | null;
  setUserAccount: (userAccount: UserAccount | null) => void;
  updateUserAccount: (fields: Partial<UserAccount>) => boolean;
  fetchUserAccount: () => Promise<void>;

  userQuota: UserQuota | null;
  fetchUserQuota: () => Promise<void>;

  logout: () => void;
}

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

export const UserProvider = ({
  children,
  autoFetchUserData = false,
}: {
  children: React.ReactNode;
  autoFetchUserData?: boolean;
}) => {
  const { t } = useTranslation();
  const router = useAppRouterActions();
  const loadingManager = useLoading();
  const { isOnline } = useNetwork();

  const getUserDataQuerier = useGetUserData();
  const getMeQuerier = useGetMe();
  const getMyInfoQuerier = useGetMyInfo();
  const getMyAccountQuerier = useGetMyAccount();
  const getMyQuotaQuerier = useGetMyQuota();
  const logoutMutator = useLogout();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [userAccount, setUserAccount] = useState<UserAccount | null>(null);
  const [userQuota, setUserQuota] = useState<UserQuota | null>(null);

  const logoutInFlightRef = useRef<Promise<void> | null>(null);
  const hasExpiredSessionRef = useRef(false);
  const hasAttemptedInitialUserDataFetchRef = useRef(false);
  const initialQuotaFetchUserPublicIdRef = useRef<string | null>(null);

  const logout = useCallback(async () => {
    if (logoutInFlightRef.current) {
      await logoutInFlightRef.current;
      return;
    }

    const task = (async () => {
      setUserData(null);
      setUser(null);
      setUserInfo(null);
      setUserAccount(null);
      setUserQuota(null);
      initialQuotaFetchUserPublicIdRef.current = null;

      const userAgent = navigator.userAgent;
      try {
        await UserLocalSynchronizer.clearLoggedIn();
        if (isOnline && !isVirtualMode()) {
          await logoutMutator.mutateAsync({
            header: getClientRequestHeaders(userAgent),
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        await clearMaterialAttachmentCache();
      }
    })();

    logoutInFlightRef.current = task;
    try {
      await task;
    } finally {
      logoutInFlightRef.current = null;
    }
  }, [isOnline, logoutMutator]);

  const expireSession = useCallback(async () => {
    if (hasExpiredSessionRef.current) return;
    hasExpiredSessionRef.current = true;

    try {
      await logout();
    } catch (error) {
      console.error("failed to notify the server about session expiry", error);
    } finally {
      if (
        !router.isSamePath(
          router.getCurrentPath(),
          WebURLPathDictionary.home
        ) &&
        !router.isSamePath(
          router.getCurrentPath(),
          WebURLPathDictionary.auth.login
        )
      ) {
        toast.error(t("workspace.notifications.sessionExpired"));
        router.push(WebURLPathDictionary.auth.login);
      }
    }
  }, [logout, router, t]);

  useEffect(() => {
    if (userData !== null) hasExpiredSessionRef.current = false;
  }, [userData]);

  const fetchUserData = useCallback(
    async () =>
      await loadingManager.startAsyncTransactionLoading(async () => {
        if (isVirtualMode()) {
          const data = await UserLocalSynchronizer.ensureLoggedInUser();
          setUserData(data);
          return data;
        }

        try {
          if (typeof navigator !== "undefined" && navigator.onLine === false) {
            throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
          }

          const userAgent = navigator.userAgent;
          const response = await getUserDataQuerier.fetch({
            header: getClientRequestHeaders(userAgent),
            body: {},
          });
          setUserData(response.data);
          return response.data;
        } catch (error) {
          if (!NetworkExceptions.isMissingNetworkError(error)) throw error;
          const localUser = await UserLocalSynchronizer.getLoggedInUser();
          if (!localUser) {
            throw new NotegicAPIError(FetchClientExceptions.NetworkRequired());
          }
          setUserData(localUser);
          return localUser;
        }
      }),
    [getUserDataQuerier, loadingManager]
  );

  useEffect(() => {
    if (
      !autoFetchUserData ||
      hasAttemptedInitialUserDataFetchRef.current ||
      userData !== null
    ) {
      return;
    }

    hasAttemptedInitialUserDataFetchRef.current = true;

    void fetchUserData().catch(error => {
      console.error(error);
      const requiresLogin =
        NetworkExceptions.isMissingNetworkError(error) ||
        NetworkExceptions.isNetworkRequiredError(error);
      if (requiresLogin) {
        const path = router.getCurrentPath();
        if (
          !router.isSamePath(path, WebURLPathDictionary.home) &&
          !router.isSamePath(path, WebURLPathDictionary.auth.login)
        ) {
          router.push(WebURLPathDictionary.auth.login);
        }
        return;
      }

      void expireSession();
    });
  }, [autoFetchUserData, expireSession, fetchUserData, router, userData]);

  const updateUserData = (fields: Partial<UserData>): boolean => {
    if (!isOnline) return false;
    if (userData === null) return false;
    setUserData(prev => (prev ? { ...prev, ...fields } : null));
    return userData !== null;
  };

  const fetchUser = useCallback(
    async () =>
      await loadingManager.startAsyncTransactionLoading(async () => {
        try {
          if (isVirtualMode() || !isOnline) return;

          const userAgent = navigator.userAgent;
          const response = await getMeQuerier.fetch({
            header: getClientRequestHeaders(userAgent),
          });

          setUser(response.data);
        } catch (error) {
          console.error(error);
          if (NetworkExceptions.isMissingNetworkError(error)) return;
          await expireSession();
          return;
        }
      }),
    [expireSession, getMeQuerier, isOnline, loadingManager]
  );

  const updateUser = (fields: Partial<User>): boolean => {
    if (!isOnline) return false;
    if (user === null) return false;
    setUser(prev => (prev ? { ...prev, ...fields } : null));
    return user !== null;
  };

  const fetchUserInfo = useCallback(
    async () =>
      await loadingManager.startAsyncTransactionLoading(async () => {
        try {
          if (isVirtualMode() || !isOnline) return;

          const userAgent = navigator.userAgent;
          const response = await getMyInfoQuerier.fetch({
            header: getClientRequestHeaders(userAgent),
          });

          setUserInfo(response.data);
        } catch (error) {
          console.error(error);
          if (NetworkExceptions.isMissingNetworkError(error)) return;
          await expireSession();
          return;
        }
      }),
    [expireSession, getMyInfoQuerier, isOnline, loadingManager]
  );

  const updateUserInfo = (fields: Partial<UserInfo>): boolean => {
    if (!isOnline) return false;
    if (userInfo === null) return false;
    setUserInfo(prev => (prev ? { ...prev, ...fields } : null));
    return userInfo !== null;
  };

  const fetchUserAccount = useCallback(
    async () =>
      await loadingManager.startAsyncTransactionLoading(async () => {
        try {
          if (isVirtualMode() || !isOnline) return;

          const userAgent = navigator.userAgent;
          const response = await getMyAccountQuerier.fetch({
            header: getClientRequestHeaders(userAgent),
          });

          setUserAccount(response.data);
        } catch (error) {
          console.error(error);
          if (NetworkExceptions.isMissingNetworkError(error)) return;
          await expireSession();
          return;
        }
      }),
    [expireSession, getMyAccountQuerier, isOnline, loadingManager]
  );

  const updateUserAccount = (fields: Partial<UserAccount>): boolean => {
    if (!isOnline) return false;
    if (userAccount === null) return false;
    setUserAccount(prev => (prev ? { ...prev, ...fields } : null));
    return userAccount !== null;
  };

  const fetchUserQuota = useCallback(
    async () =>
      await loadingManager.startAsyncTransactionLoading(async () => {
        try {
          if (isVirtualMode() || !isOnline) return;

          const userAgent = navigator.userAgent;
          const response = await getMyQuotaQuerier.fetch({
            header: getClientRequestHeaders(userAgent),
          });
          setUserQuota(response.data);
        } catch (error) {
          console.error(error);
          if (NetworkExceptions.isMissingNetworkError(error)) return;
          await expireSession();
        }
      }),
    [expireSession, getMyQuotaQuerier, isOnline, loadingManager]
  );

  useEffect(() => {
    if (userData === null) {
      initialQuotaFetchUserPublicIdRef.current = null;
      return;
    }

    if (initialQuotaFetchUserPublicIdRef.current === userData.publicId) {
      return;
    }

    initialQuotaFetchUserPublicIdRef.current = userData.publicId;
    setUserQuota(null);
    void fetchUserQuota();
  }, [fetchUserQuota, userData]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleAuthenticationRequired = () => {
      if (isVirtualMode()) return;
      void expireSession();
    };
    window.addEventListener(
      "notegic:auth-required",
      handleAuthenticationRequired
    );
    return () =>
      window.removeEventListener(
        "notegic:auth-required",
        handleAuthenticationRequired
      );
  }, [expireSession]);

  const contextValue: UserContextType = {
    userData: userData,
    setUserData: setUserData,
    updateUserData: updateUserData,
    fetchUserData: fetchUserData,

    user: user,
    setUser: setUser,
    fetchUser: fetchUser,
    updateUser: updateUser,

    userInfo: userInfo,
    setUserInfo: setUserInfo,
    fetchUserInfo: fetchUserInfo,
    updateUserInfo: updateUserInfo,

    userAccount: userAccount,
    setUserAccount: setUserAccount,
    fetchUserAccount: fetchUserAccount,
    updateUserAccount: updateUserAccount,

    userQuota: userQuota,
    fetchUserQuota: fetchUserQuota,

    logout: logout,
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};
