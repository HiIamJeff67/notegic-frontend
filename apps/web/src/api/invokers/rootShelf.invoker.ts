import { NotegicAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import {
  type CreateRootShelfRequest,
  CreateRootShelfRequestSchema,
  type CreateRootShelfResponse,
  CreateRootShelfResponseSchema,
  type CreateRootShelvesRequest,
  CreateRootShelvesRequestSchema,
  type CreateRootShelvesResponse,
  CreateRootShelvesResponseSchema,
  type DeleteMyRootShelfByIdRequest,
  DeleteMyRootShelfByIdRequestSchema,
  type DeleteMyRootShelfByIdResponse,
  DeleteMyRootShelfByIdResponseSchema,
  type DeleteMyRootShelvesByIdsRequest,
  DeleteMyRootShelvesByIdsRequestSchema,
  type DeleteMyRootShelvesByIdsResponse,
  DeleteMyRootShelvesByIdsResponseSchema,
  type DeleteRootShelfPermissionsRequest,
  DeleteRootShelfPermissionsRequestSchema,
  type DeleteRootShelfPermissionsResponse,
  DeleteRootShelfPermissionsResponseSchema,
  type GetMyRootShelfByIdRequest,
  GetMyRootShelfByIdRequestSchema,
  type GetMyRootShelfByIdResponse,
  GetMyRootShelfByIdResponseSchema,
  type HardDeleteMyRootShelvesByIdsRequest,
  HardDeleteMyRootShelvesByIdsRequestSchema,
  type HardDeleteMyRootShelvesByIdsResponse,
  HardDeleteMyRootShelvesByIdsResponseSchema,
  type LeaveMyRootShelfRequest,
  LeaveMyRootShelfRequestSchema,
  type LeaveMyRootShelfResponse,
  LeaveMyRootShelfResponseSchema,
  type RestoreMyRootShelfByIdRequest,
  RestoreMyRootShelfByIdRequestSchema,
  type RestoreMyRootShelfByIdResponse,
  RestoreMyRootShelfByIdResponseSchema,
  type RestoreMyRootShelvesByIdsRequest,
  RestoreMyRootShelvesByIdsRequestSchema,
  type RestoreMyRootShelvesByIdsResponse,
  RestoreMyRootShelvesByIdsResponseSchema,
  type TransferMyRootShelfOwnershipRequest,
  TransferMyRootShelfOwnershipRequestSchema,
  type TransferMyRootShelfOwnershipResponse,
  TransferMyRootShelfOwnershipResponseSchema,
  type UpdateMyRootShelfByIdRequest,
  UpdateMyRootShelfByIdRequestSchema,
  type UpdateMyRootShelfByIdResponse,
  UpdateMyRootShelfByIdResponseSchema,
  type UpdateMyRootShelvesByIdsRequest,
  UpdateMyRootShelvesByIdsRequestSchema,
  type UpdateMyRootShelvesByIdsResponse,
  UpdateMyRootShelvesByIdsResponseSchema,
  type UpsertRootShelfPermissionRequest,
  UpsertRootShelfPermissionRequestSchema,
  type UpsertRootShelfPermissionResponse,
  UpsertRootShelfPermissionResponseSchema,
} from "@shared/api/interfaces/rootShelf.interface";
import { parseRequest } from "@shared/api/validation";
import { ZodError } from "zod";
import {
  CreateRootShelf,
  CreateRootShelves,
  DeleteMyRootShelfById,
  DeleteMyRootShelvesByIds,
  DeleteRootShelfPermissions,
  GetMyRootShelfById,
  HardDeleteMyRootShelvesByIds,
  LeaveMyRootShelf,
  RestoreMyRootShelfById,
  RestoreMyRootShelvesByIds,
  TransferMyRootShelfOwnership,
  UpdateMyRootShelfById,
  UpdateMyRootShelvesByIds,
  UpsertRootShelfPermission,
} from "@/api/functions/rootShelf.serverFn";

export const queryFnGetMyRootShelfById = async (
  request: GetMyRootShelfByIdRequest
): Promise<GetMyRootShelfByIdResponse> => {
  try {
    const validatedRequest = GetMyRootShelfByIdRequestSchema.parse(request);
    const response = await GetMyRootShelfById({
      data: validatedRequest,
    });
    return GetMyRootShelfByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in queryFnGetMyRootShelfById", error);
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
      throw new NotegicFetchError(
        FetchClientExceptions.MissingNetwork()
      ).removePresentation();
    }
    throw error;
  }
};

export const mutationFnCreateRootShelf = async (
  request: CreateRootShelfRequest
): Promise<CreateRootShelfResponse> => {
  const validatedRequest = parseRequest(CreateRootShelfRequestSchema, request);
  try {
    const response = await CreateRootShelf({ data: validatedRequest });
    return CreateRootShelfResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnCreateRootShelf", error);
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

export const mutationFnCreateRootShelves = async (
  request: CreateRootShelvesRequest
): Promise<CreateRootShelvesResponse> => {
  const validatedRequest = parseRequest(
    CreateRootShelvesRequestSchema,
    request
  );
  try {
    const response = await CreateRootShelves({
      data: validatedRequest,
    });
    return CreateRootShelvesResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnCreateRootShelves", error);
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      ).setPresentation("validation.invalidResponse");
    } else if (error instanceof NotegicAPIError) {
      switch (error.unWrap.reason) {
      }
    } else if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    throw error;
  }
};

