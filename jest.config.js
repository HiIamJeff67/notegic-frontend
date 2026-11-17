export default {
  preset: "ts-jest",
  testEnvironment: "node",
  watchman: false,
  roots: [
    "<rootDir>/apps/desktop",
    "<rootDir>/apps/web/src",
    "<rootDir>/apps/web/test",
    "<rootDir>/packages",
    "<rootDir>/test",
  ],
  testMatch: [
    "**/__tests__/**/*.[jt]s?(x)",
    "**/*.test.[jt]s?(x)",
    "**/*.spec.[jt]s?(x)",
  ],
  testPathIgnorePatterns: [
    // BlockNote block specifications are production modules, not test suites.
    "<rootDir>/packages/lib/blockpack/specs/",
    "/test/performance/",
    // Playwright suites run through `playwright test`, not Jest.
    "/test/e2e/",
  ],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: { jsx: "react-jsx" } }],
  },
  moduleNameMapper: {
    // Jest runs CommonJS; use the same parser's published UMD build.
    "^marked$": "<rootDir>/node_modules/marked/lib/marked.umd.js",
    "^@/(.*)$": "<rootDir>/apps/web/src/$1",
    "^@assets/(.*)$": "<rootDir>/apps/web/assets/$1",
    "^@shared/api/(.*)$": "<rootDir>/packages/api/$1",
    "^@shared/components/(.*)$": "<rootDir>/packages/ui/$1",
    "^@shared/hooks/(.*)$": "<rootDir>/packages/hooks/$1",
    "^@shared/i18n$": "<rootDir>/packages/i18n/index.ts",
    "^@shared/i18n/(.*)$": "<rootDir>/packages/i18n/$1",
    "^@shared/lib/(.*)$": "<rootDir>/packages/lib/$1",
    "^@shared/reducers/(.*)$": "<rootDir>/packages/lib/reducers/$1",
    "^@shared/styles/(.*)$": "<rootDir>/packages/ui/styles/$1",
    "^@shared/types/(.*)$": "<rootDir>/packages/lib/types/$1",
  },
};
