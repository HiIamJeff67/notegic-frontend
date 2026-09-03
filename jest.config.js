export default {
  preset: "ts-jest",
  testEnvironment: "node",
  watchman: false,
  roots: ["<rootDir>/apps/web/src", "<rootDir>/shared", "<rootDir>/test"],
  testMatch: [
    "**/__tests__/**/*.[jt]s?(x)",
    "**/*.test.[jt]s?(x)",
    "**/*.spec.[jt]s?(x)",
  ],
  testPathIgnorePatterns: ["<rootDir>/test/performance/"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: { jsx: "react-jsx" } }],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/apps/web/src/$1",
    "^@assets/(.*)$": "<rootDir>/apps/web/assets/$1",
    "^@shared/(.*)$": "<rootDir>/shared/$1",
  },
};