export const mutationFnUpdateMyRootShelfById = async (
  request: UpdateMyRootShelfByIdRequest
): Promise<UpdateMyRootShelfByIdResponse> => {
  const validatedRequest = parseRequest(
    UpdateMyRootShelfByIdRequestSchema,
    request
  );
  try {
    const response = await UpdateMyRootShelfById({
      data: validatedRequest,
    });
    return UpdateMyRootShelfByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnUpdateMyRootShelfById", error);
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

export const mutationFnUpsertRootShelfPermission = async (
  request: UpsertRootShelfPermissionRequest
): Promise<UpsertRootShelfPermissionResponse> => {
  const validatedRequest = parseRequest(
    UpsertRootShelfPermissionRequestSchema,
    request
  );
  try {
    const response = await UpsertRootShelfPermission({
      data: validatedRequest,
    });
    return UpsertRootShelfPermissionResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in mutationFnUpsertRootShelfPermission",
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

export const mutationFnDeleteRootShelfPermissions = async (
  request: DeleteRootShelfPermissionsRequest
): Promise<DeleteRootShelfPermissionsResponse> => {
  try {
    const validatedRequest =
      DeleteRootShelfPermissionsRequestSchema.parse(request);
    const response = await DeleteRootShelfPermissions({
      data: validatedRequest,
    });
    return DeleteRootShelfPermissionsResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in mutationFnDeleteRootShelfPermissions",
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

export const mutationFnTransferMyRootShelfOwnership = async (
  request: TransferMyRootShelfOwnershipRequest
): Promise<TransferMyRootShelfOwnershipResponse> => {
  try {
    const response = await TransferMyRootShelfOwnership({
      data: TransferMyRootShelfOwnershipRequestSchema.parse(request),
    });
    return TransferMyRootShelfOwnershipResponseSchema.parse(response);
  } catch (error) {
    if (error instanceof ZodError)
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    if (error instanceof TypeError)
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    throw error;
  }
};

export const mutationFnLeaveMyRootShelf = async (
  request: LeaveMyRootShelfRequest
): Promise<LeaveMyRootShelfResponse> => {
  try {
    const response = await LeaveMyRootShelf({
      data: LeaveMyRootShelfRequestSchema.parse(request),
    });
    return LeaveMyRootShelfResponseSchema.parse(response);
  } catch (error) {
    if (error instanceof ZodError)
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    if (error instanceof TypeError)
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    throw error;
  }
};

export const mutationFnUpdateMyRootShelvesByIds = async (
  request: UpdateMyRootShelvesByIdsRequest
): Promise<UpdateMyRootShelvesByIdsResponse> => {
  const validatedRequest = parseRequest(
    UpdateMyRootShelvesByIdsRequestSchema,
    request
  );
  try {
    const response = await UpdateMyRootShelvesByIds({
      data: validatedRequest,
    });
    return UpdateMyRootShelvesByIdsResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in mutationFnUpdateMyRootShelvesByIds",
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

export const mutationFnRestoreMyRootShelfById = async (
  request: RestoreMyRootShelfByIdRequest
): Promise<RestoreMyRootShelfByIdResponse> => {
  try {
    const validatedRequest = RestoreMyRootShelfByIdRequestSchema.parse(request);
    const response = await RestoreMyRootShelfById({
      data: validatedRequest,
    });
    return RestoreMyRootShelfByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnRestoreMyRootShelfById", error);
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

export const mutationFnRestoreMyRootShelvesByIds = async (
  request: RestoreMyRootShelvesByIdsRequest
): Promise<RestoreMyRootShelvesByIdsResponse> => {
  try {
    const validatedRequest =
      RestoreMyRootShelvesByIdsRequestSchema.parse(request);
    const response = await RestoreMyRootShelvesByIds({
      data: validatedRequest,
    });
    return RestoreMyRootShelvesByIdsResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in mutationFnRestoreMyRootShelvesByIds",
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

export const mutationFnDeleteMyRootShelfById = async (
  request: DeleteMyRootShelfByIdRequest
): Promise<DeleteMyRootShelfByIdResponse> => {
  try {
    const validatedRequest = DeleteMyRootShelfByIdRequestSchema.parse(request);
    const response = await DeleteMyRootShelfById({
      data: validatedRequest,
    });
    return DeleteMyRootShelfByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnDeleteMyRootShelfById", error);
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

export const mutationFnDeleteMyRootShelvesByIds = async (
  request: DeleteMyRootShelvesByIdsRequest
): Promise<DeleteMyRootShelvesByIdsResponse> => {
  try {
    const validatedRequest =
      DeleteMyRootShelvesByIdsRequestSchema.parse(request);
    const response = await DeleteMyRootShelvesByIds({
      data: validatedRequest,
    });
    return DeleteMyRootShelvesByIdsResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in mutationFnDeleteMyRootShelvesByIds",
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

export const mutationFnHardDeleteMyRootShelvesByIds = async (
  request: HardDeleteMyRootShelvesByIdsRequest
): Promise<HardDeleteMyRootShelvesByIdsResponse> => {
  try {
    const validatedRequest =
      HardDeleteMyRootShelvesByIdsRequestSchema.parse(request);
    const response = await HardDeleteMyRootShelvesByIds({
      data: validatedRequest,
    });
    return HardDeleteMyRootShelvesByIdsResponseSchema.parse(response);
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
