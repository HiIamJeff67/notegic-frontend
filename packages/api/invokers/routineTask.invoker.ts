import { NotegicAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import {
  CreateRoutineTaskByRoutineIdRequest,
  CreateRoutineTaskByRoutineIdRequestSchema,
  CreateRoutineTaskByRoutineIdResponse,
  CreateRoutineTaskByRoutineIdResponseSchema,
  GetAllMyRoutineTasksRequest,
  GetAllMyRoutineTasksRequestSchema,
  GetAllMyRoutineTasksResponse,
  GetAllMyRoutineTasksResponseSchema,
  GetMyRoutineTaskByIdRequest,
  GetMyRoutineTaskByIdRequestSchema,
  GetMyRoutineTaskByIdResponse,
  GetMyRoutineTaskByIdResponseSchema,
  GetMyRoutineTasksByRoutineIdRequest,
  GetMyRoutineTasksByRoutineIdRequestSchema,
  GetMyRoutineTasksByRoutineIdResponse,
  GetMyRoutineTasksByRoutineIdResponseSchema,
  HardDeleteMyRoutineTaskByIdRequest,
  HardDeleteMyRoutineTaskByIdRequestSchema,
  HardDeleteMyRoutineTaskByIdResponse,
  HardDeleteMyRoutineTaskByIdResponseSchema,
  HardDeleteMyRoutineTasksByIdsRequest,
  HardDeleteMyRoutineTasksByIdsRequestSchema,
  HardDeleteMyRoutineTasksByIdsResponse,
  HardDeleteMyRoutineTasksByIdsResponseSchema,
  UpdateMyRoutineTaskByIdRequest,
  UpdateMyRoutineTaskByIdRequestSchema,
  UpdateMyRoutineTaskByIdResponse,
  UpdateMyRoutineTaskByIdResponseSchema,
  type VisualizeMyRoutineTaskPurposeCountRequest,
  VisualizeMyRoutineTaskPurposeCountRequestSchema,
  type VisualizeMyRoutineTaskPurposeCountResponse,
  VisualizeMyRoutineTaskPurposeCountResponseSchema,
} from "@shared/api/interfaces/routineTask.interface";
import { parse } from "@shared/api/validation";
import { ZodError } from "zod";
import { invokeVisualizeQuery } from "./visualize.invoker";

export const queryFnVisualizeMyRoutineTaskPurposeCount = (
  request: VisualizeMyRoutineTaskPurposeCountRequest,
  func: (
    request: VisualizeMyRoutineTaskPurposeCountRequest
  ) => Promise<VisualizeMyRoutineTaskPurposeCountResponse>
): Promise<VisualizeMyRoutineTaskPurposeCountResponse> =>
  invokeVisualizeQuery(
    request,
    VisualizeMyRoutineTaskPurposeCountRequestSchema,
    VisualizeMyRoutineTaskPurposeCountResponseSchema,
    func,
    "queryFnVisualizeMyRoutineTaskPurposeCount"
  );

export const queryFnGetMyRoutineTaskById = async (
  request: GetMyRoutineTaskByIdRequest,
  func: (
    request: GetMyRoutineTaskByIdRequest
  ) => Promise<GetMyRoutineTaskByIdResponse>
): Promise<GetMyRoutineTaskByIdResponse> => {
  try {
    const validatedRequest = GetMyRoutineTaskByIdRequestSchema.parse(request);
    const response = await func(validatedRequest);
    return GetMyRoutineTaskByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in queryFnGetMyRoutineTaskById", error);
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    } else if (error instanceof NotegicAPIError) {
      switch (error.unWrap.reason) {
        default:
          throw error;
      }
    } else if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    throw error;
  }
};

export const queryFnGetMyRoutineTasksByRoutineId = async (
  request: GetMyRoutineTasksByRoutineIdRequest,
  func: (
    request: GetMyRoutineTasksByRoutineIdRequest
  ) => Promise<GetMyRoutineTasksByRoutineIdResponse>
): Promise<GetMyRoutineTasksByRoutineIdResponse> => {
  try {
    const validatedRequest =
      GetMyRoutineTasksByRoutineIdRequestSchema.parse(request);
    const response = await func(validatedRequest);
    return GetMyRoutineTasksByRoutineIdResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in queryFnGetMyRoutineTasksByRoutineId",
      error
    );
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    } else if (error instanceof NotegicAPIError) {
      switch (error.unWrap.reason) {
        default:
          throw error;
      }
    } else if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    throw error;
  }
};

