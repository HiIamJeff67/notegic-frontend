import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import { NotegicAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import {
  MoveMyBlockPacksByParentSubShelfIds,
  CreateBlockPack,
  CreateBlockPacks,
  DeleteMyBlockPackById,
  DeleteMyBlockPacksByIds,
  GetAllMyBlockPacksByRootShelfId,
  GetMyBlockPackAndItsParentById,
  GetMyBlockPackById,
  GetMyBlockPacksByParentSubShelfId,
  MoveMyBlockPackById,
  MoveMyBlockPacksByParentSubShelfId,
  RestoreMyBlockPackById,
  RestoreMyBlockPacksByIds,
  UpdateMyBlockPackById,
  UpdateMyBlockPacksByIds,
} from "@/api/functions/blockPack.serverFn";
import {
  type MoveMyBlockPacksByParentSubShelfIdsRequest,
  MoveMyBlockPacksByParentSubShelfIdsRequestSchema,
  type MoveMyBlockPacksByParentSubShelfIdsResponse,
  MoveMyBlockPacksByParentSubShelfIdsResponseSchema,
  type CreateBlockPackRequest,
  CreateBlockPackRequestSchema,
  type CreateBlockPackResponse,
  CreateBlockPackResponseSchema,
  type CreateBlockPacksRequest,
  CreateBlockPacksRequestSchema,
  type CreateBlockPacksResponse,
  CreateBlockPacksResponseSchema,
  type DeleteMyBlockPackByIdRequest,
  DeleteMyBlockPackByIdRequestSchema,
  type DeleteMyBlockPackByIdResponse,
  DeleteMyBlockPackByIdResponseSchema,
  type DeleteMyBlockPacksByIdsRequest,
  DeleteMyBlockPacksByIdsRequestSchema,
  type DeleteMyBlockPacksByIdsResponse,
  DeleteMyBlockPacksByIdsResponseSchema,
  type GetAllMyBlockPacksByRootShelfIdRequest,
  GetAllMyBlockPacksByRootShelfIdRequestSchema,
  GetAllMyBlockPacksByRootShelfIdResponse,
  GetAllMyBlockPacksByRootShelfIdResponseSchema,
  type GetMyBlockPackAndItsParentByIdRequest,
  GetMyBlockPackAndItsParentByIdRequestSchema,
  GetMyBlockPackAndItsParentByIdResponse,
  GetMyBlockPackAndItsParentByIdResponseSchema,
  type GetMyBlockPackByIdRequest,
  GetMyBlockPackByIdRequestSchema,
  GetMyBlockPackByIdResponse,
  GetMyBlockPackByIdResponseSchema,
  type GetMyBlockPacksByParentSubShelfIdRequest,
  GetMyBlockPacksByParentSubShelfIdRequestSchema,
  GetMyBlockPacksByParentSubShelfIdResponse,
  GetMyBlockPacksByParentSubShelfIdResponseSchema,
  type MoveMyBlockPackByIdRequest,
  MoveMyBlockPackByIdRequestSchema,
  type MoveMyBlockPackByIdResponse,
  MoveMyBlockPackByIdResponseSchema,
  type MoveMyBlockPacksByParentSubShelfIdRequest,
  MoveMyBlockPacksByParentSubShelfIdRequestSchema,
  type MoveMyBlockPacksByParentSubShelfIdResponse,
  MoveMyBlockPacksByParentSubShelfIdResponseSchema,
  type RestoreMyBlockPackByIdRequest,
  RestoreMyBlockPackByIdRequestSchema,
  type RestoreMyBlockPackByIdResponse,
  RestoreMyBlockPackByIdResponseSchema,
  type RestoreMyBlockPacksByIdsRequest,
  RestoreMyBlockPacksByIdsRequestSchema,
  type RestoreMyBlockPacksByIdsResponse,
  RestoreMyBlockPacksByIdsResponseSchema,
  type UpdateMyBlockPackByIdRequest,
  UpdateMyBlockPackByIdRequestSchema,
  type UpdateMyBlockPackByIdResponse,
  UpdateMyBlockPackByIdResponseSchema,
  type UpdateMyBlockPacksByIdsRequest,
  UpdateMyBlockPacksByIdsRequestSchema,
  type UpdateMyBlockPacksByIdsResponse,
  UpdateMyBlockPacksByIdsResponseSchema,
} from "@shared/api/interfaces/blockPack.interface";
import { ZodError } from "zod";

export const queryFnGetMyBlockPackById = async (
  request: GetMyBlockPackByIdRequest
): Promise<GetMyBlockPackByIdResponse> => {
  try {
    const validatedRequest = GetMyBlockPackByIdRequestSchema.parse(request);
    const response = await GetMyBlockPackById({
      data: validatedRequest,
    });
    return GetMyBlockPackByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in queryFnGetMyBlockPackById", error);
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

export const queryFnGetMyBlockPackAndItsParentById = async (
  request: GetMyBlockPackAndItsParentByIdRequest
): Promise<GetMyBlockPackAndItsParentByIdResponse> => {
  try {
    const validatedRequest =
      GetMyBlockPackAndItsParentByIdRequestSchema.parse(request);
    const response = await GetMyBlockPackAndItsParentById({
      data: validatedRequest,
    });
    return GetMyBlockPackAndItsParentByIdResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in queryFnGetMyBlockPackAndItsParentById",
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

export const queryFnGetMyBlockPacksByParentSubShelfId = async (
  request: GetMyBlockPacksByParentSubShelfIdRequest
): Promise<GetMyBlockPacksByParentSubShelfIdResponse> => {
  try {
    const validatedRequest =
      GetMyBlockPacksByParentSubShelfIdRequestSchema.parse(request);
    const response = await GetMyBlockPacksByParentSubShelfId({
      data: validatedRequest,
    });
    return GetMyBlockPacksByParentSubShelfIdResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in queryFnGetMyBlockPacksByParentSubShelfId",
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

export const queryFnGetAllMyBlockPacksByRootShelfId = async (
  request: GetAllMyBlockPacksByRootShelfIdRequest
): Promise<GetAllMyBlockPacksByRootShelfIdResponse> => {
  try {
    const validatedRequest =
      GetAllMyBlockPacksByRootShelfIdRequestSchema.parse(request);
    const response = await GetAllMyBlockPacksByRootShelfId({
      data: validatedRequest,
    });
    return GetAllMyBlockPacksByRootShelfIdResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in queryFnGetAllMyBlockPacksByRootShelfId",
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

export const mutationFnCreateBlockPack = async (
  request: CreateBlockPackRequest
): Promise<CreateBlockPackResponse> => {
  try {
    const validatedRequest = CreateBlockPackRequestSchema.parse(request);
    const response = await CreateBlockPack({ data: validatedRequest });
    return CreateBlockPackResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnCreateBlockPack", error);
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

export const mutationFnCreateBlockPacks = async (
  request: CreateBlockPacksRequest
): Promise<CreateBlockPacksResponse> => {
  try {
    const validatedRequest = CreateBlockPacksRequestSchema.parse(request);
    const response = await CreateBlockPacks({ data: validatedRequest });
    return CreateBlockPacksResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnCreateBlockPacks", error);
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

export const mutationFnUpdateMyBlockPackById = async (
  request: UpdateMyBlockPackByIdRequest
): Promise<UpdateMyBlockPackByIdResponse> => {
  try {
    const validatedRequest = UpdateMyBlockPackByIdRequestSchema.parse(request);
    const response = await UpdateMyBlockPackById({
      data: validatedRequest,
    });
    return UpdateMyBlockPackByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnUpdateMyBlockPackById", error);
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

export const mutationFnUpdateMyBlockPacksByIds = async (
  request: UpdateMyBlockPacksByIdsRequest
): Promise<UpdateMyBlockPacksByIdsResponse> => {
  try {
    const validatedRequest =
      UpdateMyBlockPacksByIdsRequestSchema.parse(request);
    const response = await UpdateMyBlockPacksByIds({
      data: validatedRequest,
    });
    return UpdateMyBlockPacksByIdsResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in mutationFnUpdateMyBlockPacksByIds",
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

export const mutationFnMoveMyBlockPackById = async (
  request: MoveMyBlockPackByIdRequest
): Promise<MoveMyBlockPackByIdResponse> => {
  try {
    const validatedRequest = MoveMyBlockPackByIdRequestSchema.parse(request);
    const response = await MoveMyBlockPackById({
      data: validatedRequest,
    });
    return MoveMyBlockPackByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnMoveMyBlockPackById", error);
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

export const mutationFnMoveMyBlockPacksByParentSubShelfId = async (
  request: MoveMyBlockPacksByParentSubShelfIdRequest
): Promise<MoveMyBlockPacksByParentSubShelfIdResponse> => {
  try {
    const validatedRequest =
      MoveMyBlockPacksByParentSubShelfIdRequestSchema.parse(request);
    const response = await MoveMyBlockPacksByParentSubShelfId({
      data: validatedRequest,
    });
    return MoveMyBlockPacksByParentSubShelfIdResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in mutationFnMoveMyBlockPacksByParentSubShelfId",
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

export const mutationFnMoveMyBlockPacksByParentSubShelfIds = async (
  request: MoveMyBlockPacksByParentSubShelfIdsRequest
): Promise<MoveMyBlockPacksByParentSubShelfIdsResponse> => {
  try {
    const validatedRequest =
      MoveMyBlockPacksByParentSubShelfIdsRequestSchema.parse(request);
    const response = await MoveMyBlockPacksByParentSubShelfIds({
      data: validatedRequest,
    });
    return MoveMyBlockPacksByParentSubShelfIdsResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in mutationFnMoveMyBlockPacksByParentSubShelfIds",
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

export const mutationFnRestoreMyBlockPackById = async (
  request: RestoreMyBlockPackByIdRequest
): Promise<RestoreMyBlockPackByIdResponse> => {
  try {
    const validatedRequest = RestoreMyBlockPackByIdRequestSchema.parse(request);
    const response = await RestoreMyBlockPackById({
      data: validatedRequest,
    });
    return RestoreMyBlockPackByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnRestoreMyBlockPackById", error);
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

export const mutationFnRestoreMyBlockPacksByIds = async (
  request: RestoreMyBlockPacksByIdsRequest
): Promise<RestoreMyBlockPacksByIdsResponse> => {
  try {
    const validatedRequest =
      RestoreMyBlockPacksByIdsRequestSchema.parse(request);
    const response = await RestoreMyBlockPacksByIds({
      data: validatedRequest,
    });
    return RestoreMyBlockPacksByIdsResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in mutationFnRestoreMyBlockPacksByIds",
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

export const mutationFnDeleteMyBlockPackById = async (
  request: DeleteMyBlockPackByIdRequest
): Promise<DeleteMyBlockPackByIdResponse> => {
  try {
    const validatedRequest = DeleteMyBlockPackByIdRequestSchema.parse(request);
    const response = await DeleteMyBlockPackById({
      data: validatedRequest,
    });
    return DeleteMyBlockPackByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnDeleteMyBlockPackById", error);
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

export const mutationFnDeleteMyBlockPacksByIds = async (
  request: DeleteMyBlockPacksByIdsRequest
): Promise<DeleteMyBlockPacksByIdsResponse> => {
  try {
    const validatedRequest =
      DeleteMyBlockPacksByIdsRequestSchema.parse(request);
    const response = await DeleteMyBlockPacksByIds({
      data: validatedRequest,
    });
    return DeleteMyBlockPacksByIdsResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in mutationFnDeleteMyBlockPacksByIds",
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
