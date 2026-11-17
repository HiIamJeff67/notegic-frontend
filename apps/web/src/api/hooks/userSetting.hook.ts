import type {
  UpdateMySettingRequest,
  UpdateMySettingResponse,
} from "@shared/api/interfaces/userSetting.interface";
import { mutationFnUpdateMySetting } from "@shared/api/invokers/userSetting.invoker";
import { getQueryClient } from "@shared/api/queryClient";
import { queryKeys } from "@shared/api/queryKeys";
import { useMutation } from "@tanstack/react-query";
import { UpdateMySetting } from "@/api/functions/userSetting.serverFn";

export const useUpdateMySetting = () => {
  const queryClient = getQueryClient();
  return useMutation<UpdateMySettingResponse, Error, UpdateMySettingRequest>({
    mutationFn: (request: Parameters<typeof mutationFnUpdateMySetting>[0]) =>
      mutationFnUpdateMySetting(request, UpdateMySetting),
    retry: false,
    onSuccess: (response, request) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.userSetting.all(),
      });
    },
  });
};
