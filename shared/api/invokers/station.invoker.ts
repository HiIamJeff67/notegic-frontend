import { NotegicAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import {
  CreateStationRequest,
  CreateStationRequestSchema,
  CreateStationResponse,
  CreateStationResponseSchema,
  CreateStationsRequest,
  CreateStationsRequestSchema,
  CreateStationsResponse,
  CreateStationsResponseSchema,
  DeleteMyStationByIdRequest,
  DeleteMyStationByIdRequestSchema,
  DeleteMyStationByIdResponse,
  DeleteMyStationByIdResponseSchema,
  DeleteMyStationsByIdsRequest,
  DeleteMyStationsByIdsRequestSchema,
  DeleteMyStationsByIdsResponse,
  DeleteMyStationsByIdsResponseSchema,
  GetAllMyStationsRequest,
  GetAllMyStationsRequestSchema,
  GetAllMyStationsResponse,
  GetAllMyStationsResponseSchema,
  GetMyStationByIdRequest,
  GetMyStationByIdRequestSchema,
  GetMyStationByIdResponse,
  GetMyStationByIdResponseSchema,
  HardDeleteMyStationByIdRequest,
  HardDeleteMyStationByIdRequestSchema,
  HardDeleteMyStationByIdResponse,
  HardDeleteMyStationByIdResponseSchema,
  HardDeleteMyStationsByIdsRequest,
  HardDeleteMyStationsByIdsRequestSchema,
  HardDeleteMyStationsByIdsResponse,
  HardDeleteMyStationsByIdsResponseSchema,
  type LeaveMyStationRequest,
  LeaveMyStationRequestSchema,
  type LeaveMyStationResponse,
  LeaveMyStationResponseSchema,
  RestoreMyStationByIdRequest,
  RestoreMyStationByIdRequestSchema,
  RestoreMyStationByIdResponse,
  RestoreMyStationByIdResponseSchema,
  RestoreMyStationsByIdsRequest,
  RestoreMyStationsByIdsRequestSchema,
  RestoreMyStationsByIdsResponse,
  RestoreMyStationsByIdsResponseSchema,
  type TransferMyStationOwnershipRequest,
  TransferMyStationOwnershipRequestSchema,
  type TransferMyStationOwnershipResponse,
  TransferMyStationOwnershipResponseSchema,
  UpdateMyStationByIdRequest,
  UpdateMyStationByIdRequestSchema,
  UpdateMyStationByIdResponse,
  UpdateMyStationByIdResponseSchema,
  UpdateMyStationsByIdsRequest,
  UpdateMyStationsByIdsRequestSchema,
  UpdateMyStationsByIdsResponse,
  UpdateMyStationsByIdsResponseSchema,
  type VisualizeMyTotalCountRequest,
  VisualizeMyTotalCountRequestSchema,
  type VisualizeMyTotalCountResponse,
  VisualizeMyTotalCountResponseSchema,
} from "@shared/api/interfaces/station.interface";
import { parse } from "@shared/api/validation";
import { ZodError } from "zod";
import { invokeVisualizeQuery } from "./visualize.invoker";

export const queryFnVisualizeMyTotalCount = (
  request: VisualizeMyTotalCountRequest,
  func: (
    request: VisualizeMyTotalCountRequest
  ) => Promise<VisualizeMyTotalCountResponse>
): Promise<VisualizeMyTotalCountResponse> =>
  invokeVisualizeQuery(
    request,
    VisualizeMyTotalCountRequestSchema,
    VisualizeMyTotalCountResponseSchema,
    func,
    "queryFnVisualizeMyTotalCount"
  );

export const queryFnGetMyStationById = async (
  request: GetMyStationByIdRequest,
  func: (request: GetMyStationByIdRequest) => Promise<GetMyStationByIdResponse>
): Promise<GetMyStationByIdResponse> => {
  try {
    const validatedRequest = GetMyStationByIdRequestSchema.parse(request);
    const response = await func(validatedRequest);
    return GetMyStationByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in queryFnGetMyStationById", error);
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

export const queryFnGetAllMyStations = async (
  request: GetAllMyStationsRequest,
  func: (request: GetAllMyStationsRequest) => Promise<GetAllMyStationsResponse>
): Promise<GetAllMyStationsResponse> => {
  try {
    const validatedRequest = GetAllMyStationsRequestSchema.parse(request);
    const response = await func(validatedRequest);
    return GetAllMyStationsResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in queryFnGetAllMyStations", error);
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

export const mutationFnTransferMyStationOwnership = async (
  request: TransferMyStationOwnershipRequest,
  func: (
    request: TransferMyStationOwnershipRequest
  ) => Promise<TransferMyStationOwnershipResponse>
): Promise<TransferMyStationOwnershipResponse> => {
  try {
    const response = await func(
      TransferMyStationOwnershipRequestSchema.parse(request)
    );
    return TransferMyStationOwnershipResponseSchema.parse(response);
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

export const mutationFnLeaveMyStation = async (
  request: LeaveMyStationRequest,
  func: (request: LeaveMyStationRequest) => Promise<LeaveMyStationResponse>
): Promise<LeaveMyStationResponse> => {
  try {
    const response = await func(LeaveMyStationRequestSchema.parse(request));
    return LeaveMyStationResponseSchema.parse(response);
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

export const mutationFnCreateStation = async (
  request: CreateStationRequest,
  func: (request: CreateStationRequest) => Promise<CreateStationResponse>
): Promise<CreateStationResponse> => {
  const validatedRequest = parse(CreateStationRequestSchema, request);
  try {
    const response = await func(validatedRequest);
    return CreateStationResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnCreateStation", error);
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

export const mutationFnCreateStations = async (
  request: CreateStationsRequest,
  func: (request: CreateStationsRequest) => Promise<CreateStationsResponse>
): Promise<CreateStationsResponse> => {
  const validatedRequest = parse(CreateStationsRequestSchema, request);
  try {
    const response = await func(validatedRequest);
    return CreateStationsResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnCreateStations", error);
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

export const mutationFnUpdateMyStationById = async (
  request: UpdateMyStationByIdRequest,
  func: (
    request: UpdateMyStationByIdRequest
  ) => Promise<UpdateMyStationByIdResponse>
): Promise<UpdateMyStationByIdResponse> => {
  const validatedRequest = parse(UpdateMyStationByIdRequestSchema, request);
  try {
    const response = await func(validatedRequest);
    return UpdateMyStationByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnUpdateMyStationById", error);
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

export const mutationFnUpdateMyStationsByIds = async (
  request: UpdateMyStationsByIdsRequest,
  func: (
    request: UpdateMyStationsByIdsRequest
  ) => Promise<UpdateMyStationsByIdsResponse>
): Promise<UpdateMyStationsByIdsResponse> => {
  const validatedRequest = parse(UpdateMyStationsByIdsRequestSchema, request);
  try {
    const response = await func(validatedRequest);
    return UpdateMyStationsByIdsResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnUpdateMyStationsByIds", error);
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

export const mutationFnRestoreMyStationById = async (
  request: RestoreMyStationByIdRequest,
  func: (
    request: RestoreMyStationByIdRequest
  ) => Promise<RestoreMyStationByIdResponse>
): Promise<RestoreMyStationByIdResponse> => {
  try {
    const validatedRequest = RestoreMyStationByIdRequestSchema.parse(request);
    const response = await func(validatedRequest);
    return RestoreMyStationByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnRestoreMyStationById", error);
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

export const mutationFnRestoreMyStationsByIds = async (
  request: RestoreMyStationsByIdsRequest,
  func: (
    request: RestoreMyStationsByIdsRequest
  ) => Promise<RestoreMyStationsByIdsResponse>
): Promise<RestoreMyStationsByIdsResponse> => {
  try {
    const validatedRequest = RestoreMyStationsByIdsRequestSchema.parse(request);
    const response = await func(validatedRequest);
    return RestoreMyStationsByIdsResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnRestoreMyStationsByIds", error);
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

export const mutationFnDeleteMyStationById = async (
  request: DeleteMyStationByIdRequest,
  func: (
    request: DeleteMyStationByIdRequest
  ) => Promise<DeleteMyStationByIdResponse>
): Promise<DeleteMyStationByIdResponse> => {
  try {
    const validatedRequest = DeleteMyStationByIdRequestSchema.parse(request);
    const response = await func(validatedRequest);
    return DeleteMyStationByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnDeleteMyStationById", error);
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

export const mutationFnDeleteMyStationsByIds = async (
  request: DeleteMyStationsByIdsRequest,
  func: (
    request: DeleteMyStationsByIdsRequest
  ) => Promise<DeleteMyStationsByIdsResponse>
): Promise<DeleteMyStationsByIdsResponse> => {
  try {
    const validatedRequest = DeleteMyStationsByIdsRequestSchema.parse(request);
    const response = await func(validatedRequest);
    return DeleteMyStationsByIdsResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnDeleteMyStationsByIds", error);
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

export const mutationFnHardDeleteMyStationById = async (
  request: HardDeleteMyStationByIdRequest,
  func: (
    request: HardDeleteMyStationByIdRequest
  ) => Promise<HardDeleteMyStationByIdResponse>
): Promise<HardDeleteMyStationByIdResponse> => {
  try {
    const validatedRequest =
      HardDeleteMyStationByIdRequestSchema.parse(request);
    const response = await func(validatedRequest);
    return HardDeleteMyStationByIdResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in mutationFnHardDeleteMyStationById",
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

export const mutationFnHardDeleteMyStationsByIds = async (
  request: HardDeleteMyStationsByIdsRequest,
  func: (
    request: HardDeleteMyStationsByIdsRequest
  ) => Promise<HardDeleteMyStationsByIdsResponse>
): Promise<HardDeleteMyStationsByIdsResponse> => {
  try {
    const validatedRequest =
      HardDeleteMyStationsByIdsRequestSchema.parse(request);
    const response = await func(validatedRequest);
    return HardDeleteMyStationsByIdsResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in mutationFnHardDeleteMyStationsByIds",
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
