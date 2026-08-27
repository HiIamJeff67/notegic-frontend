import { getClientRequestHeaders } from "@/api/clientHeaders";
import { NotegicAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { useLogout } from "@/api/hooks/auth.hook";
import { useGetMe, useGetUserData } from "@/api/hooks/user.hook";
import { useGetMyAccount } from "@/api/hooks/userAccount.hook";
import { useGetMyInfo } from "@/api/hooks/userInfo.hook";
import { clearMaterialAttachmentCache } from "@/api/local/material-attachment.cache";
import { WebURLPathDictionary } from "@shared/constants";
import toast from "@shared/lib/toast";
import { User, UserAccount, UserData, UserInfo } from "@shared/types/user.type";
import React, {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAppRouterActions, useLoading, useNetwork } from "@/hooks";
import i18n from "@/i18n";

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
  const router = useAppRouterActions();
  const loadingManager = useLoading();
  const { isOnline } = useNetwork();

  const getUserDataQuerier = useGetUserData();
  const getMeQuerier = useGetMe();
  const getMyInfoQuerier = useGetMyInfo();
  const getMyAccountQuerier = useGetMyAccount();
  const logoutMutator = useLogout();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [userAccount, setUserAccount] = useState<UserAccount | null>(null);

  const logoutInFlightRef = useRef<Promise<void> | null>(null);
  const hasAttemptedInitialUserDataFetchRef = useRef(false);

  const fetchUserData = useCallback(
    async () =>
      await loadingManager.startAsyncTransactionLoading(async () => {
        if (!isOnline) {
          throw new NotegicAPIError(FetchClientExceptions.NetworkRequired());
        }

        const userAgent = navigator.userAgent;
        const response = await getUserDataQuerier.fetch({
          header: getClientRequestHeaders(userAgent),
          body: {},
        });

        setUserData(response.data);
        return response.data;
      }),
    [getUserDataQuerier, isOnline, loadingManager]
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

      if (
        !(error instanceof NotegicAPIError) ||
        error.unWrap.reason !== FetchClientExceptions.NetworkRequired().reason
      ) {
        if (
          !router.isSamePath(router.getCurrentPath(), WebURLPathDictionary.home)
        ) {
          toast.error(i18n.t("workspace.notifications.sessionExpired"));
          router.push(WebURLPathDictionary.auth.login);
        }
      }
    });
  }, [autoFetchUserData, fetchUserData, router, userData]);

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
          if (!isOnline)
            throw new NotegicAPIError(FetchClientExceptions.NetworkRequired());

          const userAgent = navigator.userAgent;
          const response = await getMeQuerier.fetch({
            header: getClientRequestHeaders(userAgent),
          });

          setUser(response.data);
        } catch (error) {
          console.error(error);
          if (
            !(error instanceof NotegicAPIError) ||
            error.unWrap.reason !==
              FetchClientExceptions.NetworkRequired().reason
          ) {
            if (
              !router.isSamePath(
                router.getCurrentPath(),
                WebURLPathDictionary.home
              )
            ) {
              toast.error(i18n.t("workspace.notifications.sessionExpired"));
              router.push(WebURLPathDictionary.auth.login);
            }
          }
          return;
        }
      }),
    [router, loadingManager]
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
          if (!isOnline)
            throw new NotegicAPIError(FetchClientExceptions.NetworkRequired());

          const userAgent = navigator.userAgent;
          const response = await getMyInfoQuerier.fetch({
            header: getClientRequestHeaders(userAgent),
          });

          setUserInfo(response.data);
        } catch (error) {
          console.error(error);
          if (
            !(error instanceof NotegicAPIError) ||
            error.unWrap.reason !==
              FetchClientExceptions.NetworkRequired().reason
          ) {
            if (
              !router.isSamePath(
                router.getCurrentPath(),
                WebURLPathDictionary.home
              )
            ) {
              toast.error(i18n.t("workspace.notifications.sessionExpired"));
              router.push(WebURLPathDictionary.auth.login);
            }
          }
          return;
        }
      }),
    [router, loadingManager]
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
          if (!isOnline)
            throw new NotegicAPIError(FetchClientExceptions.NetworkRequired());

          const userAgent = navigator.userAgent;
          const response = await getMyAccountQuerier.fetch({
            header: getClientRequestHeaders(userAgent),
          });

          setUserAccount(response.data);
        } catch (error) {
          console.error(error);
          if (
            !(error instanceof NotegicAPIError) ||
            error.unWrap.reason !==
              FetchClientExceptions.NetworkRequired().reason
          ) {
            if (
              !router.isSamePath(
                router.getCurrentPath(),
                WebURLPathDictionary.home
              )
            ) {
              toast.error(i18n.t("workspace.notifications.sessionExpired"));
              router.push(WebURLPathDictionary.auth.login);
            }
          }
          return;
        }
      }),
    [router, loadingManager]
  );

  const updateUserAccount = (fields: Partial<UserAccount>): boolean => {
    if (!isOnline) return false;
    if (userAccount === null) return false;
    setUserAccount(prev => (prev ? { ...prev, ...fields } : null));
    return userAccount !== null;
  };

  const logout = useCallback(async () => {
    if (logoutInFlightRef.current) {
      await logoutInFlightRef.current;
      return;
    }

    // to make sure the logout procedure is only done once
    const task = (async () => {
      setUserData(null);
      setUser(null);
      setUserInfo(null);
      setUserAccount(null);

      const userAgent = navigator.userAgent;
      try {
        if (isOnline) {
          await logoutMutator.mutateAsync({
            header: getClientRequestHeaders(userAgent),
          });
        }
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

    logout: logout,
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};
