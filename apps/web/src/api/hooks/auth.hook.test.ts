const mockUseMutation = jest.fn((options: { retry?: boolean }) => options);
jest.mock("@tanstack/react-query", () => ({ useMutation: mockUseMutation }));
jest.mock("@apollo/client/react", () => ({ useApolloClient: jest.fn() }));
jest.mock("@shared/api/queryClient", () => ({ getQueryClient: jest.fn() }));
jest.mock("@/api/clientHeaders", () => ({
  clearClientCSRFToken: jest.fn(),
  setClientCSRFToken: jest.fn(),
}));
jest.mock("@/api/invokers/auth.invoker", () => ({
  mutationFnLogin: jest.fn(),
  mutationFnLoginViaGoogle: jest.fn(),
}));
jest.mock("@/api/local/synchronizers/auth.synchronizer", () => ({
  AuthLocalSynchronizer: {},
}));

import { useLogin, useLoginViaGoogle } from "./auth.hook";

test.each([
  useLogin,
  useLoginViaGoogle,
])("login requires an explicit retry after any failure", useLoginMutation => {
  mockUseMutation.mockClear();
  useLoginMutation();
  expect(mockUseMutation).toHaveBeenCalledWith(
    expect.objectContaining({ retry: false })
  );
});
