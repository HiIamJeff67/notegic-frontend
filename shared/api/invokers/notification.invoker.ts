import { NotegicAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import {
  type DeleteNotificationsRequest,
  DeleteNotificationsRequestSchema,
  type DeleteNotificationsResponse,
  DeleteNotificationsResponseSchema,
  type GetUnreadNotificationCountRequest,
  GetUnreadNotificationCountRequestSchema,
  type GetUnreadNotificationCountResponse,
  GetUnreadNotificationCountResponseSchema,
  type ListNotificationsRequest,
  ListNotificationsRequestSchema,
  type ListNotificationsResponse,
  ListNotificationsResponseSchema,
  type MarkNotificationsReadRequest,
  MarkNotificationsReadRequestSchema,
  type MarkNotificationsReadResponse,
  MarkNotificationsReadResponseSchema,
} from "@shared/api/interfaces/notification.interface";
import { ZodError } from "zod";

const rethrowNotificationError = (error: unknown): never => {
  if (error instanceof ZodError) {
    throw new NotegicValidationError(
      ValidationClientException.ZodParsingFailed(error)
    );
  }
  if (error instanceof NotegicAPIError) throw error;
  if (error instanceof TypeError) {
    throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
  }
  throw error;
};

export const queryFnListNotifications = async (
  request: ListNotificationsRequest,
  func: (
    request: ListNotificationsRequest
  ) => Promise<ListNotificationsResponse>
): Promise<ListNotificationsResponse> => {
  try {
    return ListNotificationsResponseSchema.parse(
      await func(ListNotificationsRequestSchema.parse(request))
    );
  } catch (error) {
    return rethrowNotificationError(error);
  }
};

export const queryFnGetUnreadNotificationCount = async (
  request: GetUnreadNotificationCountRequest,
  func: (
    request: GetUnreadNotificationCountRequest
  ) => Promise<GetUnreadNotificationCountResponse>
): Promise<GetUnreadNotificationCountResponse> => {
  try {
    return GetUnreadNotificationCountResponseSchema.parse(
      await func(GetUnreadNotificationCountRequestSchema.parse(request))
    );
  } catch (error) {
    return rethrowNotificationError(error);
  }
};

export const mutationFnMarkNotificationsRead = async (
  request: MarkNotificationsReadRequest,
  func: (
    request: MarkNotificationsReadRequest
  ) => Promise<MarkNotificationsReadResponse>
): Promise<MarkNotificationsReadResponse> => {
  try {
    return MarkNotificationsReadResponseSchema.parse(
      await func(MarkNotificationsReadRequestSchema.parse(request))
    );
  } catch (error) {
    return rethrowNotificationError(error);
  }
};

export const mutationFnDeleteNotifications = async (
  request: DeleteNotificationsRequest,
  func: (
    request: DeleteNotificationsRequest
  ) => Promise<DeleteNotificationsResponse>
): Promise<DeleteNotificationsResponse> => {
  try {
    return DeleteNotificationsResponseSchema.parse(
      await func(DeleteNotificationsRequestSchema.parse(request))
    );
  } catch (error) {
    return rethrowNotificationError(error);
  }
};
