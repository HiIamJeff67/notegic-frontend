import type { UUID } from "crypto";

// Check if the UUID type is a version 4 uuid
export function isValidUUID(value: string): value is UUID {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

// Convert the uuid string to version 4 uuid type
export function stringToUUID(uuidString: string): UUID {
  if (!isValidUUID(uuidString)) {
    throw new Error(`Invalid UUID format: ${uuidString}`);
  }
  return uuidString as UUID;
}

// Generate a new uuid
export function generateUUID(): UUID {
  return crypto.randomUUID() as UUID;
}

export function uint8ArrayToUUID(arr: Uint8Array): UUID {
  if (arr.length !== 16) throw new Error("Invalid UUID length");
  const hex = Array.from(arr, b => b.toString(16).padStart(2, "0")).join("");
  const uuid =
    hex.slice(0, 8) +
    "-" +
    hex.slice(8, 12) +
    "-" +
    hex.slice(12, 16) +
    "-" +
    hex.slice(16, 20) +
    "-" +
    hex.slice(20);
  return uuid as UUID;
}
