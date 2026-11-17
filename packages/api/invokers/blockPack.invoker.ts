import { NotegicAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import {
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
  type GetMyBlockPackByIdRequest,
  GetMyBlockPackByIdRequestSchema,
  GetMyBlockPackByIdResponse,
  GetMyBlockPackByIdResponseSchema,
  type GetMyBlockPacksByParentSubShelfIdRequest,
  GetMyBlockPacksByParentSubShelfIdRequestSchema,
  GetMyBlockPacksByParentSubShelfIdResponse,
  GetMyBlockPacksByParentSubShelfIdResponseSchema,
  type GetMyBlockPacksByRootShelfIdRequest,
  GetMyBlockPacksByRootShelfIdRequestSchema,
  GetMyBlockPacksByRootShelfIdResponse,
  GetMyBlockPacksByRootShelfIdResponseSchema,
  type HardDeleteMyBlockPacksByIdsRequest,
  HardDeleteMyBlockPacksByIdsRequestSchema,
  type HardDeleteMyBlockPacksByIdsResponse,
  HardDeleteMyBlockPacksByIdsResponseSchema,
  type MoveMyBlockPackByIdRequest,
  MoveMyBlockPackByIdRequestSchema,
  type MoveMyBlockPackByIdResponse,
  MoveMyBlockPackByIdResponseSchema,
  type MoveMyBlockPacksByParentSubShelfIdRequest,
  MoveMyBlockPacksByParentSubShelfIdRequestSchema,
  type MoveMyBlockPacksByParentSubShelfIdResponse,
  MoveMyBlockPacksByParentSubShelfIdResponseSchema,
  type MoveMyBlockPacksByParentSubShelfIdsRequest,
  MoveMyBlockPacksByParentSubShelfIdsRequestSchema,
  type MoveMyBlockPacksByParentSubShelfIdsResponse,
  MoveMyBlockPacksByParentSubShelfIdsResponseSchema,
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
import { parse } from "@shared/api/validation";
import { ZodError } from "zod";

export const queryFnGetMyBlockPackById = async (
  request: GetMyBlockPackByIdRequest,
  func: (
    request: GetMyBlockPackByIdRequest
  ) => Promise<GetMyBlockPackByIdResponse>
): Promise<GetMyBlockPackByIdResponse> => {
  try {
    const validatedRequest = GetMyBlockPackByIdRequestSchema.parse(request);
    const response = await func(validatedRequest);
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

export const queryFnGetMyBlockPacksByParentSubShelfId = async (
  request: GetMyBlockPacksByParentSubShelfIdRequest,
  func: (
    request: GetMyBlockPacksByParentSubShelfIdRequest
  ) => Promise<GetMyBlockPacksByParentSubShelfIdResponse>
): Promise<GetMyBlockPacksByParentSubShelfIdResponse> => {
  try {
    const validatedRequest =
      GetMyBlockPacksByParentSubShelfIdRequestSchema.parse(request);
    const response = await func(validatedRequest);
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

export const queryFnGetMyBlockPacksByRootShelfId = async (
  request: GetMyBlockPacksByRootShelfIdRequest,
  func: (
    request: GetMyBlockPacksByRootShelfIdRequest
  ) => Promise<GetMyBlockPacksByRootShelfIdResponse>
): Promise<GetMyBlockPacksByRootShelfIdResponse> => {
  try {
    const validatedRequest =
      GetMyBlockPacksByRootShelfIdRequestSchema.parse(request);
    const response = await func(validatedRequest);
    return GetMyBlockPacksByRootShelfIdResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in queryFnGetMyBlockPacksByRootShelfId",
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
  request: CreateBlockPackRequest,
  func: (request: CreateBlockPackRequest) => Promise<CreateBlockPackResponse>
): Promise<CreateBlockPackResponse> => {
  const validatedRequest = parse(CreateBlockPackRequestSchema, request);
  try {
    const response = await func(validatedRequest);
    return CreateBlockPackResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnCreateBlockPack", error);
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

export const mutationFnCreateBlockPacks = async (
  request: CreateBlockPacksRequest,
  func: (request: CreateBlockPacksRequest) => Promise<CreateBlockPacksResponse>
): Promise<CreateBlockPacksResponse> => {
  const validatedRequest = parse(CreateBlockPacksRequestSchema, request);
  try {
    const response = await func(validatedRequest);
    return CreateBlockPacksResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnCreateBlockPacks", error);
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

export const mutationFnUpdateMyBlockPackById = async (
  request: UpdateMyBlockPackByIdRequest,
  func: (
    request: UpdateMyBlockPackByIdRequest
  ) => Promise<UpdateMyBlockPackByIdResponse>
): Promise<UpdateMyBlockPackByIdResponse> => {
  const validatedRequest = parse(UpdateMyBlockPackByIdRequestSchema, request);
  try {
    const response = await func(validatedRequest);
    return UpdateMyBlockPackByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnUpdateMyBlockPackById", error);
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

export const mutationFnUpdateMyBlockPacksByIds = async (
  request: UpdateMyBlockPacksByIdsRequest,
  func: (
    request: UpdateMyBlockPacksByIdsRequest
  ) => Promise<UpdateMyBlockPacksByIdsResponse>
): Promise<UpdateMyBlockPacksByIdsResponse> => {
  const validatedRequest = parse(UpdateMyBlockPacksByIdsRequestSchema, request);
  try {
    const response = await func(validatedRequest);
    return UpdateMyBlockPacksByIdsResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in mutationFnUpdateMyBlockPacksByIds",
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

export const mutationFnMoveMyBlockPackById = async (
  request: MoveMyBlockPackByIdRequest,
  func: (
    request: MoveMyBlockPackByIdRequest
  ) => Promise<MoveMyBlockPackByIdResponse>
): Promise<MoveMyBlockPackByIdResponse> => {
  try {
    const validatedRequest = MoveMyBlockPackByIdRequestSchema.parse(request);
    const response = await func(validatedRequest);
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
  request: MoveMyBlockPacksByParentSubShelfIdRequest,
  func: (
    request: MoveMyBlockPacksByParentSubShelfIdRequest
  ) => Promise<MoveMyBlockPacksByParentSubShelfIdResponse>
): Promise<MoveMyBlockPacksByParentSubShelfIdResponse> => {
  try {
    const validatedRequest =
      MoveMyBlockPacksByParentSubShelfIdRequestSchema.parse(request);
    const response = await func(validatedRequest);
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
  request: MoveMyBlockPacksByParentSubShelfIdsRequest,
  func: (
    request: MoveMyBlockPacksByParentSubShelfIdsRequest
  ) => Promise<MoveMyBlockPacksByParentSubShelfIdsResponse>
): Promise<MoveMyBlockPacksByParentSubShelfIdsResponse> => {
  try {
    const validatedRequest =
      MoveMyBlockPacksByParentSubShelfIdsRequestSchema.parse(request);
    const response = await func(validatedRequest);
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
  request: RestoreMyBlockPackByIdRequest,
  func: (
    request: RestoreMyBlockPackByIdRequest
  ) => Promise<RestoreMyBlockPackByIdResponse>
): Promise<RestoreMyBlockPackByIdResponse> => {
  try {
    const validatedRequest = RestoreMyBlockPackByIdRequestSchema.parse(request);
    const response = await func(validatedRequest);
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
  request: RestoreMyBlockPacksByIdsRequest,
  func: (
    request: RestoreMyBlockPacksByIdsRequest
  ) => Promise<RestoreMyBlockPacksByIdsResponse>
): Promise<RestoreMyBlockPacksByIdsResponse> => {
  try {
    const validatedRequest =
      RestoreMyBlockPacksByIdsRequestSchema.parse(request);
    const response = await func(validatedRequest);
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
  request: DeleteMyBlockPackByIdRequest,
  func: (
    request: DeleteMyBlockPackByIdRequest
  ) => Promise<DeleteMyBlockPackByIdResponse>
): Promise<DeleteMyBlockPackByIdResponse> => {
  try {
    const validatedRequest = DeleteMyBlockPackByIdRequestSchema.parse(request);
    const response = await func(validatedRequest);
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
  request: DeleteMyBlockPacksByIdsRequest,
  func: (
    request: DeleteMyBlockPacksByIdsRequest
  ) => Promise<DeleteMyBlockPacksByIdsResponse>
): Promise<DeleteMyBlockPacksByIdsResponse> => {
  try {
    const validatedRequest =
      DeleteMyBlockPacksByIdsRequestSchema.parse(request);
    const response = await func(validatedRequest);
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

export const mutationFnHardDeleteMyBlockPacksByIds = async (
  request: HardDeleteMyBlockPacksByIdsRequest,
  func: (
    request: HardDeleteMyBlockPacksByIdsRequest
  ) => Promise<HardDeleteMyBlockPacksByIdsResponse>
): Promise<HardDeleteMyBlockPacksByIdsResponse> => {
  try {
    const validatedRequest =
      HardDeleteMyBlockPacksByIdsRequestSchema.parse(request);
    const response = await func(validatedRequest);
    return HardDeleteMyBlockPacksByIdsResponseSchema.parse(response);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    }
    if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    throw error;
  }
};
