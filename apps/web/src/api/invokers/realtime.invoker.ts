import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import { NotegicAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import {
  CreateMyBlockPackChannelTicket,
  CreateMyRealtimeConnectionTicket,
  GetBlockPackParticipants,
} from "@/api/functions/realtime.serverFn";
import {
  type CreateMyBlockPackChannelTicketRequest,
  CreateMyBlockPackChannelTicketRequestSchema,
  type CreateMyBlockPackChannelTicketResponse,
  CreateMyBlockPackChannelTicketResponseSchema,
  type CreateMyRealtimeConnectionTicketRequest,
  CreateMyRealtimeConnectionTicketRequestSchema,
  type CreateMyRealtimeConnectionTicketResponse,
  CreateMyRealtimeConnectionTicketResponseSchema,
  type GetBlockPackParticipantsRequest,
  GetBlockPackParticipantsRequestSchema,
  type GetBlockPackParticipantsResponse,
  GetBlockPackParticipantsResponseSchema,
} from "@shared/api/interfaces/realtime.interface";
import { ZodError } from "zod";

export const mutationFnCreateMyRealtimeConnectionTicket = async (
  request: CreateMyRealtimeConnectionTicketRequest
): Promise<CreateMyRealtimeConnectionTicketResponse> => {
  try {
    const validatedRequest =
      CreateMyRealtimeConnectionTicketRequestSchema.parse(request);
    const response = await CreateMyRealtimeConnectionTicket({
      data: validatedRequest,
    });
    return CreateMyRealtimeConnectionTicketResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in mutationFnCreateMyRealtimeConnectionTicket",
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

export const mutationFnCreateMyBlockPackChannelTicket = async (
  request: CreateMyBlockPackChannelTicketRequest
): Promise<CreateMyBlockPackChannelTicketResponse> => {
  try {
    const validatedRequest =
      CreateMyBlockPackChannelTicketRequestSchema.parse(request);
    const response = await CreateMyBlockPackChannelTicket({
      data: validatedRequest,
    });
    return CreateMyBlockPackChannelTicketResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in mutationFnCreateMyBlockPackChannelTicket",
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

export const queryFnGetBlockPackParticipants = async (
  request: GetBlockPackParticipantsRequest
): Promise<GetBlockPackParticipantsResponse> => {
  try {
    const validatedRequest =
      GetBlockPackParticipantsRequestSchema.parse(request);
    const response = await GetBlockPackParticipants({
      data: validatedRequest,
    });
    return GetBlockPackParticipantsResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in queryFnGetBlockPackParticipants", error);
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
