import { forwardUpstreamSetCookies } from "@shared/api/cookies/bridge";
import { NotegicAPIError, NotegicException } from "@shared/api/exceptions";
import type {
  VisualizeMyRoutineTaskActualEndedAtCountRequest,
  VisualizeMyRoutineTaskActualEndedAtCountResponse,
  VisualizeMyRoutineTaskActualStartedAtCountRequest,
  VisualizeMyRoutineTaskActualStartedAtCountResponse,
  VisualizeMyRoutineTaskPurposeCountRequest,
  VisualizeMyRoutineTaskPurposeCountResponse,
  VisualizeMyRoutineTaskScheduledAtCountRequest,
  VisualizeMyRoutineTaskScheduledAtCountResponse,
  VisualizeMyRoutineTaskStatusCountRequest,
  VisualizeMyRoutineTaskStatusCountResponse,
} from "@shared/api/interfaces/routineTask.interface";
import {
  CreateRoutineTaskByRoutineIdRequest,
  CreateRoutineTaskByRoutineIdResponse,
  GetAllMyRoutineTasksByRoutineIdsRequest,
  GetAllMyRoutineTasksByRoutineIdsResponse,
  GetAllMyRoutineTasksRequest,
  GetAllMyRoutineTasksResponse,
  GetMyRoutineTaskByIdRequest,
  GetMyRoutineTaskByIdResponse,
  HardDeleteMyRoutineTaskByIdRequest,
  HardDeleteMyRoutineTaskByIdResponse,
  HardDeleteMyRoutineTasksByIdsRequest,
  HardDeleteMyRoutineTasksByIdsResponse,
  PauseMyRoutineTaskByIdRequest,
  PauseMyRoutineTaskByIdResponse,
  ResumeMyRoutineTaskByIdRequest,
  ResumeMyRoutineTaskByIdResponse,
  UpdateMyRoutineTaskByIdRequest,
  UpdateMyRoutineTaskByIdResponse,
} from "@shared/api/interfaces/routineTask.interface";
import {
  APIURLPathDictionary,
  CurrentAPIBaseURL,
  withoutPathParams,
} from "@shared/api/url";
import { isJsonResponse } from "@shared/util/isJsonContext";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { fetchVisualizeResponse } from "./visualize.serverFn";

export const VisualizeMyRoutineTaskStatusCount = createServerFn({
  method: "GET",
})
  .inputValidator((data: VisualizeMyRoutineTaskStatusCountRequest) => data)
  .handler(
    async ({
      data: request,
    }): Promise<VisualizeMyRoutineTaskStatusCountResponse> =>
      fetchVisualizeResponse(
        request,
        APIURLPathDictionary.routineTask.visualizeMyRoutineTaskStatusCount
      )
  );

export const VisualizeMyRoutineTaskPurposeCount = createServerFn({
  method: "GET",
})
  .inputValidator((data: VisualizeMyRoutineTaskPurposeCountRequest) => data)
  .handler(
    async ({
      data: request,
    }): Promise<VisualizeMyRoutineTaskPurposeCountResponse> =>
      fetchVisualizeResponse(
        request,
        APIURLPathDictionary.routineTask.visualizeMyRoutineTaskPurposeCount
      )
  );

export const VisualizeMyRoutineTaskScheduledAtCount = createServerFn({
  method: "GET",
})
  .inputValidator((data: VisualizeMyRoutineTaskScheduledAtCountRequest) => data)
  .handler(
    async ({
      data: request,
    }): Promise<VisualizeMyRoutineTaskScheduledAtCountResponse> =>
      fetchVisualizeResponse(
        request,
        APIURLPathDictionary.routineTask.visualizeMyRoutineTaskScheduledAtCount
      )
  );

export const VisualizeMyRoutineTaskActualStartedAtCount = createServerFn({
  method: "GET",
})
  .inputValidator(
    (data: VisualizeMyRoutineTaskActualStartedAtCountRequest) => data
  )
  .handler(
    async ({
      data: request,
    }): Promise<VisualizeMyRoutineTaskActualStartedAtCountResponse> =>
      fetchVisualizeResponse(
        request,
        APIURLPathDictionary.routineTask
          .visualizeMyRoutineTaskActualStartedAtCount
      )
  );

