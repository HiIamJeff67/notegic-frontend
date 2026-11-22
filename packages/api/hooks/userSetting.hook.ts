import type { UpdateMySettingRequest } from "@shared/api/interfaces/userSetting.interface";
import { mutationFnUpdateMySetting } from "@shared/api/invokers/userSetting.invoker";
import { getQueryClient } from "@shared/api/queryClient";
import { queryKeys } from "@shared/api/queryKeys";
import { useMutation } from "@tanstack/react-query";

export const useUpdateMySetting = (
  func: Parameters<typeof mutationFnUpdateMySetting>[1]
) => {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: (request: UpdateMySettingRequest) =>
      mutationFnUpdateMySetting(request, func),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.userSetting.all(),
      });
    },
  });
};
