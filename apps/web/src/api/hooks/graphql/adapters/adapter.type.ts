export type SearchLocalAdapter = {
  fieldName: string;
  sync: (data?: any) => Promise<void>;
  simulate: (input: any) => Promise<any>;
  signature: (data?: any) => string;
  syncErrorMessage: string;
  simulateErrorMessage: string;
};
