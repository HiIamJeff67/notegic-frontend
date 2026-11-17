import { NotegicAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import {
  type GetMyRoutineTaskRecordsByRoutineTaskIdRequest,
  GetMyRoutineTaskRecordsByRoutineTaskIdRequestSchema,
  type GetMyRoutineTaskRecordsByRoutineTaskIdResponse,
  GetMyRoutineTaskRecordsByRoutineTaskIdResponseSchema,
  type VisualizeMyRoutineTaskRecordActualEndedAtCountRequest,
  type VisualizeMyRoutineTaskRecordActualEndedAtCountResponse,
  VisualizeMyRoutineTaskRecordActualEndedAtCountResponseSchema,
  type VisualizeMyRoutineTaskRecordActualStartedAtCountRequest,
  type VisualizeMyRoutineTaskRecordActualStartedAtCountResponse,
  VisualizeMyRoutineTaskRecordActualStartedAtCountResponseSchema,
  VisualizeMyRoutineTaskRecordCountRequestSchema,
  type VisualizeMyRoutineTaskRecordPurposeCountRequest,
  type VisualizeMyRoutineTaskRecordPurposeCountResponse,
  VisualizeMyRoutineTaskRecordPurposeCountResponseSchema,
  type VisualizeMyRoutineTaskRecordScheduledAtCountRequest,
  type VisualizeMyRoutineTaskRecordScheduledAtCountResponse,
  VisualizeMyRoutineTaskRecordScheduledAtCountResponseSchema,
  type VisualizeMyRoutineTaskRecordStatusCountRequest,
  type VisualizeMyRoutineTaskRecordStatusCountResponse,
  VisualizeMyRoutineTaskRecordStatusCountResponseSchema,
  VisualizeMyRoutineTaskRecordTimeCountRequestSchema,
} from "@shared/api/interfaces/routineTaskRecord.interface";
import { ZodError } from "zod";
import { invokeVisualizeQuery } from "./visualize.invoker";

export const queryFnVisualizeMyRoutineTaskRecordStatusCount = (
  request: VisualizeMyRoutineTaskRecordStatusCountRequest,
  func: (
    request: VisualizeMyRoutineTaskRecordStatusCountRequest
  ) => Promise<VisualizeMyRoutineTaskRecordStatusCountResponse>
): Promise<VisualizeMyRoutineTaskRecordStatusCountResponse> =>
  invokeVisualizeQuery(
    request,
    VisualizeMyRoutineTaskRecordCountRequestSchema,
    VisualizeMyRoutineTaskRecordStatusCountResponseSchema,
    func,
    "queryFnVisualizeMyRoutineTaskRecordStatusCount"
  );

export const queryFnVisualizeMyRoutineTaskRecordPurposeCount = (
  request: VisualizeMyRoutineTaskRecordPurposeCountRequest,
  func: (
    request: VisualizeMyRoutineTaskRecordPurposeCountRequest
  ) => Promise<VisualizeMyRoutineTaskRecordPurposeCountResponse>
): Promise<VisualizeMyRoutineTaskRecordPurposeCountResponse> =>
  invokeVisualizeQuery(
    request,
    VisualizeMyRoutineTaskRecordCountRequestSchema,
    VisualizeMyRoutineTaskRecordPurposeCountResponseSchema,
    func,
    "queryFnVisualizeMyRoutineTaskRecordPurposeCount"
  );

export const queryFnVisualizeMyRoutineTaskRecordScheduledAtCount = (
  request: VisualizeMyRoutineTaskRecordScheduledAtCountRequest,
  func: (
    request: VisualizeMyRoutineTaskRecordScheduledAtCountRequest
  ) => Promise<VisualizeMyRoutineTaskRecordScheduledAtCountResponse>
): Promise<VisualizeMyRoutineTaskRecordScheduledAtCountResponse> =>
  invokeVisualizeQuery(
    request,
    VisualizeMyRoutineTaskRecordTimeCountRequestSchema,
    VisualizeMyRoutineTaskRecordScheduledAtCountResponseSchema,
    func,
    "queryFnVisualizeMyRoutineTaskRecordScheduledAtCount"
  );

export const queryFnVisualizeMyRoutineTaskRecordActualStartedAtCount = (
  request: VisualizeMyRoutineTaskRecordActualStartedAtCountRequest,
  func: (
    request: VisualizeMyRoutineTaskRecordActualStartedAtCountRequest
  ) => Promise<VisualizeMyRoutineTaskRecordActualStartedAtCountResponse>
): Promise<VisualizeMyRoutineTaskRecordActualStartedAtCountResponse> =>
  invokeVisualizeQuery(
    request,
    VisualizeMyRoutineTaskRecordTimeCountRequestSchema,
    VisualizeMyRoutineTaskRecordActualStartedAtCountResponseSchema,
    func,
    "queryFnVisualizeMyRoutineTaskRecordActualStartedAtCount"
  );

export const queryFnVisualizeMyRoutineTaskRecordActualEndedAtCount = (
  request: VisualizeMyRoutineTaskRecordActualEndedAtCountRequest,
  func: (
    request: VisualizeMyRoutineTaskRecordActualEndedAtCountRequest
  ) => Promise<VisualizeMyRoutineTaskRecordActualEndedAtCountResponse>
): Promise<VisualizeMyRoutineTaskRecordActualEndedAtCountResponse> =>
  invokeVisualizeQuery(
    request,
    VisualizeMyRoutineTaskRecordTimeCountRequestSchema,
    VisualizeMyRoutineTaskRecordActualEndedAtCountResponseSchema,
    func,
    "queryFnVisualizeMyRoutineTaskRecordActualEndedAtCount"
  );

export const queryFnGetMyRoutineTaskRecordsByRoutineTaskId = async (
  request: GetMyRoutineTaskRecordsByRoutineTaskIdRequest,
  func: (
    request: GetMyRoutineTaskRecordsByRoutineTaskIdRequest
  ) => Promise<GetMyRoutineTaskRecordsByRoutineTaskIdResponse>
): Promise<GetMyRoutineTaskRecordsByRoutineTaskIdResponse> => {
  try {
    const validatedRequest =
      GetMyRoutineTaskRecordsByRoutineTaskIdRequestSchema.parse(request);
    const response = await func(validatedRequest);
    return GetMyRoutineTaskRecordsByRoutineTaskIdResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in queryFnGetMyRoutineTaskRecordsByRoutineTaskId",
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
