import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import { NotegicAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import {
  CreateRoutineTaskByRoutineId,
  GetAllMyRoutineTasks,
  GetAllMyRoutineTasksByRoutineIds,
  GetMyRoutineTaskById,
  HardDeleteMyRoutineTaskById,
  HardDeleteMyRoutineTasksByIds,
  UpdateMyRoutineTaskById,
  VisualizeMyRoutineTaskPurposeCount,
} from "@/api/functions/routineTask.serverFn";
import {
  CreateRoutineTaskByRoutineIdRequest,
  CreateRoutineTaskByRoutineIdRequestSchema,
  CreateRoutineTaskByRoutineIdResponse,
  CreateRoutineTaskByRoutineIdResponseSchema,
  GetAllMyRoutineTasksByRoutineIdsRequest,
  GetAllMyRoutineTasksByRoutineIdsRequestSchema,
  GetAllMyRoutineTasksByRoutineIdsResponse,
  GetAllMyRoutineTasksByRoutineIdsResponseSchema,
  GetAllMyRoutineTasksRequest,
  GetAllMyRoutineTasksRequestSchema,
  GetAllMyRoutineTasksResponse,
  GetAllMyRoutineTasksResponseSchema,
  GetMyRoutineTaskByIdRequest,
  GetMyRoutineTaskByIdRequestSchema,
  GetMyRoutineTaskByIdResponse,
  GetMyRoutineTaskByIdResponseSchema,
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
import { ZodError } from "zod";
import { invokeVisualizeQuery } from "./visualize.invoker";

export const queryFnVisualizeMyRoutineTaskPurposeCount = (
  request: VisualizeMyRoutineTaskPurposeCountRequest
): Promise<VisualizeMyRoutineTaskPurposeCountResponse> =>
  invokeVisualizeQuery(
    request,
    VisualizeMyRoutineTaskPurposeCountRequestSchema,
    VisualizeMyRoutineTaskPurposeCountResponseSchema,
    VisualizeMyRoutineTaskPurposeCount,
    "queryFnVisualizeMyRoutineTaskPurposeCount"
  );

export const queryFnGetMyRoutineTaskById = async (
  request: GetMyRoutineTaskByIdRequest
): Promise<GetMyRoutineTaskByIdResponse> => {
  try {
    const validatedRequest = GetMyRoutineTaskByIdRequestSchema.parse(request);
    const response = await GetMyRoutineTaskById({
      data: validatedRequest,
    });
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

export const queryFnGetAllMyRoutineTasksByRoutineIds = async (
  request: GetAllMyRoutineTasksByRoutineIdsRequest
): Promise<GetAllMyRoutineTasksByRoutineIdsResponse> => {
  try {
    const validatedRequest =
      GetAllMyRoutineTasksByRoutineIdsRequestSchema.parse(request);
    const response = await GetAllMyRoutineTasksByRoutineIds({
      data: validatedRequest,
    });
    return GetAllMyRoutineTasksByRoutineIdsResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in queryFnGetAllMyRoutineTasksByRoutineIds",
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
  request: GetAllMyRoutineTasksRequest
): Promise<GetAllMyRoutineTasksResponse> => {
  try {
    const validatedRequest = GetAllMyRoutineTasksRequestSchema.parse(request);
    const response = await GetAllMyRoutineTasks({
      data: validatedRequest,
    });
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
  request: CreateRoutineTaskByRoutineIdRequest
): Promise<CreateRoutineTaskByRoutineIdResponse> => {
  try {
    const validatedRequest =
      CreateRoutineTaskByRoutineIdRequestSchema.parse(request);
    const response = await CreateRoutineTaskByRoutineId({
      data: validatedRequest,
    });
    return CreateRoutineTaskByRoutineIdResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in mutationFnCreateRoutineTaskByRoutineId",
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

export const mutationFnUpdateMyRoutineTaskById = async (
  request: UpdateMyRoutineTaskByIdRequest
): Promise<UpdateMyRoutineTaskByIdResponse> => {
  try {
    const validatedRequest =
      UpdateMyRoutineTaskByIdRequestSchema.parse(request);
    const response = await UpdateMyRoutineTaskById({
      data: validatedRequest,
    });
    return UpdateMyRoutineTaskByIdResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in mutationFnUpdateMyRoutineTaskById",
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

export const mutationFnHardDeleteMyRoutineTaskById = async (
  request: HardDeleteMyRoutineTaskByIdRequest
): Promise<HardDeleteMyRoutineTaskByIdResponse> => {
  try {
    const validatedRequest =
      HardDeleteMyRoutineTaskByIdRequestSchema.parse(request);
    const response = await HardDeleteMyRoutineTaskById({
      data: validatedRequest,
    });
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
  request: HardDeleteMyRoutineTasksByIdsRequest
): Promise<HardDeleteMyRoutineTasksByIdsResponse> => {
  try {
    const validatedRequest =
      HardDeleteMyRoutineTasksByIdsRequestSchema.parse(request);
    const response = await HardDeleteMyRoutineTasksByIds({
      data: validatedRequest,
    });
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
