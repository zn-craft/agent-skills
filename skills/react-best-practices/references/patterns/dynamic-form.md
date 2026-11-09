# Case: dynamic forms

Applies to forms whose fields appear according to type, configuration, permissions or an earlier choice.

## Separate three things first

- **Field definition**: name, type, label, option source and validation constraints.
- **Form values**: what the user has filled in, which is the source of truth for form state.
- **Display rules**: when a field shows, disables or becomes required.

Do not fold field configuration, form values, validation results and UI expansion into one all-purpose state object.

## Recommended decisions

1. Reuse the project's existing form library and schema validation rather than building a form engine.
2. A limited set of field types with different behavior is expressed as a discriminated union; do not combine many optional fields into configurations that can be illegal.
3. Compute whether a field shows, disables or is required from the current values and permissions.
4. A field dependency has an explicit cleanup policy: whether a hidden field's value is kept, cleared or dropped at submit time is a business rule.
5. Initial values coming from the server need validation, and async initialization, a reset and editing an existing record are different things.
6. Errors are tied to fields, and submit handles field errors, global business errors and network errors together.

## A type sketch

```tsx
type FieldDefinition =
  | { type: "text"; name: string; label: string; required?: boolean }
  | { type: "select"; name: string; label: string; options: Array<{ value: string; label: string }> }
  | { type: "date"; name: string; label: string; required?: boolean };
```

With a discriminated union, rendering branches on `field.type` and TypeScript checks the configuration each kind of field needs.

## Common mistakes

- One component holding a pile of `if/else` that manages configuration, values, validation, requests and layout at once.
- `any` for every field, which throws away the type constraints.
- No rule for whether a hidden field's value still submits.
- A separate set of duplicated state for every field.
- Building a general form designer before a page has more than a few dynamic fields.

## Where this stops applying

A simple fixed form needs no dynamic schema. Configuration-driven fields earn their place only when types, dependencies or configuration are genuinely complex and reused; when the business differences are large, explicit component branches may read more clearly.
