import { NotegicAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import {
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
  type GetMySubShelvesByRootShelfIdRequest,
  GetMySubShelvesByRootShelfIdRequestSchema,
  type GetMySubShelvesByRootShelfIdResponse,
  GetMySubShelvesByRootShelfIdResponseSchema,
  type HardDeleteMySubShelvesByIdsRequest,
  HardDeleteMySubShelvesByIdsRequestSchema,
  type HardDeleteMySubShelvesByIdsResponse,
  HardDeleteMySubShelvesByIdsResponseSchema,
  type MoveMySubShelfRequest,
  MoveMySubShelfRequestSchema,
  type MoveMySubShelfResponse,
  MoveMySubShelfResponseSchema,
  type MoveMySubShelvesByRootShelfIdRequest,
  MoveMySubShelvesByRootShelfIdRequestSchema,
  type MoveMySubShelvesByRootShelfIdResponse,
  MoveMySubShelvesByRootShelfIdResponseSchema,
  type MoveMySubShelvesByRootShelfIdsRequest,
  MoveMySubShelvesByRootShelfIdsRequestSchema,
  type MoveMySubShelvesByRootShelfIdsResponse,
  MoveMySubShelvesByRootShelfIdsResponseSchema,
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
import { parseRequest } from "@shared/api/validation";
import { ZodError } from "zod";
import {
  CreateSubShelfByRootShelfId,
  CreateSubShelvesByRootShelfIds,
  DeleteMySubShelfById,
  DeleteMySubShelvesByIds,
  GetMySubShelfById,
  GetMySubShelvesAndItemsByPrevSubShelfId,
  GetMySubShelvesByPrevSubShelfId,
  GetMySubShelvesByRootShelfId,
  HardDeleteMySubShelvesByIds,
  MoveMySubShelf,
  MoveMySubShelvesByRootShelfId,
  MoveMySubShelvesByRootShelfIds,
  RestoreMySubShelfById,
  RestoreMySubShelvesByIds,
  UpdateMySubShelfById,
  UpdateMySubShelvesByIds,
} from "@/api/functions/subShelf.serverFn";

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
    console.error(
      "error happening in queryFnGetMySubShelvesByPrevSubShelfId",
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

export const queryFnGetMySubShelvesByRootShelfId = async (
  request: GetMySubShelvesByRootShelfIdRequest
): Promise<GetMySubShelvesByRootShelfIdResponse> => {
  try {
    const validatedRequest =
      GetMySubShelvesByRootShelfIdRequestSchema.parse(request);
    const response = await GetMySubShelvesByRootShelfId({
      data: validatedRequest,
    });
    return GetMySubShelvesByRootShelfIdResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in queryFnGetMySubShelvesByRootShelfId",
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
    console.error(
      "error happening in queryFnGetMySubShelvesAndItemsByPrevSubShelfId",
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

export const mutationFnCreateSubShelfByRootShelfId = async (
  request: CreateSubShelfByRootShelfIdRequest
): Promise<CreateSubShelfByRootShelfIdResponse> => {
  const validatedRequest = parseRequest(
    CreateSubShelfByRootShelfIdRequestSchema,
    request
  );
  try {
    const response = await CreateSubShelfByRootShelfId({
      data: validatedRequest,
    });
    return CreateSubShelfByRootShelfIdResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in mutationFnCreateSubShelfByRootShelfId",
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

export const mutationFnCreateSubShelvesByRootShelfIds = async (
  request: CreateSubShelvesByRootShelfIdsRequest
): Promise<CreateSubShelvesByRootShelfIdsResponse> => {
  const validatedRequest = parseRequest(
    CreateSubShelvesByRootShelfIdsRequestSchema,
    request
  );
  try {
    const response = await CreateSubShelvesByRootShelfIds({
      data: validatedRequest,
    });
    return CreateSubShelvesByRootShelfIdsResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in mutationFnCreateSubShelvesByRootShelfIds",
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

export const mutationFnUpdateMySubShelfById = async (
  request: UpdateMySubShelfByIdRequest
): Promise<UpdateMySubShelfByIdResponse> => {
  const validatedRequest = parseRequest(
    UpdateMySubShelfByIdRequestSchema,
    request
  );
  try {
    const response = await UpdateMySubShelfById({
      data: validatedRequest,
    });
    return UpdateMySubShelfByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnUpdateMySubShelfById", error);
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

export const mutationFnUpdateMySubShelvesByIds = async (
  request: UpdateMySubShelvesByIdsRequest
): Promise<UpdateMySubShelvesByIdsResponse> => {
  const validatedRequest = parseRequest(
    UpdateMySubShelvesByIdsRequestSchema,
    request
  );
  try {
    const response = await UpdateMySubShelvesByIds({
      data: validatedRequest,
    });
    return UpdateMySubShelvesByIdsResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in mutationFnUpdateMySubShelvesByIds",
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
    const validatedRequest =
      MoveMySubShelvesByRootShelfIdRequestSchema.parse(request);
    const response = await MoveMySubShelvesByRootShelfId({
      data: validatedRequest,
    });
    return MoveMySubShelvesByRootShelfIdResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in mutationFnMoveMySubShelvesByRootShelfId",
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

export const mutationFnMoveMySubShelvesByRootShelfIds = async (
  request: MoveMySubShelvesByRootShelfIdsRequest
): Promise<MoveMySubShelvesByRootShelfIdsResponse> => {
  try {
    const validatedRequest =
      MoveMySubShelvesByRootShelfIdsRequestSchema.parse(request);
    const response = await MoveMySubShelvesByRootShelfIds({
      data: validatedRequest,
    });
    return MoveMySubShelvesByRootShelfIdsResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in mutationFnMoveMySubShelvesByRootShelfIds",
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
    console.error(
      "error happening in mutationFnRestoreMySubShelvesByIds",
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
    console.error(
      "error happening in mutationFnDeleteMySubShelvesByIds",
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

export const mutationFnHardDeleteMySubShelvesByIds = async (
  request: HardDeleteMySubShelvesByIdsRequest
): Promise<HardDeleteMySubShelvesByIdsResponse> => {
  try {
    const validatedRequest =
      HardDeleteMySubShelvesByIdsRequestSchema.parse(request);
    const response = await HardDeleteMySubShelvesByIds({
      data: validatedRequest,
    });
    return HardDeleteMySubShelvesByIdsResponseSchema.parse(response);
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