export const VisualizeMyRoutineTaskActualEndedAtCount = createServerFn({
  method: "GET",
})
  .inputValidator(
    (data: VisualizeMyRoutineTaskActualEndedAtCountRequest) => data
  )
  .handler(
    async ({
      data: request,
    }): Promise<VisualizeMyRoutineTaskActualEndedAtCountResponse> =>
      fetchVisualizeResponse(
        request,
        APIURLPathDictionary.routineTask
          .visualizeMyRoutineTaskActualEndedAtCount
      )
  );

export const GetMyRoutineTaskById = createServerFn({ method: "GET" })
  .inputValidator((data: GetMyRoutineTaskByIdRequest) => data)
  .handler(async ({ data: request }): Promise<GetMyRoutineTaskByIdResponse> => {
    const params = new URLSearchParams(
      Object.entries(request.param || {}).reduce<Record<string, string>>(
        (acc, [key, value]) => {
          if (key !== "routineTaskId" && value !== undefined && value !== null)
            acc[key] = String(value);
          return acc;
        },
        {}
      )
    );
    if (request.param?.isDeleted === undefined) {
      params.set("isDeleted", "false");
    }
    const query = params.toString();
    const url =
      import.meta.env.VITE_API_DOMAIN_URL +
      "/" +
      CurrentAPIBaseURL +
      "/" +
      APIURLPathDictionary.routineTask.getMyRoutineTaskById(
        request.param.routineTaskId
      ) +
      "?" +
      query;
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": userAgent,
        ...(request.header?.csrfToken
          ? { "X-CSRF-Token": request.header.csrfToken }
          : {}),
        ...(inboundCookie ? { Cookie: inboundCookie } : {}),
      },
      credentials: "include",
    });

    if (!isJsonResponse(response)) {
      throw new Error("error.encounterUnknownError");
    }
    forwardUpstreamSetCookies(response);
    const formattedResponse =
      (await response.json()) as GetMyRoutineTaskByIdResponse;
    if (formattedResponse.exception != null) {
      throw new NotegicAPIError(
        new NotegicException(formattedResponse.exception)
      );
    }

    return formattedResponse;
  });

export const GetAllMyRoutineTasksByRoutineIds = createServerFn({
  method: "GET",
})
  .inputValidator((data: GetAllMyRoutineTasksByRoutineIdsRequest) => data)
  .handler(
    async ({
      data: request,
    }): Promise<GetAllMyRoutineTasksByRoutineIdsResponse> => {
      const params = new URLSearchParams();
      for (const routineId of request.param.routineIds) {
        params.append("routineIds", routineId);
      }
      params.set("areDeleted", String(request.param.areDeleted ?? false));
      const url =
        import.meta.env.VITE_API_DOMAIN_URL +
        "/" +
        CurrentAPIBaseURL +
        "/" +
        APIURLPathDictionary.routineTask.getAllMyRoutineTasksByRoutineIds +
        "?" +
        params.toString();
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": userAgent,
          ...(request.header?.csrfToken
            ? { "X-CSRF-Token": request.header.csrfToken }
            : {}),
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        credentials: "include",
      });

      if (!isJsonResponse(response)) {
        throw new Error("error.encounterUnknownError");
      }
      forwardUpstreamSetCookies(response);
      const formattedResponse =
        (await response.json()) as GetAllMyRoutineTasksByRoutineIdsResponse;
      if (formattedResponse.exception != null) {
        throw new NotegicAPIError(
          new NotegicException(formattedResponse.exception)
        );
      }

      return formattedResponse;
    }
  );

