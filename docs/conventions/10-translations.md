# Translation entry points

Use one project-owned React translation entry point for UI labels, validation
messages, and notifications. This convention applies to Web components,
providers, custom hooks, and shared React components.

## Ownership and imports

| Responsibility | Entry point |
| --- | --- |
| React translation and language subscription | `@shared/i18n/useTranslation` |
| Shared resources and supported languages | `@shared/i18n` |
| Error presentation | `@shared/i18n/error` (`tError`) |
| Enum-to-key mappings | `@shared/i18n/enums/<enumName>.tKey` |
| Web instance initialization | `apps/web/src/i18n/index.ts` (`@/i18n`) |
| Account language restoration and persistence | `UserSettingsProvider` |

Import `useTranslation` directly from the project module, not from
`react-i18next`. Do not import the Web singleton just to translate inside React
code. The hook is not re-exported from the shared resource index: loading
resources in a non-React environment must not load the React adapter.

```tsx
import { useTranslation } from "@shared/i18n/useTranslation";

function SaveButton() {
  const { t } = useTranslation();
  return <button>{t("common.save")}</button>;
}
```

The hook returns an object containing `t`, `i18n`, and `ready`. It currently
takes no arguments and uses the application's `translation` namespace. Groups
such as `workspace`, `settingsPage`, and `server` are key prefixes inside this
namespace, not separate namespaces. Do not assume the project's hook accepts
all of the vendor hook's options or tuple destructuring.

`Trans`, `I18nextProvider`, and `initReactI18next` can still be imported from
`react-i18next` when their responsibilities are needed. They use the same i18n
instance; do not create another instance inside a component. The adapter uses
the vendor hook's context/instance selection, so an explicit `I18nextProvider`
also works without importing the Web runtime.

## Feature-local status labels

Keep short feature-local status branches inline with direct literal
`t("...")` calls at the render site. Do not introduce a translation-key helper
function, a key-building wrapper or a one-use lookup map just to hide these
branches. Existing shared enum mappings remain owned by their established
modules; do not add another mapping layer for one component.

## Current-language semantics

The vendor hook supplies subscriptions, readiness, and render updates. The
project hook obtains its translator with
`i18n.getFixedT(null, "translation")`: the namespace is fixed, but the language
is resolved when `t` is called. No custom listener, translation dictionary, or
effect that copies the current language is needed.

An async handler or event listener can retain an earlier `t` and still display
the current language after a language switch. The hook also returns a new `t`
reference when the vendor translation snapshot changes, including a language
change, so translated render data memoized with `[t]` is recalculated. Ordinary
renders with an unchanged translation snapshot retain the same reference.

```tsx
import { useMemo } from "react";
import { useTranslation } from "@shared/i18n/useTranslation";

function SaveLabel() {
  const { t } = useTranslation();
  const label = useMemo(() => t("common.save"), [t]);
  return <span>{label}</span>;
}
```

Keep normal hook dependencies correct for other captured values. A translator
does not refresh a captured account, item, or form value. For render-derived
labels, include `t` in memo dependencies. For an effect whose responsibility is
initialization, data fetching, or a long-lived connection, do not make a
language switch restart that operation merely to refresh an error toast. A
retained project `t` remains current; use the effect's actual lifecycle
dependencies. `WidgetProvider` and `RealtimeProvider` are examples of this
distinction. If an effect must react to a language change, include `t` or the
language explicitly.

Calling `t(key, { lng: "en" })` explicitly overrides the current language.
Reserve this for deliberately language-specific output, not ordinary UI.

## Translate after the operation finishes

Translate at the presentation boundary, after an awaited operation succeeds
or fails. Do not translate a message before starting the operation and then
reuse that string after the language may have changed.

```tsx
import { tError } from "@shared/i18n/error";
import { useTranslation } from "@shared/i18n/useTranslation";
import toast from "@shared/lib/toast";

function SaveAction({ save }: { save: () => Promise<void> }) {
  const { t } = useTranslation();

  const handleSave = async () => {
    try {
      await save();
      toast.success(t("workspace.notifications.widgetsSaved"));
    } catch (error) {
      toast.error(tError(error, t));
    }
  };

  return <button onClick={handleSave}>{t("common.save")}</button>;
}
```

`tError(error, t)` owns error presentation. Preserve the original API exception
and its `reason`; do not replace it with a localized `Error.message` in an
invoker. It first honors an existing UI presentation key, then translates known
`server.error.<reason>` keys, and falls back according to the existing error
policy. It does not show a toast itself. Do not restore `translateError` or
introduce per-feature error translators.

## User input validation

The API contract is owned by backend request DTOs (`json` field mapping,
`validate` tags and service checks). Database/GORM constraints protect stored
invariants; they are not a substitute for the API contract. Keep frontend Zod
requests aligned with the relevant DTO and business checks. Frontend validation
improves feedback and never replaces backend validation or authorization.

Keep one frontend owner for each editable rule: the request field schema.
Reuse request fields in form resolvers through `.shape`, `.pick()` or `.extend()`;
do not reuse a response schema's field constraints as an independent form policy.
Read-only response/storage fields remain locale-neutral. Shared workspace input
rules live in `shared/api/interfaces/workspaceInput.schema.ts`; auth, user and
RoutineTask-specific rules stay with their owning interface.

Schemas emit translation keys in Zod's `error` option. Keys live under
`validation`, `auth.validation` and existing `workspace.validation` entries in
all five locales. Do not import i18n into a schema, persist localized errors,
or duplicate field rules in a translation-key mapper.

