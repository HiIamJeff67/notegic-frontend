import type {
  UpdateMySettingRequest,
  UpdateMySettingResponse,
} from "@shared/api/interfaces/userSetting.interface";
import { getQueryClient } from "@shared/api/queryClient";
import { queryKeys } from "@shared/api/queryKeys";
import { SessionStorageManipulator } from "@shared/lib/sessionStorageManipulator";
import { SessionStorageKey } from "@shared/types/sessionStorage.type";
import { useMutation } from "@tanstack/react-query";
import { mutationFnUpdateMySetting } from "@/api/invokers/userSetting.invoker";

export const useUpdateMySetting = () => {
  const queryClient = getQueryClient();
  return useMutation<UpdateMySettingResponse, Error, UpdateMySettingRequest>({
    mutationFn: mutationFnUpdateMySetting,
    retry: false,
    onSuccess: (response, request) => {
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken
      );
      void queryClient.invalidateQueries({
        queryKey: queryKeys.userSetting.all(),
      });
    },
  });
};
