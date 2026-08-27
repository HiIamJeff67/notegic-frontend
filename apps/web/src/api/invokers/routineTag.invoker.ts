import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import { NotegicAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import {
  CreateRoutineTag,
  CreateRoutineTags,
  GetAllMyRoutineTags,
  GetMyRoutineTagById,
  HardDeleteMyRoutineTagById,
  HardDeleteMyRoutineTagsByIds,
  UpdateMyRoutineTagById,
  UpdateMyRoutineTagsByIds,
} from "@/api/functions/routineTag.serverFn";
import {
  CreateRoutineTagRequest,
  CreateRoutineTagRequestSchema,
  CreateRoutineTagResponse,
  CreateRoutineTagResponseSchema,
  CreateRoutineTagsRequest,
  CreateRoutineTagsRequestSchema,
  CreateRoutineTagsResponse,
  CreateRoutineTagsResponseSchema,
  GetAllMyRoutineTagsRequest,
  GetAllMyRoutineTagsRequestSchema,
  GetAllMyRoutineTagsResponse,
  GetAllMyRoutineTagsResponseSchema,
  GetMyRoutineTagByIdRequest,
  GetMyRoutineTagByIdRequestSchema,
  GetMyRoutineTagByIdResponse,
  GetMyRoutineTagByIdResponseSchema,
  HardDeleteMyRoutineTagByIdRequest,
  HardDeleteMyRoutineTagByIdRequestSchema,
  HardDeleteMyRoutineTagByIdResponse,
  HardDeleteMyRoutineTagByIdResponseSchema,
  HardDeleteMyRoutineTagsByIdsRequest,
  HardDeleteMyRoutineTagsByIdsRequestSchema,
  HardDeleteMyRoutineTagsByIdsResponse,
  HardDeleteMyRoutineTagsByIdsResponseSchema,
  UpdateMyRoutineTagByIdRequest,
  UpdateMyRoutineTagByIdRequestSchema,
  UpdateMyRoutineTagByIdResponse,
  UpdateMyRoutineTagByIdResponseSchema,
  UpdateMyRoutineTagsByIdsRequest,
  UpdateMyRoutineTagsByIdsRequestSchema,
  UpdateMyRoutineTagsByIdsResponse,
  UpdateMyRoutineTagsByIdsResponseSchema,
} from "@shared/api/interfaces/routineTag.interface";
import { ZodError } from "zod";

export const queryFnGetMyRoutineTagById = async (
  request: GetMyRoutineTagByIdRequest
): Promise<GetMyRoutineTagByIdResponse> => {
  try {
    const validatedRequest = GetMyRoutineTagByIdRequestSchema.parse(request);
    const response = await GetMyRoutineTagById({
      data: validatedRequest,
    });
    return GetMyRoutineTagByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in queryFnGetMyRoutineTagById", error);
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

export const queryFnGetAllMyRoutineTags = async (
  request: GetAllMyRoutineTagsRequest
): Promise<GetAllMyRoutineTagsResponse> => {
  try {
    const validatedRequest = GetAllMyRoutineTagsRequestSchema.parse(request);
    const response = await GetAllMyRoutineTags({
      data: validatedRequest,
    });
    return GetAllMyRoutineTagsResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in queryFnGetAllMyRoutineTags", error);
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

export const mutationFnCreateRoutineTag = async (
  request: CreateRoutineTagRequest
): Promise<CreateRoutineTagResponse> => {
  try {
    const validatedRequest = CreateRoutineTagRequestSchema.parse(request);
    const response = await CreateRoutineTag({
      data: validatedRequest,
    });
    return CreateRoutineTagResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnCreateRoutineTag", error);
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

export const mutationFnCreateRoutineTags = async (
  request: CreateRoutineTagsRequest
): Promise<CreateRoutineTagsResponse> => {
  try {
    const validatedRequest = CreateRoutineTagsRequestSchema.parse(request);
    const response = await CreateRoutineTags({
      data: validatedRequest,
    });
    return CreateRoutineTagsResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnCreateRoutineTags", error);
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

export const mutationFnUpdateMyRoutineTagById = async (
  request: UpdateMyRoutineTagByIdRequest
): Promise<UpdateMyRoutineTagByIdResponse> => {
  try {
    const validatedRequest = UpdateMyRoutineTagByIdRequestSchema.parse(request);
    const response = await UpdateMyRoutineTagById({
      data: validatedRequest,
    });
    return UpdateMyRoutineTagByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnUpdateMyRoutineTagById", error);
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

export const mutationFnUpdateMyRoutineTagsByIds = async (
  request: UpdateMyRoutineTagsByIdsRequest
): Promise<UpdateMyRoutineTagsByIdsResponse> => {
  try {
    const validatedRequest =
      UpdateMyRoutineTagsByIdsRequestSchema.parse(request);
    const response = await UpdateMyRoutineTagsByIds({
      data: validatedRequest,
    });
    return UpdateMyRoutineTagsByIdsResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in mutationFnUpdateMyRoutineTagsByIds",
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

export const mutationFnHardDeleteMyRoutineTagById = async (
  request: HardDeleteMyRoutineTagByIdRequest
): Promise<HardDeleteMyRoutineTagByIdResponse> => {
  try {
    const validatedRequest =
      HardDeleteMyRoutineTagByIdRequestSchema.parse(request);
    const response = await HardDeleteMyRoutineTagById({
      data: validatedRequest,
    });
    return HardDeleteMyRoutineTagByIdResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in mutationFnHardDeleteMyRoutineTagById",
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

export const mutationFnHardDeleteMyRoutineTagsByIds = async (
  request: HardDeleteMyRoutineTagsByIdsRequest
): Promise<HardDeleteMyRoutineTagsByIdsResponse> => {
  try {
    const validatedRequest =
      HardDeleteMyRoutineTagsByIdsRequestSchema.parse(request);
    const response = await HardDeleteMyRoutineTagsByIds({
      data: validatedRequest,
    });
    return HardDeleteMyRoutineTagsByIdsResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in mutationFnHardDeleteMyRoutineTagsByIds",
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
