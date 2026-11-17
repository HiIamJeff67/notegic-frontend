import {
  ExceptionCode,
  ExceptionPrefix,
  ExceptionReasonDictionary,
  ExceptionSubDomainCodeShiftAmount,
  NotegicException,
} from "@shared/api/exceptions";
import { StatusCodes } from "http-status-codes";

const RealtimeClientExceptionDomainCode: ExceptionCode = 993;
const ClientExceptionBaseCode_Realtime: ExceptionCode =
  RealtimeClientExceptionDomainCode * ExceptionSubDomainCodeShiftAmount;
const ClientExceptionPrefix_Realtime: ExceptionPrefix = "Realtime";

export class RealtimeError {
  static BaseCode: ExceptionCode = ClientExceptionBaseCode_Realtime;
  static Prefix: ExceptionPrefix = ClientExceptionPrefix_Realtime;

  static MissingWebSocketURL = (): NotegicException => {
    return new NotegicException({
      code: this.BaseCode + 1,
      prefix: this.Prefix,
      reason: ExceptionReasonDictionary.client.realtime.missingWebSocketURL,
      message: "Realtime WebSocket URL is missing",
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  };

  static InvalidJsonFrame = (): NotegicException => {
    return new NotegicException({
      code: this.BaseCode + 2,
      prefix: this.Prefix,
      reason: ExceptionReasonDictionary.client.realtime.invalidJsonFrame,
      message: "Realtime frame is not valid JSON",
      status: StatusCodes.BAD_REQUEST,
    });
  };

  static InvalidFrameShape = (): NotegicException => {
    return new NotegicException({
      code: this.BaseCode + 3,
      prefix: this.Prefix,
      reason: ExceptionReasonDictionary.client.realtime.invalidFrameShape,
      message: "Realtime frame must be an object",
      status: StatusCodes.BAD_REQUEST,
    });
  };

  static UnsupportedProtocolVersion = (): NotegicException => {
    return new NotegicException({
      code: this.BaseCode + 4,
      prefix: this.Prefix,
      reason:
        ExceptionReasonDictionary.client.realtime.unsupportedProtocolVersion,
      message: "Unsupported realtime protocol version",
      status: StatusCodes.BAD_REQUEST,
    });
  };

  static MissingFrameType = (): NotegicException => {
    return new NotegicException({
      code: this.BaseCode + 5,
      prefix: this.Prefix,
      reason: ExceptionReasonDictionary.client.realtime.missingFrameType,
      message: "Realtime frame type is missing",
      status: StatusCodes.BAD_REQUEST,
    });
  };

  static MissingReadyConnectionId = (): NotegicException => {
    return new NotegicException({
      code: this.BaseCode + 6,
      prefix: this.Prefix,
      reason:
        ExceptionReasonDictionary.client.realtime.missingReadyConnectionId,
      message: "Ready frame missing connectionId",
      status: StatusCodes.BAD_REQUEST,
    });
  };

  static MissingPongRequestId = (): NotegicException => {
    return new NotegicException({
      code: this.BaseCode + 7,
      prefix: this.Prefix,
      reason: ExceptionReasonDictionary.client.realtime.missingPongRequestId,
      message: "Pong frame missing requestId",
      status: StatusCodes.BAD_REQUEST,
    });
  };

  static MissingErrorFrameFields = (): NotegicException => {
    return new NotegicException({
      code: this.BaseCode + 8,
      prefix: this.Prefix,
      reason: ExceptionReasonDictionary.client.realtime.missingErrorFrameFields,
      message: "Error frame missing code/message",
      status: StatusCodes.BAD_REQUEST,
    });
  };

  static UnsupportedFrameType = (frameType: string): NotegicException => {
    return new NotegicException({
      code: this.BaseCode + 9,
      prefix: this.Prefix,
      reason: ExceptionReasonDictionary.client.realtime.unsupportedFrameType,
      message: `Unsupported realtime frame type: ${frameType}`,
      status: StatusCodes.BAD_REQUEST,
    });
  };

  static UnexpectedBinaryMessage = (): NotegicException => {
    return new NotegicException({
      code: this.BaseCode + 10,
      prefix: this.Prefix,
      reason: ExceptionReasonDictionary.client.realtime.unexpectedBinaryMessage,
      message: "Unexpected binary realtime smoke message",
      status: StatusCodes.BAD_REQUEST,
    });
  };

  static UnableToParseFrame = (): NotegicException => {
    return new NotegicException({
      code: this.BaseCode + 11,
      prefix: this.Prefix,
      reason: ExceptionReasonDictionary.client.realtime.unableToParseFrame,
      message: "Unable to parse realtime frame",
      status: StatusCodes.BAD_REQUEST,
    });
  };

  static InvalidBinaryFrame = (): NotegicException => {
    return new NotegicException({
      code: this.BaseCode + 12,
      prefix: this.Prefix,
      reason: ExceptionReasonDictionary.client.realtime.invalidBinaryFrame,
      message: "Realtime binary frame is invalid",
      status: StatusCodes.BAD_REQUEST,
    });
  };

  static MissingSubscribedConnectorChannelId = (): NotegicException => {
    return new NotegicException({
      code: this.BaseCode + 13,
      prefix: this.Prefix,
      reason:
        ExceptionReasonDictionary.client.realtime
          .missingSubscribedConnectorChannelId,
      message: "Subscribed frame missing connectorChannelId",
      status: StatusCodes.BAD_REQUEST,
    });
  };

  static MissingChannelTicket = (): NotegicException => {
    return new NotegicException({
      code: this.BaseCode + 14,
      prefix: this.Prefix,
      reason: ExceptionReasonDictionary.client.realtime.missingChannelTicket,
      message: "Realtime channel ticket is missing",
      status: StatusCodes.BAD_REQUEST,
    });
  };
}
