import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import { NotegicAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import {
  CreateRoutineTaskDependencyByRoutineId,
  DeleteRoutineTaskDependencyByRoutineId,
  GetRoutineTaskDependenciesByRoutineId,
  UpdateRoutineTaskDependencyByRoutineId,
} from "@/api/functions/routineTaskDependency.serverFn";
import {
  CreateRoutineTaskDependencyByRoutineIdRequest,
  CreateRoutineTaskDependencyByRoutineIdRequestSchema,
  CreateRoutineTaskDependencyByRoutineIdResponse,
  CreateRoutineTaskDependencyByRoutineIdResponseSchema,
  DeleteRoutineTaskDependencyByRoutineIdRequest,
  DeleteRoutineTaskDependencyByRoutineIdRequestSchema,
  DeleteRoutineTaskDependencyByRoutineIdResponse,
  DeleteRoutineTaskDependencyByRoutineIdResponseSchema,
  GetRoutineTaskDependenciesByRoutineIdRequest,
  GetRoutineTaskDependenciesByRoutineIdRequestSchema,
  GetRoutineTaskDependenciesByRoutineIdResponse,
  GetRoutineTaskDependenciesByRoutineIdResponseSchema,
  UpdateRoutineTaskDependencyByRoutineIdRequest,
  UpdateRoutineTaskDependencyByRoutineIdRequestSchema,
  UpdateRoutineTaskDependencyByRoutineIdResponse,
  UpdateRoutineTaskDependencyByRoutineIdResponseSchema,
} from "@shared/api/interfaces/routineTaskDependency.interface";
import { ZodError } from "zod";

export const queryFnGetRoutineTaskDependenciesByRoutineId = async (
  request: GetRoutineTaskDependenciesByRoutineIdRequest
): Promise<GetRoutineTaskDependenciesByRoutineIdResponse> => {
  try {
    const validatedRequest =
      GetRoutineTaskDependenciesByRoutineIdRequestSchema.parse(request);
    const response = await GetRoutineTaskDependenciesByRoutineId({
      data: validatedRequest,
    });
    return GetRoutineTaskDependenciesByRoutineIdResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in queryFnGetRoutineTaskDependenciesByRoutineId",
      error
    );
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    } else if (error instanceof NotegicAPIError) {
      throw error;
    } else if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    throw error;
  }
};

export const mutationFnCreateRoutineTaskDependencyByRoutineId = async (
  request: CreateRoutineTaskDependencyByRoutineIdRequest
): Promise<CreateRoutineTaskDependencyByRoutineIdResponse> => {
  try {
    const validatedRequest =
      CreateRoutineTaskDependencyByRoutineIdRequestSchema.parse(request);
    const response = await CreateRoutineTaskDependencyByRoutineId({
      data: validatedRequest,
    });
    return CreateRoutineTaskDependencyByRoutineIdResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in mutationFnCreateRoutineTaskDependencyByRoutineId",
      error
    );
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    } else if (error instanceof NotegicAPIError) {
      throw error;
    } else if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    throw error;
  }
};

export const mutationFnUpdateRoutineTaskDependencyByRoutineId = async (
  request: UpdateRoutineTaskDependencyByRoutineIdRequest
): Promise<UpdateRoutineTaskDependencyByRoutineIdResponse> => {
  try {
    const validatedRequest =
      UpdateRoutineTaskDependencyByRoutineIdRequestSchema.parse(request);
    const response = await UpdateRoutineTaskDependencyByRoutineId({
      data: validatedRequest,
    });
    return UpdateRoutineTaskDependencyByRoutineIdResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in mutationFnUpdateRoutineTaskDependencyByRoutineId",
      error
    );
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    } else if (error instanceof NotegicAPIError) {
      throw error;
    } else if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    throw error;
  }
};

export const mutationFnDeleteRoutineTaskDependencyByRoutineId = async (
  request: DeleteRoutineTaskDependencyByRoutineIdRequest
): Promise<DeleteRoutineTaskDependencyByRoutineIdResponse> => {
  try {
    const validatedRequest =
      DeleteRoutineTaskDependencyByRoutineIdRequestSchema.parse(request);
    const response = await DeleteRoutineTaskDependencyByRoutineId({
      data: validatedRequest,
    });
    return DeleteRoutineTaskDependencyByRoutineIdResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in mutationFnDeleteRoutineTaskDependencyByRoutineId",
      error
    );
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    } else if (error instanceof NotegicAPIError) {
      throw error;
    } else if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    throw error;
  }
};
