# Test location conventions

- Put a unit test beside the source file it verifies. Use `*.test.ts` or
  `*.test.tsx`.
- Put Web-only integration tests in `apps/web/test/integration/`.
- Put integration tests that span shared packages or future applications in
  `test/integration/` at the repository root.
- Put Web browser E2E suites in `apps/web/test/e2e/`; run them with
  `npm run test:e2e`. Keep them independent of live user credentials.
