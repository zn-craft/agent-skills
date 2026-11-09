# TypeScript and strictness

The goal: type checking is its own command and CI requires it. Most build chains only strip syntax and never type check.

```json
{ "scripts": { "typecheck": "tsc --noEmit" } }
```

A framework project swaps in its own checker (`vue-tsc`, `svelte-check`), a multi-package project uses `tsc -b`, and the command is named `typecheck` throughout.

## Tightening in steps

| Step | Switch | What it catches |
| --- | --- | --- |
| 1 | `noImplicitAny` | Parameters with no type |
| 2 | `strictNullChecks` | Values that may be null and are not checked |
| 3 | `strict: true` | The first two plus the remaining strict checks. `strict` does not include the two below, so do not mistake it for everything |
| 4 | `noUncheckedIndexedAccess` | Index access and `Record` lookups that may be empty |
| 5 | `noUnusedLocals`, `noUnusedParameters` | Dead code left behind and unused parameters |

A new project turns on all five at once through the `tsconfig.json` in [config-templates.md](config-templates.md). An existing project starts at step 1, merges once it is clean, and evaluates the cleanup cost of steps 4 and 5 separately after step 3; a legacy directory that cannot be finished gets its own looser config with the cleanup condition recorded.

## Layering the config

- `tsconfig.json`: the application's main config.
- `tsconfig.node.json`: build scripts and tooling config, a different environment.
- `tsconfig.test.json`: the test environment, with the test framework's types.

The shared part is extracted into `tsconfig.base.json` and composed with `extends`. Do not pile every `include` into one file, or the editor scans build output as source. A project that only declares types uses `noEmit`; a library that ships `.d.ts` files turns on `declaration` and lists it in `exports`.

## Loosening it

| Form | Accepted |
| --- | --- |
| `// @ts-expect-error` with a reason | Yes, and it reports itself once the error is fixed, which is the reminder to delete it |
| `// @ts-ignore` | Only in generated code or a third-party patch |
| `as any` | No, use `unknown` and narrow |
| A whole-file `@ts-nocheck` | Only for entries on a migration list, with the cleanup condition recorded |

Type checking and lint run in parallel and do not depend on each other. CI is the only authority.
