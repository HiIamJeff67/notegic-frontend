export default {
  preset: "ts-jest",
  testEnvironment: "node",
  watchman: false,
  roots: ["<rootDir>/apps/web/src", "<rootDir>/shared", "<rootDir>/test"],
  testMatch: ["**/__tests__/**/*.ts", "**/*.test.ts", "**/*.spec.ts"],
  testPathIgnorePatterns: ["<rootDir>/test/performance/"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/apps/web/src/$1",
    "^@assets/(.*)$": "<rootDir>/apps/web/assets/$1",
    "^@shared/(.*)$": "<rootDir>/shared/$1",
  },
};
