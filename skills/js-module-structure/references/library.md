# Utility and component libraries

The export surface is a contract for outside users, so changing an export is a breaking change. These modules keep the same file roles and hold their public entry to a stricter standard.

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

- The top-level `src/index.ts` re-exports each capability's `index.ts` and does not carry implementation.
- One capability exports one idea, so a directory like `deepMerge` never grows an `objectUtils` or `commonUtils` barrel above it.
- A test file sits beside its implementation; testing tools and coverage requirements follow the project.

## Component library

```text
src/
├── index.ts                    # export { Button } from "./button";
├── button/
│   ├── index.ts                # export { Button } from "./button";
│   │                           # export type { IButtonProps, ButtonVariant } from "./button.type";
│   ├── button.tsx              # component main logic
│   ├── button.config.ts        # runtime variant and size maps, defaults
│   ├── button.type.ts          # props, events, enums and value definitions
│   ├── button.mock.ts          # makeButtonProps()
│   ├── button.test.tsx
│   └── styles/                 # component-private styles, not exported
└── theme/                      # tokens shared across components: colour, spacing, type
    ├── index.ts
    └── theme.config.ts
```

- Component directories and files are lowerCamelCase while the component name in code is UpperCamelCase.
- Props types must be exported; they are part of the component library's API.
- Runtime maps such as `variant` and `size` go into `xx.config.ts`; value definitions and derived types go into `xx.type.ts`.
- Content shared across components, such as theme tokens or a common `useControllableState`, lives in a higher-level module so components never import each other backwards.

## Multi-framework component libraries

When one set of components serves both React and Vue:

- Shared types, value definitions, constants and utilities live one level up (`core/` or `shared/`) with one subdirectory per framework implementation (`react/`, `vue/`).
- Each framework entry has its own `index.ts`, pointed at by `exports` in `package.json`, so a consumer never sees the other framework's implementation.
- Files in the shared layer keep the same division: `xx.ts`, `xx.type.ts`, `xx.config.ts`.

## What not to do

- Do not create general barrels such as `utils/`, `helpers/` or `constants/` in advance for possible future growth; they end up as a dumping ground for anything.
- Do not expose internal implementation files as public exports (`export * from "./internal/xxx"`), since anyone depending on them makes them impossible to change.
- Export compatibility follows the project's release-management rules.
