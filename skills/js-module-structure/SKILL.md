---
name: js-module-structure
description: Plan module directories, file roles, code ownership and export relationships for JS/TS frontend apps, component libraries and utility libraries. Use when creating, splitting, moving or reorganizing modules, components and files, or when a change alters existing file responsibilities or import/export relationships. Not for backend projects.
---

# JS/TS module structure

Decide which file owns each piece of content, how files split, and how the module exports and imports them. Type modeling, component and business behavior, style values and test strategy follow the project's own rules.

One directory is one module. Utility libraries, component libraries, and an app's api, store, hooks, utils, component and page modules share this division. A framework only changes the main logic filename and required entries, not the other file roles. A conflicting team convention wins; this skill provides defaults.

## Placement workflow

1. Before editing an existing module, inspect the main logic file and same-basename `.type.ts`, `.config.ts`, `.mock.ts`, style and test files. An existing file is the default destination for its role.
2. When new content belongs to an existing sibling, write it there and import it from the main logic. Do not keep a duplicate declaration or configuration in the main file.
3. Create a file only when its content actually appears. If file responsibilities do not change, do not add, move or split files.
4. A feature change can still require structural planning: decide whether props, state, mappings, defaults or mocks cross a file boundary before implementing the feature.
5. Moving content updates imports and exports with it. When an external entry must remain stable, add the module entry before moving internal implementation.

Files such as `xx.type.ts` and `xx.config.ts` are not a checklist. Do not create empty files, files with one re-export, or directory levels that exist only to complete the structure.

## File roles

Directory and file names are lowerCamelCase: `userCard/userCard.ts`, `userCard/userCard.tsx`. A component identifier in code is UpperCamelCase, or JSX and templates treat it as a native tag. Follow existing repository naming and do not mix styles inside one directory.

| File | Role | When to create it |
| --- | --- | --- |
| `xx.ts` / `xx.tsx` / `xx.vue` / `xx.js` | Main logic with the basename matching the directory. It carries implementation and interaction and does not duplicate declarations or configuration owned by siblings | Always the first file |
| `index.ts` / `index.js` | Module entry that re-exports by default. Outside code imports here; internal files import their targets directly. A native mini program follows the framework when `index.ts` is the page or component main logic | When the module is imported from outside |
| `xx.config.ts` / `xx.config.js` | Module-level fixed values, configuration, mappings and defaults with no initialization, registration, I/O or other side effects | When runtime values genuinely need separate ownership |
| `xx.type.ts` | Type declarations and module value definitions: `interface`, `type`, `enum`, `as const` value tables and their derived types, with no side effects. A JS project uses JSDoc `@typedef` or its existing type-file convention | When those declarations appear. They live here by default, with no reuse threshold |
| `xx.mock.ts` / `xx.mock.js` | Mock data and the functions that generate it | When tests, previews or integration work need mock data |
| `xx.json` | Pure static data with no logic | When non-TS consumers need the data. A native mini program cannot import JSON, so the data goes into a `.ts` file instead |
| `xx.css` / `xx.module.css` | Component-private styles, beside the component and under the same name | When the component has styles. A `styles/` subdirectory comes only when there is more than one style file or the directory is a component library |
| `xx.test.ts` / `xx.test.js` / JSX tests | Test file | When the project needs to keep matching tests |

`.d.ts` is for declaration files and third-party augmentations, not ordinary internal module types.

Enums and `s const tables that define valid values go into `xx.type.ts`. Runtime mappings that turn those values into labels, styles or defaults go into `xx.config.ts`.

## Common module types

| Module | How the main logic splits | Files that usually come with it |
| --- | --- | --- |
| Utility library | One capability per file (`formatDate.ts`), with the directory named after the capability | `index.ts`, `xx.type.ts`, `xx.test.ts` |
| Component library | One component per directory (`userCard/userCard.tsx`) | `xx.type.ts` for props, `xx.config.ts` for size and variant maps, `xx.test.tsx` |
| api module | One resource per file (`userApi.ts`) | `xx.type.ts` for request and response shapes, `xx.mock.ts`, `index.ts` |
| store module | One store per file (`useUserStore.ts`) | `xx.type.ts` for state and action types, `xx.mock.ts` for the initial-state factory |
| hooks / utils module | One capability per file (`useXx.ts`, `xx.ts`) | `xx.test.ts`, `xx.type.ts` |
| Page | One page per directory, with the entry named after the framework's routing convention (`index.ts` in a native mini program) | `xx.config.ts` for page-level constants, `xx.mock.ts` for preview data |

The test is always which responsibility the content carries, never whether it looks like a frontend component.

## Planning example

An existing module has only `userCard.tsx`, and a feature adds a constrained set of states, state labels and styles:

- Put the state union, `as const` table and props in a new `userCard.type.ts`.
- Put the fixed state-to-label and state-to-style mappings in a new `userCard.config.ts`.
- Keep `userCard.tsx` for rendering, events and applying those mappings.
- Add the module entry only when outside code needs a stable import, then export the component and public types.

If those siblings already exist, update them instead of adding a second declaration or mapping inside the TSX.

## Exports and imports

- The module entry exports and does nothing else; use `index.ts` in TypeScript projects and `index.js` in JavaScript projects. Files inside the module import each other by relative path straight to the target, never back through the entry, which keeps cycles out.
- The outside only knows the module entry: it exports what outside code may use, and outside code imports only through it (`import { xx } from "@/modules/user"`), never `from "@/modules/user/impl/detail"`. Reaching past the entry drags dependencies across layers and breaks every caller when that directory moves.
- Named exports come first; `export default` is for a framework or loader that requires it, such as routing, lazy loading or a page entry. Export order: methods and components, then types, then constants, with types on their own `export type { ... }` line.
- The module entry is the outward contract, and for a published library the export surface is a compatibility promise. When refactoring, add to the entry first and move the implementation after, so external import paths stay put.
- Subdirectories of a module (`components/`, `hooks/`, `composables/`, `utils/`) follow the same file roles.
- A test file sits beside its implementation by default, and follows a repository that already keeps them in `__tests__/`.

## When the user has to decide

- Read the project's `skill-memory/js-module-structure.md` first; a recorded answer is followed without asking again.
- Ask only when the answer affects the whole repository: which naming style directories and files use, whether every module gets an entry, and whether type files live in the module or in a shared directory.
- Afterwards write the conclusion and one line of reasoning into that file, one "decision — reason" per line, not the conversation.
- Everything else follows the current state: what a single module is called, where one file goes, whether this module needs a `.mock.ts`.

## Read next

- React projects (components, pages, hooks): [references/react.md](references/react.md)
- Vue projects: [references/vue.md](references/vue.md)
- Mini programs (native, Taro, uni-app): [references/miniprogram.md](references/miniprogram.md). Note that a native mini program's `index.json` is a framework configuration file, not a data file.
- Utility and component libraries: [references/library.md](references/library.md)
- Modules without a UI, such as api, store, hooks and utils: [references/non-ui-modules.md](references/non-ui-modules.md)
- Refactoring and reorganizing directories: [references/refactor.md](references/refactor.md)
