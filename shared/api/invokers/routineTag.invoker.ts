import { NotegicAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
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
  request: GetMyRoutineTagByIdRequest,
  func: (
    request: GetMyRoutineTagByIdRequest
  ) => Promise<GetMyRoutineTagByIdResponse>
): Promise<GetMyRoutineTagByIdResponse> => {
  try {
    const validatedRequest = GetMyRoutineTagByIdRequestSchema.parse(request);
    const response = await func(validatedRequest);
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
  request: GetAllMyRoutineTagsRequest,
  func: (
    request: GetAllMyRoutineTagsRequest
  ) => Promise<GetAllMyRoutineTagsResponse>
): Promise<GetAllMyRoutineTagsResponse> => {
  try {
    const validatedRequest = GetAllMyRoutineTagsRequestSchema.parse(request);
    const response = await func(validatedRequest);
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
  request: CreateRoutineTagRequest,
  func: (request: CreateRoutineTagRequest) => Promise<CreateRoutineTagResponse>
): Promise<CreateRoutineTagResponse> => {
  try {
    const validatedRequest = CreateRoutineTagRequestSchema.parse(request);
    const response = await func(validatedRequest);
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
  request: CreateRoutineTagsRequest,
  func: (
    request: CreateRoutineTagsRequest
  ) => Promise<CreateRoutineTagsResponse>
): Promise<CreateRoutineTagsResponse> => {
  try {
    const validatedRequest = CreateRoutineTagsRequestSchema.parse(request);
    const response = await func(validatedRequest);
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
  request: UpdateMyRoutineTagByIdRequest,
  func: (
    request: UpdateMyRoutineTagByIdRequest
  ) => Promise<UpdateMyRoutineTagByIdResponse>
): Promise<UpdateMyRoutineTagByIdResponse> => {
  try {
    const validatedRequest = UpdateMyRoutineTagByIdRequestSchema.parse(request);
    const response = await func(validatedRequest);
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
  request: UpdateMyRoutineTagsByIdsRequest,
  func: (
    request: UpdateMyRoutineTagsByIdsRequest
  ) => Promise<UpdateMyRoutineTagsByIdsResponse>
): Promise<UpdateMyRoutineTagsByIdsResponse> => {
  try {
    const validatedRequest =
      UpdateMyRoutineTagsByIdsRequestSchema.parse(request);
    const response = await func(validatedRequest);
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
  request: HardDeleteMyRoutineTagByIdRequest,
  func: (
    request: HardDeleteMyRoutineTagByIdRequest
  ) => Promise<HardDeleteMyRoutineTagByIdResponse>
): Promise<HardDeleteMyRoutineTagByIdResponse> => {
  try {
    const validatedRequest =
      HardDeleteMyRoutineTagByIdRequestSchema.parse(request);
    const response = await func(validatedRequest);
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
  request: HardDeleteMyRoutineTagsByIdsRequest,
  func: (
    request: HardDeleteMyRoutineTagsByIdsRequest
  ) => Promise<HardDeleteMyRoutineTagsByIdsResponse>
): Promise<HardDeleteMyRoutineTagsByIdsResponse> => {
  try {
    const validatedRequest =
      HardDeleteMyRoutineTagsByIdsRequestSchema.parse(request);
    const response = await func(validatedRequest);
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
