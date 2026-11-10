import { CountryCode } from "@shared/api/interfaces/enums";
import type { GetMyAccountResponse } from "@shared/api/interfaces/userAccount.interface";
import { createQueryClient } from "@shared/api/queryClient";
import { queryKeys } from "@shared/api/queryKeys";
import {
  onlineManager,
  QueryClientProvider,
  QueryObserver,
} from "@tanstack/react-query";
import { renderToString } from "react-dom/server";
import {
  GetMyAccount,
  UpdateMyAccount,
} from "@/api/functions/userAccount.serverFn";
import { useGetMyAccount, useUpdateMyAccount } from "./userAccount.hook";

jest.mock("@/api/functions/userAccount.serverFn", () => ({
  GetMyAccount: jest.fn(),
  UpdateMyAccount: jest.fn(),
}));

test("refetches the account after a binding update and after reconnecting", async () => {
  const queryClient = createQueryClient();
  const queryKey = queryKeys.userAccount.my();
  const response: GetMyAccountResponse = {
    success: true,
    data: {
      registeredAuthProviderType: "Google",
      countryCode: null,
      phoneNumber: null,
      googleBound: true,
      githubBound: false,
      xBound: true,
      discordBound: false,
      updatedAt: new Date("2026-11-09T00:00:00Z"),
    },
    embedded: { publicId: "user-1" },
    exception: null,
  };
  const unboundResponse = {
    ...response,
    data: { ...response.data, xBound: false },
  };
  const getMyAccount = jest.mocked(GetMyAccount);
  getMyAccount
    .mockResolvedValueOnce(response)
    .mockResolvedValueOnce(unboundResponse);

  function AccountQuery() {
    useGetMyAccount();
    return null;
  }

  try {
    renderToString(
      <QueryClientProvider client={queryClient}>
        <AccountQuery />
      </QueryClientProvider>
    );

    await queryClient.getQueryCache().find({ queryKey, exact: true })?.fetch();
    expect(queryClient.getQueryData(queryKey)).toEqual(response);

    queryClient.setQueryData(queryKey, unboundResponse);
    expect(queryClient.getQueryData(queryKey)).toEqual(unboundResponse);

    await queryClient.invalidateQueries({ queryKey, refetchType: "all" });
    expect(getMyAccount.mock.calls).toEqual([[], []]);
    expect(queryClient.getQueryState(queryKey)?.status).toBe("success");
    expect(queryClient.getQueryData(queryKey)).toEqual(unboundResponse);

    const query = queryClient
      .getQueryCache()
      .find<GetMyAccountResponse>({ queryKey, exact: true })!;
    const wasOnline = onlineManager.isOnline();
    onlineManager.setOnline(true);
    queryClient.mount();
    getMyAccount.mockResolvedValueOnce(response);
    const observer = new QueryObserver(queryClient, {
      ...query.options,
      queryKey,
      refetchOnMount: false,
    });
    let unsubscribe = () => {};
    try {
      const refreshed = new Promise<void>(resolve => {
        unsubscribe = observer.subscribe(result => {
          if (result.data?.data.xBound === true) resolve();
        });
      });
      onlineManager.setOnline(false);
      expect(observer.getCurrentResult().data).toEqual(unboundResponse);
      expect(getMyAccount).toHaveBeenCalledTimes(2);
      onlineManager.setOnline(true);
      await refreshed;
      expect(getMyAccount).toHaveBeenCalledTimes(3);
      expect(observer.getCurrentResult().data).toEqual(response);
    } finally {
      unsubscribe();
      queryClient.unmount();
      onlineManager.setOnline(wasOnline);
    }
  } finally {
    queryClient.clear();
  }
});

test("updates cached contact bindings from the successful write", async () => {
  const queryClient = createQueryClient();
  const queryKey = queryKeys.userAccount.my();
  const updatedAt = new Date("2026-11-09T00:00:00Z");
  const response: GetMyAccountResponse = {
    success: true,
    data: {
      backupEmail: null,
      countryCode: null,
      phoneNumber: null,
      googleBound: true,
      githubBound: false,
      xBound: false,
      discordBound: false,
      updatedAt,
    },
    embedded: { publicId: "user-1" },
    exception: null,
  };
  queryClient.setQueryData(queryKey, response);
  jest.mocked(UpdateMyAccount).mockResolvedValueOnce({
    ...response,
    data: {
      backupEmail: "backup@example.test",
      countryCode: "+886",
      phoneNumber: "912345678",
      updatedAt,
    },
  });
  let updateAccount!: ReturnType<typeof useUpdateMyAccount>["mutateAsync"];

  function AccountMutation() {
    updateAccount = useUpdateMyAccount().mutateAsync;
    return null;
  }

  try {
    renderToString(
      <QueryClientProvider client={queryClient}>
        <AccountMutation />
      </QueryClientProvider>
    );
    await updateAccount({
      header: { csrfToken: "test-token" },
      body: {
        authCode: "123456",
        values: {
          backupEmail: "backup@example.test",
          countryCode: CountryCode.Taiwan,
          phoneNumber: "912345678",
        },
      },
    });
    expect(queryClient.getQueryData(queryKey)).toEqual({
      ...response,
      data: {
        ...response.data,
        backupEmail: "backup@example.test",
        countryCode: "+886",
        phoneNumber: "912345678",
      },
    });
  } finally {
    queryClient.clear();
  }
});
