# Case: config objects and constant tables

Applies to constants with fixed values and a shape worth checking: configuration, option tables, route tables, form validation rules. Values assembled at runtime with an unfixed shape do not need `satisfies`.

| Decision point | Approach | Criterion |
| --- | --- | --- |
| Whether a runtime value is needed | An `as const` object when rendering, validating or building parameters needs it | When the value only serves the type and is never iterated, do not introduce a runtime object |
| How the shape is checked | `satisfies` | `as` does not report a missing field, and a type annotation widens the literals |
| Where the type comes from | Derived from the value | `keyof typeof` or `(typeof X)[keyof typeof X]`, not a second hand-written copy |
| How deep to nest | Past three levels, split into named sub-objects | One level when one level is enough |

## Case

```ts
interface IRouteMeta {
  path: string;
  permission: string;
  breadcrumb: string;
}

export const ROUTES = {
  dashboard: { path: "/dashboard", permission: "dashboard:read", breadcrumb: "Home" },
  users: { path: "/users", permission: "user:read", breadcrumb: "Users" },
} satisfies Record<string, IRouteMeta>;

export type RouteKey = keyof typeof ROUTES;
```

Misspell `breadcrumb` as `breadcum` and `satisfies` reports it on the spot, while `ROUTES.dashboard.path` keeps the literal type `"/dashboard"` instead of widening to `string`.

## Acceptance

1. Adding an extra field beyond `IRouteMeta` to a route makes `satisfies` complain.
2. Deleting any `path` reports the missing field.
3. `RouteKey` is `"dashboard" | "users"`, not `string`.

## Common mistakes

- `const x: IXxx = {...}`, written for safety, which widens every literal.
- `as const` without `satisfies`, so a wrong shape goes unreported.
- A hand-written type and a hand-written value that drift apart.

Decisions to confirm with the user: whether the shape will grow into deeper nesting, whether `RouteKey` is exported to other modules, and whether a build script reads this value table.
