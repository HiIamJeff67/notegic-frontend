import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import { NotegicAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import {
  MoveMySubShelvesByRootShelfIds,
  CreateSubShelfByRootShelfId,
  CreateSubShelvesByRootShelfIds,
  DeleteMySubShelfById,
  DeleteMySubShelvesByIds,
  GetAllMySubShelvesByRootShelfId,
  GetMySubShelfById,
  GetMySubShelvesAndItemsByPrevSubShelfId,
  GetMySubShelvesByPrevSubShelfId,
  MoveMySubShelf,
  MoveMySubShelvesByRootShelfId,
  RestoreMySubShelfById,
  RestoreMySubShelvesByIds,
  UpdateMySubShelfById,
  UpdateMySubShelvesByIds,
} from "@shared/api/functions/subShelf.serverFn";
import {
  type MoveMySubShelvesByRootShelfIdsRequest,
  MoveMySubShelvesByRootShelfIdsRequestSchema,
  type MoveMySubShelvesByRootShelfIdsResponse,
  MoveMySubShelvesByRootShelfIdsResponseSchema,
  type CreateSubShelfByRootShelfIdRequest,
  CreateSubShelfByRootShelfIdRequestSchema,
  type CreateSubShelfByRootShelfIdResponse,
  CreateSubShelfByRootShelfIdResponseSchema,
  type CreateSubShelvesByRootShelfIdsRequest,
  CreateSubShelvesByRootShelfIdsRequestSchema,
  type CreateSubShelvesByRootShelfIdsResponse,
  CreateSubShelvesByRootShelfIdsResponseSchema,
  type DeleteMySubShelfByIdRequest,
  DeleteMySubShelfByIdRequestSchema,
  type DeleteMySubShelfByIdResponse,
  DeleteMySubShelfByIdResponseSchema,
  type DeleteMySubShelvesByIdsRequest,
  DeleteMySubShelvesByIdsRequestSchema,
  type DeleteMySubShelvesByIdsResponse,
  DeleteMySubShelvesByIdsResponseSchema,
  type GetAllMySubShelvesByRootShelfIdRequest,
  GetAllMySubShelvesByRootShelfIdRequestSchema,
  type GetAllMySubShelvesByRootShelfIdResponse,
  GetAllMySubShelvesByRootShelfIdResponseSchema,
  type GetMySubShelfByIdRequest,
  GetMySubShelfByIdRequestSchema,
  type GetMySubShelfByIdResponse,
  GetMySubShelfByIdResponseSchema,
  type GetMySubShelvesAndItemsByPrevSubShelfIdRequest,
  GetMySubShelvesAndItemsByPrevSubShelfIdRequestSchema,
  type GetMySubShelvesAndItemsByPrevSubShelfIdResponse,
  GetMySubShelvesAndItemsByPrevSubShelfIdResponseSchema,
  type GetMySubShelvesByPrevSubShelfIdRequest,
  GetMySubShelvesByPrevSubShelfIdRequestSchema,
  type GetMySubShelvesByPrevSubShelfIdResponse,
  GetMySubShelvesByPrevSubShelfIdResponseSchema,
  type MoveMySubShelfRequest,
  MoveMySubShelfRequestSchema,
  type MoveMySubShelfResponse,
  MoveMySubShelfResponseSchema,
  type MoveMySubShelvesByRootShelfIdRequest,
  MoveMySubShelvesByRootShelfIdRequestSchema,
  type MoveMySubShelvesByRootShelfIdResponse,
  MoveMySubShelvesByRootShelfIdResponseSchema,
  type RestoreMySubShelfByIdRequest,
  RestoreMySubShelfByIdRequestSchema,
  type RestoreMySubShelfByIdResponse,
  RestoreMySubShelfByIdResponseSchema,
  type RestoreMySubShelvesByIdsRequest,
  RestoreMySubShelvesByIdsRequestSchema,
  type RestoreMySubShelvesByIdsResponse,
  RestoreMySubShelvesByIdsResponseSchema,
  type UpdateMySubShelfByIdRequest,
  UpdateMySubShelfByIdRequestSchema,
  type UpdateMySubShelfByIdResponse,
  UpdateMySubShelfByIdResponseSchema,
  type UpdateMySubShelvesByIdsRequest,
  UpdateMySubShelvesByIdsRequestSchema,
  type UpdateMySubShelvesByIdsResponse,
  UpdateMySubShelvesByIdsResponseSchema,
} from "@shared/api/interfaces/subShelf.interface";
import { ZodError } from "zod";

export const queryFnGetMySubShelfById = async (
  request: GetMySubShelfByIdRequest
): Promise<GetMySubShelfByIdResponse> => {
  try {
    const validatedRequest = GetMySubShelfByIdRequestSchema.parse(request);
    const response = await GetMySubShelfById({
      data: validatedRequest,
    });
    return GetMySubShelfByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in queryFnGetMySubShelfById", error);
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

export const queryFnGetMySubShelvesByPrevSubShelfId = async (
  request: GetMySubShelvesByPrevSubShelfIdRequest
): Promise<GetMySubShelvesByPrevSubShelfIdResponse> => {
  try {
    const validatedRequest =
      GetMySubShelvesByPrevSubShelfIdRequestSchema.parse(request);
    const response = await GetMySubShelvesByPrevSubShelfId({
      data: validatedRequest,
    });
    return GetMySubShelvesByPrevSubShelfIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in queryFnGetMySubShelvesByPrevSubShelfId", error);
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

export const queryFnGetAllMySubShelvesByRootShelfId = async (
  request: GetAllMySubShelvesByRootShelfIdRequest
): Promise<GetAllMySubShelvesByRootShelfIdResponse> => {
  try {
    const validatedRequest =
      GetAllMySubShelvesByRootShelfIdRequestSchema.parse(request);
    const response = await GetAllMySubShelvesByRootShelfId({
      data: validatedRequest,
    });
    return GetAllMySubShelvesByRootShelfIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in queryFnGetAllMySubShelvesByRootShelfId", error);
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

export const queryFnGetMySubShelvesAndItemsByPrevSubShelfId = async (
  request: GetMySubShelvesAndItemsByPrevSubShelfIdRequest
): Promise<GetMySubShelvesAndItemsByPrevSubShelfIdResponse> => {
  try {
    const validatedRequest =
      GetMySubShelvesAndItemsByPrevSubShelfIdRequestSchema.parse(request);
    const response = await GetMySubShelvesAndItemsByPrevSubShelfId({
      data: validatedRequest,
    });
    return GetMySubShelvesAndItemsByPrevSubShelfIdResponseSchema.parse(
      response
    );
  } catch (error) {
    console.error("error happening in queryFnGetMySubShelvesAndItemsByPrevSubShelfId", error);
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

export const mutationFnCreateSubShelfByRootShelfId = async (
  request: CreateSubShelfByRootShelfIdRequest
): Promise<CreateSubShelfByRootShelfIdResponse> => {
  try {
    const validatedRequest =
      CreateSubShelfByRootShelfIdRequestSchema.parse(request);
    const response = await CreateSubShelfByRootShelfId({
      data: validatedRequest,
    });
    return CreateSubShelfByRootShelfIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnCreateSubShelfByRootShelfId", error);
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

export const mutationFnCreateSubShelvesByRootShelfIds = async (
  request: CreateSubShelvesByRootShelfIdsRequest
): Promise<CreateSubShelvesByRootShelfIdsResponse> => {
  try {
    const validatedRequest =
      CreateSubShelvesByRootShelfIdsRequestSchema.parse(request);
    const response = await CreateSubShelvesByRootShelfIds({
      data: validatedRequest,
    });
    return CreateSubShelvesByRootShelfIdsResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnCreateSubShelvesByRootShelfIds", error);
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

export const mutationFnUpdateMySubShelfById = async (
  request: UpdateMySubShelfByIdRequest
): Promise<UpdateMySubShelfByIdResponse> => {
  try {
    const validatedRequest = UpdateMySubShelfByIdRequestSchema.parse(request);
    const response = await UpdateMySubShelfById({
      data: validatedRequest,
    });
    return UpdateMySubShelfByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnUpdateMySubShelfById", error);
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

export const mutationFnUpdateMySubShelvesByIds = async (
  request: UpdateMySubShelvesByIdsRequest
): Promise<UpdateMySubShelvesByIdsResponse> => {
  try {
    const validatedRequest =
      UpdateMySubShelvesByIdsRequestSchema.parse(request);
    const response = await UpdateMySubShelvesByIds({
      data: validatedRequest,
    });
    return UpdateMySubShelvesByIdsResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnUpdateMySubShelvesByIds", error);
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

export const mutationFnMoveMySubShelf = async (
  request: MoveMySubShelfRequest
): Promise<MoveMySubShelfResponse> => {
  try {
    const validatedRequest = MoveMySubShelfRequestSchema.parse(request);
    const response = await MoveMySubShelf({ data: validatedRequest });
    return MoveMySubShelfResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnMoveMySubShelf", error);
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

export const mutationFnMoveMySubShelvesByRootShelfId = async (
  request: MoveMySubShelvesByRootShelfIdRequest
): Promise<MoveMySubShelvesByRootShelfIdResponse> => {
  try {
    const validatedRequest = MoveMySubShelvesByRootShelfIdRequestSchema.parse(request);
    const response = await MoveMySubShelvesByRootShelfId({ data: validatedRequest });
    return MoveMySubShelvesByRootShelfIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnMoveMySubShelvesByRootShelfId", error);
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

export const mutationFnMoveMySubShelvesByRootShelfIds = async (
  request: MoveMySubShelvesByRootShelfIdsRequest
): Promise<MoveMySubShelvesByRootShelfIdsResponse> => {
  try {
    const validatedRequest = MoveMySubShelvesByRootShelfIdsRequestSchema.parse(request);
    const response = await MoveMySubShelvesByRootShelfIds({
      data: validatedRequest,
    });
    return MoveMySubShelvesByRootShelfIdsResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnMoveMySubShelvesByRootShelfIds", error);
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

export const mutationFnRestoreMySubShelfById = async (
  request: RestoreMySubShelfByIdRequest
): Promise<RestoreMySubShelfByIdResponse> => {
  try {
    const validatedRequest = RestoreMySubShelfByIdRequestSchema.parse(request);
    const response = await RestoreMySubShelfById({
      data: validatedRequest,
    });
    return RestoreMySubShelfByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnRestoreMySubShelfById", error);
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

export const mutationFnRestoreMySubShelvesByIds = async (
  request: RestoreMySubShelvesByIdsRequest
): Promise<RestoreMySubShelvesByIdsResponse> => {
  try {
    const validatedRequest =
      RestoreMySubShelvesByIdsRequestSchema.parse(request);
    const response = await RestoreMySubShelvesByIds({
      data: validatedRequest,
    });
    return RestoreMySubShelvesByIdsResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnRestoreMySubShelvesByIds", error);
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

export const mutationFnDeleteMySubShelfById = async (
  request: DeleteMySubShelfByIdRequest
): Promise<DeleteMySubShelfByIdResponse> => {
  try {
    const validatedRequest = DeleteMySubShelfByIdRequestSchema.parse(request);
    const response = await DeleteMySubShelfById({
      data: validatedRequest,
    });
    return DeleteMySubShelfByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnDeleteMySubShelfById", error);
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

export const mutationFnDeleteMySubShelvesByIds = async (
  request: DeleteMySubShelvesByIdsRequest
): Promise<DeleteMySubShelvesByIdsResponse> => {
  try {
    const validatedRequest =
      DeleteMySubShelvesByIdsRequestSchema.parse(request);
    const response = await DeleteMySubShelvesByIds({
      data: validatedRequest,
    });
    return DeleteMySubShelvesByIdsResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnDeleteMySubShelvesByIds", error);
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
