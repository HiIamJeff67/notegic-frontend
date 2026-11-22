export type UpsertLoggedInUserOutput = {
  publicId: string;
  changed: boolean;
};

export type GetLoggedInUserOutput = {
  publicId: string;
  name: string;
  displayName: string;
  email: string;
} | null;