export const queryFnGetAllMyRoutineTasks = async (
  request: GetAllMyRoutineTasksRequest,
  func: (
    request: GetAllMyRoutineTasksRequest
  ) => Promise<GetAllMyRoutineTasksResponse>
): Promise<GetAllMyRoutineTasksResponse> => {
  try {
    const validatedRequest = GetAllMyRoutineTasksRequestSchema.parse(request);
    const response = await func(validatedRequest);
    return GetAllMyRoutineTasksResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in queryFnGetAllMyRoutineTasks", error);
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    } else if (error instanceof NotegicAPIError) {
      switch (error.unWrap.reason) {
        default:
          throw error;
      }
    } else if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    throw error;
  }
};

export const mutationFnCreateRoutineTaskByRoutineId = async (
  request: CreateRoutineTaskByRoutineIdRequest,
  func: (
    request: CreateRoutineTaskByRoutineIdRequest
  ) => Promise<CreateRoutineTaskByRoutineIdResponse>
): Promise<CreateRoutineTaskByRoutineIdResponse> => {
  const validatedRequest = parse(
    CreateRoutineTaskByRoutineIdRequestSchema,
    request
  );
  try {
    const response = await func(validatedRequest);
    return CreateRoutineTaskByRoutineIdResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in mutationFnCreateRoutineTaskByRoutineId",
      error
    );
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      ).setPresentation("validation.invalidResponse");
    } else if (error instanceof NotegicAPIError) {
      switch (error.unWrap.reason) {
        default:
          throw error;
      }
    } else if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    throw error;
  }
};

export const mutationFnUpdateMyRoutineTaskById = async (
  request: UpdateMyRoutineTaskByIdRequest,
  func: (
    request: UpdateMyRoutineTaskByIdRequest
  ) => Promise<UpdateMyRoutineTaskByIdResponse>
): Promise<UpdateMyRoutineTaskByIdResponse> => {
  const validatedRequest = parse(UpdateMyRoutineTaskByIdRequestSchema, request);
  try {
    const response = await func(validatedRequest);
    return UpdateMyRoutineTaskByIdResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in mutationFnUpdateMyRoutineTaskById",
      error
    );
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      ).setPresentation("validation.invalidResponse");
    } else if (error instanceof NotegicAPIError) {
      switch (error.unWrap.reason) {
        default:
          throw error;
      }
    } else if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    throw error;
  }
};

export const mutationFnHardDeleteMyRoutineTaskById = async (
  request: HardDeleteMyRoutineTaskByIdRequest,
  func: (
    request: HardDeleteMyRoutineTaskByIdRequest
  ) => Promise<HardDeleteMyRoutineTaskByIdResponse>
): Promise<HardDeleteMyRoutineTaskByIdResponse> => {
  try {
    const validatedRequest =
      HardDeleteMyRoutineTaskByIdRequestSchema.parse(request);
    const response = await func(validatedRequest);
    return HardDeleteMyRoutineTaskByIdResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in mutationFnHardDeleteMyRoutineTaskById",
      error
    );
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    } else if (error instanceof NotegicAPIError) {
      switch (error.unWrap.reason) {
        default:
          throw error;
      }
    } else if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    throw error;
  }
};

export const mutationFnHardDeleteMyRoutineTasksByIds = async (
  request: HardDeleteMyRoutineTasksByIdsRequest,
  func: (
    request: HardDeleteMyRoutineTasksByIdsRequest
  ) => Promise<HardDeleteMyRoutineTasksByIdsResponse>
): Promise<HardDeleteMyRoutineTasksByIdsResponse> => {
  try {
    const validatedRequest =
      HardDeleteMyRoutineTasksByIdsRequestSchema.parse(request);
    const response = await func(validatedRequest);
    return HardDeleteMyRoutineTasksByIdsResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in mutationFnHardDeleteMyRoutineTasksByIds",
      error
    );
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    } else if (error instanceof NotegicAPIError) {
      switch (error.unWrap.reason) {
        default:
          throw error;
      }
    } else if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    throw error;
  }
};
