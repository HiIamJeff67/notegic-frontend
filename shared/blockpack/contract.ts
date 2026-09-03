import type { UUID } from "crypto";

export const NOTEGIC_BLOCK_PACK_CHANNEL_TYPE = "BlockPack";
export const NOTEGIC_BLOCKNOTE_DOCUMENT_SCHEMA_ID = "notegic.blocknote";
export const NOTEGIC_BLOCKNOTE_DOCUMENT_SCHEMA_VERSION = 1 as const;
export const NOTEGIC_BLOCKNOTE_YJS_FRAGMENT_NAME = "document-store";
export const NOTEGIC_REALTIME_YJS_REMOTE_ORIGIN = Symbol(
  "notegic-realtime-remote"
);
export const NOTEGIC_REALTIME_YJS_LOCAL_AWARENESS_REMOVAL_ORIGIN = Symbol(
  "notegic-awareness-local-removal"
);
export const NOTEGIC_REALTIME_YJS_DOCUMENT_DEBOUNCE_MS = 100;

export const getNotegicBlockPackRoomName = (blockPackId: UUID | string) =>
  `block-pack:${blockPackId}`;

export const getNotegicBlockNoteXmlFragment = <
  TDoc extends { getXmlFragment: (name: string) => unknown },
>(
  doc: TDoc
) => doc.getXmlFragment(NOTEGIC_BLOCKNOTE_YJS_FRAGMENT_NAME);
