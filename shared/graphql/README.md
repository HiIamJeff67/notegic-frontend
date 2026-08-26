# Frontend GraphQL Inputs

This directory contains the frontend GraphQL schema mirror, fragments, and
queries used by the client code generator. The backend public GraphQL
contracts are authoritative; this directory is a frontend consumer and
generated-artifact input, not a backend implementation or resolver source.

## Layout

```text
shared/graphql/
  schemas/       frontend schema inputs, including enums
  fragments/     reusable GraphQL fragments
  queries/       frontend operation documents
shared/api/graphql/
  generated/     generated client types and operations
```

The frontend and backend may use different code generation configuration for
their respective languages and runtimes. Keep the public schema semantics
aligned through the backend contract workflow. Run `npm run codegen` after
changing schema inputs or documents; generated files must not be edited by
hand.
