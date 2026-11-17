import { NotegicAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
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
  type UpdateRoutineTaskGraphByRoutineIdRequest,
  UpdateRoutineTaskGraphByRoutineIdRequestSchema,
  type UpdateRoutineTaskGraphByRoutineIdResponse,
  UpdateRoutineTaskGraphByRoutineIdResponseSchema,
} from "@shared/api/interfaces/routineTaskDependency.interface";
import { parse } from "@shared/api/validation";
import { ZodError } from "zod";

export const mutationFnUpdateRoutineTaskGraphByRoutineId = async (
  request: UpdateRoutineTaskGraphByRoutineIdRequest,
  func: (
    request: UpdateRoutineTaskGraphByRoutineIdRequest
  ) => Promise<UpdateRoutineTaskGraphByRoutineIdResponse>
): Promise<UpdateRoutineTaskGraphByRoutineIdResponse> => {
  const validatedRequest = parse(
    UpdateRoutineTaskGraphByRoutineIdRequestSchema,
    request
  );
  try {
    const response = await func(validatedRequest);
    return UpdateRoutineTaskGraphByRoutineIdResponseSchema.parse(response);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      ).setPresentation("validation.invalidResponse");
    }
    if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    throw error;
  }
};

export const queryFnGetRoutineTaskDependenciesByRoutineId = async (
  request: GetRoutineTaskDependenciesByRoutineIdRequest,
  func: (
    request: GetRoutineTaskDependenciesByRoutineIdRequest
  ) => Promise<GetRoutineTaskDependenciesByRoutineIdResponse>
): Promise<GetRoutineTaskDependenciesByRoutineIdResponse> => {
  try {
    const validatedRequest =
      GetRoutineTaskDependenciesByRoutineIdRequestSchema.parse(request);
    const response = await func(validatedRequest);
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
  request: CreateRoutineTaskDependencyByRoutineIdRequest,
  func: (
    request: CreateRoutineTaskDependencyByRoutineIdRequest
  ) => Promise<CreateRoutineTaskDependencyByRoutineIdResponse>
): Promise<CreateRoutineTaskDependencyByRoutineIdResponse> => {
  try {
    const validatedRequest =
      CreateRoutineTaskDependencyByRoutineIdRequestSchema.parse(request);
    const response = await func(validatedRequest);
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
  request: UpdateRoutineTaskDependencyByRoutineIdRequest,
  func: (
    request: UpdateRoutineTaskDependencyByRoutineIdRequest
  ) => Promise<UpdateRoutineTaskDependencyByRoutineIdResponse>
): Promise<UpdateRoutineTaskDependencyByRoutineIdResponse> => {
  try {
    const validatedRequest =
      UpdateRoutineTaskDependencyByRoutineIdRequestSchema.parse(request);
    const response = await func(validatedRequest);
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
  request: DeleteRoutineTaskDependencyByRoutineIdRequest,
  func: (
    request: DeleteRoutineTaskDependencyByRoutineIdRequest
  ) => Promise<DeleteRoutineTaskDependencyByRoutineIdResponse>
): Promise<DeleteRoutineTaskDependencyByRoutineIdResponse> => {
  try {
    const validatedRequest =
      DeleteRoutineTaskDependencyByRoutineIdRequestSchema.parse(request);
    const response = await func(validatedRequest);
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
