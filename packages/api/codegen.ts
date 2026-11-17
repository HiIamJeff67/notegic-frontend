import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: [
    "packages/api/graphql/schemas/enums/*.graphql",
    "packages/api/graphql/schemas/*.graphql",
  ],
  documents: [
    "packages/api/graphql/fragments/*.graphql",
    "packages/api/graphql/queries/search.graphql",
    // "packages/api/graphql/mutations/*.graphql"
  ],
  generates: {
    "packages/api/graphql/generated/": {
      preset: "client-preset",
      config: {
        plugins: [
          {
            typescript: {},
          },
          {
            typescriptOperations: {},
          },
          {
            typescriptReactApollo: {},
          },
        ],
        useTypeImports: true,
        strictScalars: true,
        scalars: {
          UUID: "crypto#UUID",
          Time: "Date",
          Base64Bytes: "string",
          Int32: "number",
          Int64: "number",
          RawJSON: "Record<string, unknown>",
          DatatypeJSON: "Record<string, unknown>",
        },
        enumsAsTypes: false,
      },
    },
  },
};

export default config;
