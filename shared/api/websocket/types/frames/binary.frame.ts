import { NotegicAPIError } from "@shared/api/exceptions";
import { RealtimeError } from "@shared/api/exceptions/client/realtime.exception";
import { RealtimeProtocolVersion } from "@shared/constants/version.constants";

const REALTIME_BINARY_HEADER_BYTES = 6;

export enum RealtimeBinaryFrameType {
  YjsDocument = 1,
  Awareness = 2,
}

export type RealtimeBinaryFrame = {
  version: typeof RealtimeProtocolVersion;
  type: RealtimeBinaryFrameType;
  connectorChannelId: number;
  payload: Uint8Array;
};

export const encodeRealtimeBinaryFrame = ({
  type,
  connectorChannelId,
  payload,
}: Omit<RealtimeBinaryFrame, "version">): ArrayBuffer => {
  const buffer = new ArrayBuffer(REALTIME_BINARY_HEADER_BYTES + payload.length);
  const frame = new Uint8Array(buffer);
  const view = new DataView(buffer);
  view.setUint8(0, RealtimeProtocolVersion);
  view.setUint8(1, type);
  view.setUint32(2, connectorChannelId, false);
  frame.set(payload, REALTIME_BINARY_HEADER_BYTES);
  return buffer;
};

export const parseRealtimeBinaryFrame = (
  data: ArrayBuffer
): RealtimeBinaryFrame => {
  if (data.byteLength < REALTIME_BINARY_HEADER_BYTES) {
    throw new NotegicAPIError(RealtimeError.InvalidBinaryFrame());
  }

  const view = new DataView(data);
  const version = view.getUint8(0);
  const type = view.getUint8(1);
  if (version !== RealtimeProtocolVersion) {
    throw new NotegicAPIError(RealtimeError.UnsupportedProtocolVersion());
  }
  if (
    type !== RealtimeBinaryFrameType.YjsDocument &&
    type !== RealtimeBinaryFrameType.Awareness
  ) {
    throw new NotegicAPIError(RealtimeError.InvalidBinaryFrame());
  }

  return {
    version: RealtimeProtocolVersion,
    type,
    connectorChannelId: view.getUint32(2, false),
    payload: new Uint8Array(data, REALTIME_BINARY_HEADER_BYTES),
  };
};
