import {
  clearLegacyCredentialStorage,
  getClientRequestHeaders,
} from "@shared/api/clientHeaders";
import { NotezyAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { useLogout } from "@shared/api/hooks/auth.hook";
import { useGetMe, useGetUserData } from "@shared/api/hooks/user.hook";
import { useGetMyAccount } from "@shared/api/hooks/userAccount.hook";
import { useGetMyInfo } from "@shared/api/hooks/userInfo.hook";
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
import { useTransactionSynchronizer } from "@/hooks/useTransactionSynchronizer";
import i18n from "@/i18n";

interface UserContextType {
  enableInitialFetching: boolean;
  setEnableInitialFetching: (state: boolean) => void;

  userData: UserData | null;
  setUserData: (userData: UserData | null) => void;
  updateUserData: (fields: Partial<UserData>) => boolean;
  fetchUserData: () => Promise<void>;

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

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useAppRouterActions();
  const loadingManager = useLoading();
  const { isOnline } = useNetwork();
  const { status: transactionSynchronizerStatus } =
    useTransactionSynchronizer();
  const isLocalDBReady = transactionSynchronizerStatus === "synchronized";

  const getUserDataQuerier = useGetUserData();
  const getMeQuerier = useGetMe();
  const getMyInfoQuerier = useGetMyInfo();
  const getMyAccountQuerier = useGetMyAccount();
  const logoutMutator = useLogout();

  const [enableInitialFetching, setEnableInitialFetching] =
    useState<boolean>(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [userAccount, setUserAccount] = useState<UserAccount | null>(null);

  useEffect(() => {
    clearLegacyCredentialStorage();
  }, []);

  const isAutoFetchingUserDataRef = useRef(false);
  const logoutInFlightRef = useRef<Promise<void> | null>(null);
  const fetchUserDataRef = useRef<() => Promise<void>>(async () => {});

  const fetchUserData = useCallback(
    async () =>
      await loadingManager.startAsyncTransactionLoading(async () => {
        try {
          console.debug("fetching user automatically...");
          if (!isOnline) {
            throw new NotezyAPIError(FetchClientExceptions.NetworkRequired());
          }

          const userAgent = navigator.userAgent;
          const response = await getUserDataQuerier.fetch({
            header: getClientRequestHeaders(userAgent),
            body: {},
          });

          setUserData(response.data);
        } catch (error) {
          console.error(error);
          if (
            !(error instanceof NotezyAPIError) ||
            error.unWrap.reason !==
              FetchClientExceptions.NetworkRequired().reason
          ) {
            setEnableInitialFetching(false);
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
    [getUserDataQuerier, isOnline, loadingManager, router]
  );

  useEffect(() => {
    fetchUserDataRef.current = fetchUserData;
  }, [fetchUserData]);

  // For maintaining the basic user data in the context
  useEffect(() => {
    if (router.getCurrentPath().includes("/redirect/")) return;
    if (!enableInitialFetching || userData !== null) return;
    if (isAutoFetchingUserDataRef.current) return;

    isAutoFetchingUserDataRef.current = true;
    void fetchUserDataRef.current().finally(() => {
      isAutoFetchingUserDataRef.current = false;
    });
  }, [enableInitialFetching, isLocalDBReady, userData, isOnline, router]);

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
            throw new NotezyAPIError(FetchClientExceptions.NetworkRequired());

          const userAgent = navigator.userAgent;
          const response = await getMeQuerier.fetch({
            header: getClientRequestHeaders(userAgent),
          });

          setUser(response.data);
        } catch (error) {
          console.error(error);
          if (
            !(error instanceof NotezyAPIError) ||
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
            throw new NotezyAPIError(FetchClientExceptions.NetworkRequired());

          const userAgent = navigator.userAgent;
          const response = await getMyInfoQuerier.fetch({
            header: getClientRequestHeaders(userAgent),
          });

          setUserInfo(response.data);
        } catch (error) {
          console.error(error);
          if (
            !(error instanceof NotezyAPIError) ||
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
            throw new NotezyAPIError(FetchClientExceptions.NetworkRequired());

          const userAgent = navigator.userAgent;
          const response = await getMyAccountQuerier.fetch({
            header: getClientRequestHeaders(userAgent),
          });

          setUserAccount(response.data);
        } catch (error) {
          console.error(error);
          if (
            !(error instanceof NotezyAPIError) ||
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
      setEnableInitialFetching(false);
      setUserData(null);
      setUser(null);
      setUserInfo(null);
      setUserAccount(null);

      const userAgent = navigator.userAgent;
      if (isOnline) {
        await logoutMutator.mutateAsync({
          header: getClientRequestHeaders(userAgent),
        });
      }
    })();

    logoutInFlightRef.current = task;
    try {
      await task;
    } finally {
      logoutInFlightRef.current = null;
    }
  }, [logoutMutator]);

  const contextValue: UserContextType = {
    enableInitialFetching: enableInitialFetching,
    setEnableInitialFetching: setEnableInitialFetching,

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