export const GetAllMyRoutineTasks = createServerFn({
  method: "GET",
})
  .inputValidator((data: GetAllMyRoutineTasksRequest) => data)
  .handler(async ({ data: request }): Promise<GetAllMyRoutineTasksResponse> => {
    const params = new URLSearchParams({
      areDeleted: String(request.param?.areDeleted ?? false),
    });
    const url =
      import.meta.env.VITE_API_DOMAIN_URL +
      "/" +
      CurrentAPIBaseURL +
      "/" +
      APIURLPathDictionary.routineTask.getAllMyRoutineTasks +
      "?" +
      params.toString();
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": userAgent,
        ...(request.header?.csrfToken
          ? { "X-CSRF-Token": request.header.csrfToken }
          : {}),
        ...(inboundCookie ? { Cookie: inboundCookie } : {}),
      },
      credentials: "include",
    });

    if (!isJsonResponse(response)) {
      throw new Error("error.encounterUnknownError");
    }
    forwardUpstreamSetCookies(response);
    const formattedResponse =
      (await response.json()) as GetAllMyRoutineTasksResponse;
    if (formattedResponse.exception != null) {
      throw new NotegicAPIError(
        new NotegicException(formattedResponse.exception)
      );
    }

    return formattedResponse;
  });

export const CreateRoutineTaskByRoutineId = createServerFn({ method: "POST" })
  .inputValidator((data: CreateRoutineTaskByRoutineIdRequest) => data)
  .handler(
    async ({
      data: request,
    }): Promise<CreateRoutineTaskByRoutineIdResponse> => {
      const url =
        import.meta.env.VITE_API_DOMAIN_URL +
        "/" +
        CurrentAPIBaseURL +
        "/" +
        APIURLPathDictionary.routineTask.createRoutineTaskByRoutineId(
          request.body.routineId
        );
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": userAgent,
          ...(request.header?.csrfToken
            ? { "X-CSRF-Token": request.header.csrfToken }
            : {}),
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(withoutPathParams(request.body, "routineId")),
        credentials: "include",
      });

      if (!isJsonResponse(response)) {
        throw new Error("error.encounterUnknownError");
      }
      forwardUpstreamSetCookies(response);
      const formattedResponse =
        (await response.json()) as CreateRoutineTaskByRoutineIdResponse;
      if (formattedResponse.exception != null) {
        throw new NotegicAPIError(
          new NotegicException(formattedResponse.exception)
        );
      }

      return formattedResponse;
    }
  );

export const UpdateMyRoutineTaskById = createServerFn({ method: "POST" })
  .inputValidator((data: UpdateMyRoutineTaskByIdRequest) => data)
  .handler(
    async ({ data: request }): Promise<UpdateMyRoutineTaskByIdResponse> => {
      const url =
        import.meta.env.VITE_API_DOMAIN_URL +
        "/" +
        CurrentAPIBaseURL +
        "/" +
        APIURLPathDictionary.routineTask.updateMyRoutineTaskById(
          request.body.routineTaskId
        );
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": userAgent,
          ...(request.header?.csrfToken
            ? { "X-CSRF-Token": request.header.csrfToken }
            : {}),
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(withoutPathParams(request.body, "routineTaskId")),
        credentials: "include",
      });

      if (!isJsonResponse(response)) {
        throw new Error("error.encounterUnknownError");
      }
      forwardUpstreamSetCookies(response);
      const formattedResponse =
        (await response.json()) as UpdateMyRoutineTaskByIdResponse;
      if (formattedResponse.exception != null) {
        throw new NotegicAPIError(
          new NotegicException(formattedResponse.exception)
        );
      }

      return formattedResponse;
    }
  );

export const PauseMyRoutineTaskById = createServerFn({ method: "POST" })
  .inputValidator((data: PauseMyRoutineTaskByIdRequest) => data)
  .handler(
    async ({ data: request }): Promise<PauseMyRoutineTaskByIdResponse> => {
      const url =
        import.meta.env.VITE_API_DOMAIN_URL +
        "/" +
        CurrentAPIBaseURL +
        "/" +
        APIURLPathDictionary.routineTask.pauseMyRoutineTaskById(
          request.body.routineTaskId
        );
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": userAgent,
          ...(request.header?.csrfToken
            ? { "X-CSRF-Token": request.header.csrfToken }
            : {}),
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(withoutPathParams(request.body, "routineTaskId")),
        credentials: "include",
      });

      if (!isJsonResponse(response)) {
        throw new Error("error.encounterUnknownError");
      }
      forwardUpstreamSetCookies(response);
      const formattedResponse =
        (await response.json()) as PauseMyRoutineTaskByIdResponse;
      if (formattedResponse.exception != null) {
        throw new NotegicAPIError(
          new NotegicException(formattedResponse.exception)
        );
      }

      return formattedResponse;
    }
  );

