# Utility and component libraries

One difference from a business module: **the export surface is a contract for outside users**, so changing an export is a breaking change. The file roles stay the same, but `index.ts` and the tests are held to more.

## Utility library

One capability per directory, named after the capability.

```text
src/
├── index.ts                    # package entry, re-exporting each capability's index.ts
├── formatDate/
│   ├── index.ts                # export { formatDate } from "./formatDate";
│   │                           # export type { IFormatDateOptions } from "./formatDate.type";
│   ├── formatDate.ts           # main logic
│   ├── formatDate.config.ts    # default format, time zone, locale mapping
│   ├── formatDate.type.ts      # options and return types
│   └── formatDate.test.ts
└── deepMerge/
    ├── index.ts
    ├── deepMerge.ts
    └── deepMerge.test.ts
```

- The top-level `src/index.ts` re-exports each capability's `index.ts` and never sneaks in an implementation.
- No side effects by default: importing must not read environment variables, write globals or register listeners, or tree-shaking and tests both suffer. What genuinely needs initializing is exposed as an explicit `init()` the caller invokes.
- One capability exports one idea, so a directory like `deepMerge` never grows an `objectUtils` or `commonUtils` barrel above it.
- Unit tests sit beside the implementation and carry a higher coverage expectation than business code, because the promise is stability.

## Component library

```text
src/
├── index.ts                    # export { Button } from "./button";
├── button/
│   ├── index.ts                # export { Button } from "./button";
│   │                           # export type { IButtonProps, ButtonVariant } from "./button.type";
│   ├── button.tsx              # component logic, rendering and interaction only
│   ├── button.config.ts        # variant and size to class maps, defaults
│   ├── button.type.ts          # props, events, exported enum types
│   ├── button.mock.ts          # makeButtonProps()
│   ├── button.test.tsx
│   └── styles/                 # component-private styles, not exported
└── theme/                      # tokens shared across components: colour, spacing, type
    ├── index.ts
    └── theme.config.ts
```

- Component directories and files are lowerCamelCase (`button/button.tsx`) while the component name in code is UpperCamelCase.
- Props types must be exported; the types are part of the component library's API.
- Maps such as `variant` and `size` go into `xx.config.ts`, using `as const` to keep the literal types for the props, rather than a scattering of `if` statements.
- Content shared across components, such as theme tokens or a common `useControllableState`, lives in a higher-level module so components never import each other backwards.

## Multi-framework component libraries

When one set of components serves both React and Vue:

- Shared types, constants and utilities live one level up (`core/` or `shared/`) with one subdirectory per framework implementation (`react/`, `vue/`), rather than two rendering implementations mixed into one main logic file.
- Each framework entry has its own `index.ts`, pointed at by `exports` in `package.json`, so a consumer never sees the other framework's implementation.
- Files in the shared layer keep the same division: `xx.ts`, `xx.type.ts`, `xx.config.ts`.

## What not to do

- Do not create general barrels such as `utils/`, `helpers/` or `constants/` in advance for possible future growth; they end up as a dumping ground for anything.
- Do not expose internal implementation files as public exports (`export * from "./internal/xxx"`), since anyone depending on them makes them impossible to change.
- Do not remove or change exports in a patch release. Exports are only added; a deprecated one carries a marker and stays for a version.