Use `parseRequest(schema, input)` from `@shared/api/validation` at an interactive
request boundary, before transport or offline writes. It retains
`NotegicValidationError`, assigns the first issue's presentation key and preserves
the existing no-retry policy. Draft-only task edits use the same definition
schema before writing the draft, so sidebar creation and graph creation cannot
silently diverge. UI prevalidation must keep the first issue's presentation too.

```ts
const validatedRequest = parseRequest(UpdateMeRequestSchema, request);
try {
  const response = await UpdateMe({ data: validatedRequest });
  return UpdateMeResponseSchema.parse(response);
} catch (error) {
  if (error instanceof ZodError) {
    throw new NotegicValidationError(
      ValidationClientException.ZodParsingFailed(error)
    ).setPresentation("validation.invalidResponse");
  }
  throw error;
}
```

Response errors use a generic `validation.invalidResponse` (the existing auth
pilot key remains supported). Never attach an email/name/password input hint
from a malformed response. Unknown request issues retain the safe server-error
fallback through `tError(error, t)`; do not display raw diagnostic messages.

UI constraints (`maxLength`, picker restrictions and disabled submit controls)
are immediate affordances. Keep them aligned with request schemas, but do not
reimplement their regular expressions or numeric policies in UI helpers. A
UI-only conversion, such as whole minutes to API seconds, may require a local
check before conversion. Input and cross-field business rules still belong in
the schema or the existing owning workflow.

Forms whose submission relies on translated Zod feedback use `noValidate`, so
native browser popups do not intercept the app's error path. Keep useful input
types and accessibility attributes. `FormMessage` translates field keys at
render time. Existing callbacks use `toast.error(tError(error, t))` after failure.
Confirmation mismatches use `NotegicError.setPresentation(key)`, never
`new Error(t(key))`. JSON syntax errors keep their existing translated feedback;
structural payload issues flow through Zod.

Current rollout: auth account/code/password flows, editable account/profile and
binding fields, shelf/item names, Station and Routine edits, RoutineTask/payload/
Pattern edits, API key names, feedback and manually entered sharing Public IDs.
An entered Public ID is request `param` data but is still user input; generated
resource IDs, CSRF/OAuth tokens, versions and coordinates do not need individual
field hints. RoutineTag and dependency descriptions/progress remain deferred.
Do not migrate every query, persisted object or response validator just to
increase translation coverage. Do not invent new MIME/size/Pattern format rules
as a translation-only change.

Registration names use the backend's 6–32-character policy. Login and registration
reuse the password schema (8–1024 characters with uppercase/lowercase letters,
a digit and a symbol); the server still verifies credentials and codes.

## Enums and stored messages

Enum mappings contain keys, not translated strings, and do not receive `t`.
Translate directly where the value is rendered:

```tsx
import { RoutineTaskRecordStatus } from "@shared/api/interfaces/enums";
import { routineTaskRecordStatusTKeys } from "@shared/i18n/enums/routineTaskRecordStatus.tKey";
import { useTranslation } from "@shared/i18n/useTranslation";

function Status({ status }: { status: RoutineTaskRecordStatus }) {
  const { t } = useTranslation();
  return <span>{t(routineTaskRecordStatusTKeys[status])}</span>;
}
```

For composite purpose mappings, translate the mapped action and target keys
separately. Do not recreate the removed `workspace.ts` translation wrappers or
modify API enums to call React hooks.

Store translation keys and interpolation values for persisted UI messages;
translate them when presenting them. Do not persist the localized result of
`t()`. User-authored content is not a translation key. Toasts already displayed
contain rendered text and are not retroactively retranslated by this hook.

## Non-React callers and initialization

Hooks may only run inside React components or custom hooks. Pure helpers
receive `t` from their React caller, typed as `TFunction` from `i18next`, as
`tError` does. They must not import the Web singleton or initialize i18next.
Transport and storage layers preserve locale-neutral data and errors.

For a genuine non-React runtime boundary that must present a message, the
owning application can use its configured i18n instance at presentation time.
Shared code must not import `@/i18n`. Initialization, language persistence, and
`i18n.exists()` checks are not a reason to call a hook outside React.

Web initializes its instance with English and restores account preferences
through `UserSettingsProvider`. This hook does not block rendering until stored
preferences load, read storage, or alter that startup policy. `ready` means
i18next resources are ready, not that account settings have finished loading.
Shared resources are bundled for `en`, `zh-TW`, `zh-CN`, `ja`, and `ko`.

## Contributor and agent checklist

1. Use `@shared/i18n/useTranslation` in every new React translation caller.
2. Add or update keys in the appropriate shared resource group and all five
   locales. Preserve key/interpolation types; do not bypass them with `any`.
3. Keep `tError` and enum-to-key mappings as the existing presentation helpers.
4. Translate notifications after async completion; retain keys for persisted
   messages. Do not restart data initialization just because the locale changed.
5. If changing the adapter, preserve the existing key typing, context selection,
   subscription/readiness behavior, live async translation, and memo updates.
   Add namespace/key-prefix options only when real callers require them.
6. Verify with `npm run typecheck` and:

   ```sh
   npm run test:unit -- shared/i18n/useTranslation.test.tsx shared/i18n/error.test.ts shared/i18n/index.test.ts apps/web/test/integration/toastLanguage.test.ts apps/web/test/integration/userSettingsLifecycle.test.ts
   ```

The Chromium integration test uses an isolated browser and mocked API/storage
boundaries, not a live account. It checks pending success/error notifications,
retained callbacks, memoized labels, and preservation of unsaved widgets.
