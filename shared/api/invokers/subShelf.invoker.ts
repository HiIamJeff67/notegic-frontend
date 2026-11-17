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
import { parse } from "@shared/api/validation";
import { ZodError } from "zod";

export const queryFnGetMySubShelfById = async (
  request: GetMySubShelfByIdRequest,
  func: (
    request: GetMySubShelfByIdRequest
  ) => Promise<GetMySubShelfByIdResponse>
): Promise<GetMySubShelfByIdResponse> => {
  try {
    const validatedRequest = GetMySubShelfByIdRequestSchema.parse(request);
    const response = await func(validatedRequest);
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
  request: GetMySubShelvesByPrevSubShelfIdRequest,
  func: (
    request: GetMySubShelvesByPrevSubShelfIdRequest
  ) => Promise<GetMySubShelvesByPrevSubShelfIdResponse>
): Promise<GetMySubShelvesByPrevSubShelfIdResponse> => {
  try {
    const validatedRequest =
      GetMySubShelvesByPrevSubShelfIdRequestSchema.parse(request);
    const response = await func(validatedRequest);
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
  request: GetMySubShelvesByRootShelfIdRequest,
  func: (
    request: GetMySubShelvesByRootShelfIdRequest
  ) => Promise<GetMySubShelvesByRootShelfIdResponse>
): Promise<GetMySubShelvesByRootShelfIdResponse> => {
  try {
    const validatedRequest =
      GetMySubShelvesByRootShelfIdRequestSchema.parse(request);
    const response = await func(validatedRequest);
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
  request: GetMySubShelvesAndItemsByPrevSubShelfIdRequest,
  func: (
    request: GetMySubShelvesAndItemsByPrevSubShelfIdRequest
  ) => Promise<GetMySubShelvesAndItemsByPrevSubShelfIdResponse>
): Promise<GetMySubShelvesAndItemsByPrevSubShelfIdResponse> => {
  try {
    const validatedRequest =
      GetMySubShelvesAndItemsByPrevSubShelfIdRequestSchema.parse(request);
    const response = await func(validatedRequest);
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
  request: CreateSubShelfByRootShelfIdRequest,
  func: (
    request: CreateSubShelfByRootShelfIdRequest
  ) => Promise<CreateSubShelfByRootShelfIdResponse>
): Promise<CreateSubShelfByRootShelfIdResponse> => {
  const validatedRequest = parse(
    CreateSubShelfByRootShelfIdRequestSchema,
    request
  );
  try {
    const response = await func(validatedRequest);
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
  request: CreateSubShelvesByRootShelfIdsRequest,
  func: (
    request: CreateSubShelvesByRootShelfIdsRequest
  ) => Promise<CreateSubShelvesByRootShelfIdsResponse>
): Promise<CreateSubShelvesByRootShelfIdsResponse> => {
  const validatedRequest = parse(
    CreateSubShelvesByRootShelfIdsRequestSchema,
    request
  );
  try {
    const response = await func(validatedRequest);
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
  request: UpdateMySubShelfByIdRequest,
  func: (
    request: UpdateMySubShelfByIdRequest
  ) => Promise<UpdateMySubShelfByIdResponse>
): Promise<UpdateMySubShelfByIdResponse> => {
  const validatedRequest = parse(UpdateMySubShelfByIdRequestSchema, request);
  try {
    const response = await func(validatedRequest);
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
  request: UpdateMySubShelvesByIdsRequest,
  func: (
    request: UpdateMySubShelvesByIdsRequest
  ) => Promise<UpdateMySubShelvesByIdsResponse>
): Promise<UpdateMySubShelvesByIdsResponse> => {
  const validatedRequest = parse(UpdateMySubShelvesByIdsRequestSchema, request);
  try {
    const response = await func(validatedRequest);
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
  request: MoveMySubShelfRequest,
  func: (request: MoveMySubShelfRequest) => Promise<MoveMySubShelfResponse>
): Promise<MoveMySubShelfResponse> => {
  try {
    const validatedRequest = MoveMySubShelfRequestSchema.parse(request);
    const response = await func(validatedRequest);
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
  request: MoveMySubShelvesByRootShelfIdRequest,
  func: (
    request: MoveMySubShelvesByRootShelfIdRequest
  ) => Promise<MoveMySubShelvesByRootShelfIdResponse>
): Promise<MoveMySubShelvesByRootShelfIdResponse> => {
  try {
    const validatedRequest =
      MoveMySubShelvesByRootShelfIdRequestSchema.parse(request);
    const response = await func(validatedRequest);
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
  request: MoveMySubShelvesByRootShelfIdsRequest,
  func: (
    request: MoveMySubShelvesByRootShelfIdsRequest
  ) => Promise<MoveMySubShelvesByRootShelfIdsResponse>
): Promise<MoveMySubShelvesByRootShelfIdsResponse> => {
  try {
    const validatedRequest =
      MoveMySubShelvesByRootShelfIdsRequestSchema.parse(request);
    const response = await func(validatedRequest);
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
  request: RestoreMySubShelfByIdRequest,
  func: (
    request: RestoreMySubShelfByIdRequest
  ) => Promise<RestoreMySubShelfByIdResponse>
): Promise<RestoreMySubShelfByIdResponse> => {
  try {
    const validatedRequest = RestoreMySubShelfByIdRequestSchema.parse(request);
    const response = await func(validatedRequest);
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
  request: RestoreMySubShelvesByIdsRequest,
  func: (
    request: RestoreMySubShelvesByIdsRequest
  ) => Promise<RestoreMySubShelvesByIdsResponse>
): Promise<RestoreMySubShelvesByIdsResponse> => {
  try {
    const validatedRequest =
      RestoreMySubShelvesByIdsRequestSchema.parse(request);
    const response = await func(validatedRequest);
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
  request: DeleteMySubShelfByIdRequest,
  func: (
    request: DeleteMySubShelfByIdRequest
  ) => Promise<DeleteMySubShelfByIdResponse>
): Promise<DeleteMySubShelfByIdResponse> => {
  try {
    const validatedRequest = DeleteMySubShelfByIdRequestSchema.parse(request);
    const response = await func(validatedRequest);
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
  request: DeleteMySubShelvesByIdsRequest,
  func: (
    request: DeleteMySubShelvesByIdsRequest
  ) => Promise<DeleteMySubShelvesByIdsResponse>
): Promise<DeleteMySubShelvesByIdsResponse> => {
  try {
    const validatedRequest =
      DeleteMySubShelvesByIdsRequestSchema.parse(request);
    const response = await func(validatedRequest);
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
  request: HardDeleteMySubShelvesByIdsRequest,
  func: (
    request: HardDeleteMySubShelvesByIdsRequest
  ) => Promise<HardDeleteMySubShelvesByIdsResponse>
): Promise<HardDeleteMySubShelvesByIdsResponse> => {
  try {
    const validatedRequest =
      HardDeleteMySubShelvesByIdsRequestSchema.parse(request);
    const response = await func(validatedRequest);
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