export const ResumeMyRoutineTaskById = createServerFn({ method: "POST" })
  .inputValidator((data: ResumeMyRoutineTaskByIdRequest) => data)
  .handler(
    async ({ data: request }): Promise<ResumeMyRoutineTaskByIdResponse> => {
      const url =
        import.meta.env.VITE_API_DOMAIN_URL +
        "/" +
        CurrentAPIBaseURL +
        "/" +
        APIURLPathDictionary.routineTask.resumeMyRoutineTaskById(
          request.body.routineTaskId
        );
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": userAgent,
          ...(request.header?.csrfToken
            ? { "X-CSRF-Token": request.header.csrfToken }
            : {}),
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(withoutPathParams(request.body, "routineTaskId")),
        credentials: "include",
      });

      if (!isJsonResponse(response)) {
        throw new Error("error.encounterUnknownError");
      }
      forwardUpstreamSetCookies(response);
      const formattedResponse =
        (await response.json()) as ResumeMyRoutineTaskByIdResponse;
      if (formattedResponse.exception != null) {
        throw new NotegicAPIError(
          new NotegicException(formattedResponse.exception)
        );
      }

      return formattedResponse;
    }
  );

export const HardDeleteMyRoutineTaskById = createServerFn({ method: "POST" })
  .inputValidator((data: HardDeleteMyRoutineTaskByIdRequest) => data)
  .handler(
    async ({ data: request }): Promise<HardDeleteMyRoutineTaskByIdResponse> => {
      const url =
        import.meta.env.VITE_API_DOMAIN_URL +
        "/" +
        CurrentAPIBaseURL +
        "/" +
        APIURLPathDictionary.routineTask.hardDeleteMyRoutineTaskById(
          request.body.routineTaskId
        );
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": userAgent,
          ...(request.header?.csrfToken
            ? { "X-CSRF-Token": request.header.csrfToken }
            : {}),
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(withoutPathParams(request.body, "routineTaskId")),
        credentials: "include",
      });

      if (!isJsonResponse(response)) {
        throw new Error("error.encounterUnknownError");
      }
      forwardUpstreamSetCookies(response);
      const formattedResponse =
        (await response.json()) as HardDeleteMyRoutineTaskByIdResponse;
      if (formattedResponse.exception != null) {
        throw new NotegicAPIError(
          new NotegicException(formattedResponse.exception)
        );
      }

      return formattedResponse;
    }
  );

export const HardDeleteMyRoutineTasksByIds = createServerFn({ method: "POST" })
  .inputValidator((data: HardDeleteMyRoutineTasksByIdsRequest) => data)
  .handler(
    async ({
      data: request,
    }): Promise<HardDeleteMyRoutineTasksByIdsResponse> => {
      const url =
        import.meta.env.VITE_API_DOMAIN_URL +
        "/" +
        CurrentAPIBaseURL +
        "/" +
        APIURLPathDictionary.routineTask.hardDeleteMyRoutineTasksByIds;
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": userAgent,
          ...(request.header?.csrfToken
            ? { "X-CSRF-Token": request.header.csrfToken }
            : {}),
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(request.body),
        credentials: "include",
      });

      if (!isJsonResponse(response)) {
        throw new Error("error.encounterUnknownError");
      }
      forwardUpstreamSetCookies(response);
      const formattedResponse =
        (await response.json()) as HardDeleteMyRoutineTasksByIdsResponse;
      if (formattedResponse.exception != null) {
        throw new NotegicAPIError(
          new NotegicException(formattedResponse.exception)
        );
      }

      return formattedResponse;
    }
  );
