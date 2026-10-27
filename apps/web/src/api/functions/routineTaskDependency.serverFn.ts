import type {
  CreateRoutineTaskDependencyByRoutineIdRequest,
  CreateRoutineTaskDependencyByRoutineIdResponse,
  DeleteRoutineTaskDependencyByRoutineIdRequest,
  DeleteRoutineTaskDependencyByRoutineIdResponse,
  GetRoutineTaskDependenciesByRoutineIdRequest,
  GetRoutineTaskDependenciesByRoutineIdResponse,
  UpdateRoutineTaskDependencyByRoutineIdRequest,
  UpdateRoutineTaskDependencyByRoutineIdResponse,
  UpdateRoutineTaskGraphByRoutineIdRequest,
  UpdateRoutineTaskGraphByRoutineIdResponse,
} from "@shared/api/interfaces/routineTaskDependency.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/api/url";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { readAPIResponse } from "@/api/adapters/apiResponse.adapter";
import { forwardUpstreamSetCookies } from "@/api/bridges/cookie.bridge";

export const UpdateRoutineTaskGraphByRoutineId = createServerFn({
  method: "POST",
})
  .inputValidator((data: UpdateRoutineTaskGraphByRoutineIdRequest) => data)
  .handler(
    async ({
      data: request,
    }): Promise<UpdateRoutineTaskGraphByRoutineIdResponse> => {
      const url =
        import.meta.env.VITE_API_DOMAIN_URL +
        "/" +
        CurrentAPIBaseURL +
        "/" +
        APIURLPathDictionary.routineTaskDependency.updateGraphByRoutineId(
          request.param.routineId
        );
      const inboundCookie = getRequestHeader("cookie");
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "User-Agent":
            request.header?.userAgent ??
            getRequestHeader("User-Agent") ??
            "unknown",
          "X-CSRF-Token":
            getRequestHeader("X-CSRF-Token") ?? request.header?.csrfToken ?? "",
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(request.body),
        credentials: "include",
      });
      forwardUpstreamSetCookies(response);
      return (await readAPIResponse(
        response
      )) as UpdateRoutineTaskGraphByRoutineIdResponse;
    }
  );

export const GetRoutineTaskDependenciesByRoutineId = createServerFn({
  method: "GET",
})
  .inputValidator((data: GetRoutineTaskDependenciesByRoutineIdRequest) => data)
  .handler(
    async ({
      data: request,
    }): Promise<GetRoutineTaskDependenciesByRoutineIdResponse> => {
      const url =
        import.meta.env.VITE_API_DOMAIN_URL +
        "/" +
        CurrentAPIBaseURL +
        "/" +
        APIURLPathDictionary.routineTaskDependency.getByRoutineId(
          request.param.routineId
        );
      const inboundCookie = getRequestHeader("cookie");
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "User-Agent":
            request.header?.userAgent ??
            getRequestHeader("User-Agent") ??
            "unknown",
          "X-CSRF-Token":
            getRequestHeader("X-CSRF-Token") ?? request.header?.csrfToken ?? "",
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        credentials: "include",
      });

      forwardUpstreamSetCookies(response);
      const formattedResponse = (await readAPIResponse(
        response
      )) as GetRoutineTaskDependenciesByRoutineIdResponse;

      return formattedResponse;
    }
  );

export const CreateRoutineTaskDependencyByRoutineId = createServerFn({
  method: "POST",
})
  .inputValidator((data: CreateRoutineTaskDependencyByRoutineIdRequest) => data)
  .handler(
    async ({
      data: request,
    }): Promise<CreateRoutineTaskDependencyByRoutineIdResponse> => {
      const url =
        import.meta.env.VITE_API_DOMAIN_URL +
        "/" +
        CurrentAPIBaseURL +
        "/" +
        APIURLPathDictionary.routineTaskDependency.createByRoutineId(
          request.param.routineId
        );
      const inboundCookie = getRequestHeader("cookie");
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent":
            request.header?.userAgent ??
            getRequestHeader("User-Agent") ??
            "unknown",
          "X-CSRF-Token":
            getRequestHeader("X-CSRF-Token") ?? request.header?.csrfToken ?? "",
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(request.body),
        credentials: "include",
      });

      forwardUpstreamSetCookies(response);
      const formattedResponse = (await readAPIResponse(
        response
      )) as CreateRoutineTaskDependencyByRoutineIdResponse;

      return formattedResponse;
    }
  );

export const UpdateRoutineTaskDependencyByRoutineId = createServerFn({
  method: "POST",
})
  .inputValidator((data: UpdateRoutineTaskDependencyByRoutineIdRequest) => data)
  .handler(
    async ({
      data: request,
    }): Promise<UpdateRoutineTaskDependencyByRoutineIdResponse> => {
      const url =
        import.meta.env.VITE_API_DOMAIN_URL +
        "/" +
        CurrentAPIBaseURL +
        "/" +
        APIURLPathDictionary.routineTaskDependency.updateByRoutineId(
          request.param.routineId
        );
      const inboundCookie = getRequestHeader("cookie");
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "User-Agent":
            request.header?.userAgent ??
            getRequestHeader("User-Agent") ??
            "unknown",
          "X-CSRF-Token":
            getRequestHeader("X-CSRF-Token") ?? request.header?.csrfToken ?? "",
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(request.body),
        credentials: "include",
      });

      forwardUpstreamSetCookies(response);
      const formattedResponse = (await readAPIResponse(
        response
      )) as UpdateRoutineTaskDependencyByRoutineIdResponse;

      return formattedResponse;
    }
  );

export const DeleteRoutineTaskDependencyByRoutineId = createServerFn({
  method: "POST",
})
  .inputValidator((data: DeleteRoutineTaskDependencyByRoutineIdRequest) => data)
  .handler(
    async ({
      data: request,
    }): Promise<DeleteRoutineTaskDependencyByRoutineIdResponse> => {
      const url =
        import.meta.env.VITE_API_DOMAIN_URL +
        "/" +
        CurrentAPIBaseURL +
        "/" +
        APIURLPathDictionary.routineTaskDependency.deleteByRoutineId(
          request.param.routineId
        );
      const inboundCookie = getRequestHeader("cookie");
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "User-Agent":
            request.header?.userAgent ??
            getRequestHeader("User-Agent") ??
            "unknown",
          "X-CSRF-Token":
            getRequestHeader("X-CSRF-Token") ?? request.header?.csrfToken ?? "",
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(request.body),
        credentials: "include",
      });

      forwardUpstreamSetCookies(response);
      const formattedResponse = (await readAPIResponse(
        response
      )) as DeleteRoutineTaskDependencyByRoutineIdResponse;

      return formattedResponse;
    }
  );
