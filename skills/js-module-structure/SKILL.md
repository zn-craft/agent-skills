---
name: js-module-structure
description: Directory, file role and named-export conventions that decide where code goes in non-backend JS/TS projects. Use when creating a module, adding api / store / hooks / utils / pages to a frontend app, adding types, constants, styles or tests to an existing module, or reorganizing directories in React, Vue, Taro or uni-app projects. Not for backend services.
---

# JS/TS module structure

One directory is one module. The main logic comes first, and the other files appear as they are needed.

A utility library, a component library, and any module inside a frontend app (api, store, hooks, utils, components, pages) share this division of work; whether a framework is involved, and which one, only changes what the main logic file is called. Use it when creating a module, adding files, deciding where new content belongs, and when reorganizing a directory. A team convention that conflicts with this one wins, and what follows is the default. Backend services are out of scope.

## File roles

Directory and file names are lowerCamelCase: `userCard/userCard.ts`, `userCard/userCard.tsx`. A component identifier in code is UpperCamelCase (`export { UserCard }`), or JSX and templates treat it as a native tag. A file of fixed constants may be SCREAMING_SNAKE_CASE (`API_CONFIG.ts`). Follow what the repository already does, and do not mix styles inside one directory.

| File | Role | When to create it |
| --- | --- | --- |
| `xx.ts` / `xx.tsx` / `xx.vue` / `xx.js` | Main logic, with the basename matching the directory | Always the first file |
| `index.ts` | The only entry, re-exporting methods, components, types and constants, named exports by default. Everything outside the module imports from here instead of reaching inside. Follow the framework when it requires this file to hold the main logic (native mini program page and component directories) | When the directory is imported from outside |
| `xx.config.ts` | Fixed variables, configuration, and pure helpers that are independent of the implementation; no side effects | When hard-coded constants, magic values or reusable pure functions appear |
| `xx.type.ts` | Type declarations: interface, type, enum, and the type of a constant object | When the module has types to write. They live here by default, with no requirement that they be reused elsewhere before earning a file |
| `xx.mock.ts` | Mock data and the functions that generate it | When the API is not ready, or test and preview data is needed |
| `xx.json` | Pure static data with no logic | When non-TS consumers need the data. A native mini program cannot import JSON, so the data goes into a `.ts` file instead |
| `xx.css` / `xx.module.css` | Component-private styles, beside the component and under the same name | When the component has styles. A `styles/` subdirectory comes only when there is more than one style file or the directory is a component library |
| `xx.test.ts` | Tests, as `xx.test.tsx` when JSX is involved | When tests are worth keeping |

In a JS project without a TS build chain, `xx.type.ts` becomes `xx.d.ts` or JSDoc `@typedef` with the same purpose: types have one clear home instead of being scattered through the main logic.

Do not create every file this table lists. Its "when to create it" column is the signal to split; empty files, files with a single re-export and directories that exist to look complete are liabilities, and a module with two or three files is normal.

## Common module types

| Module | How the main logic splits | Files that usually come with it |
| --- | --- | --- |
| Utility library | One capability per file (`formatDate.ts`), with the directory named after the capability | `index.ts` re-exporting everything, `xx.type.ts`, `xx.test.ts` |
| Component library | One component per directory (`userCard/userCard.tsx`) | `xx.type.ts` for props, `xx.config.ts` for size and variant maps, `xx.test.tsx` |
| api module | One resource per file (`userApi.ts`) | `xx.type.ts` for request and response shapes, `xx.mock.ts`, `index.ts` |
| store module | One store per file (`useUserStore.ts`) | `xx.type.ts` for state and action types, `xx.mock.ts` for the initial-state factory |
| hooks / utils module | One capability per file (`useXx.ts`, `xx.ts`) | `xx.test.ts`, `xx.type.ts` |
| Page | One page per directory, with the entry named after the framework's routing convention (`index.ts` in a native mini program) | `xx.config.ts` for page-level constants, `xx.mock.ts` for preview data |

The test is always which responsibility the content carries, never whether it looks like a frontend component.

## Shared conventions

- `index.ts` exports and does nothing else; files inside the module import each other by relative path straight to the target, never back through `index.ts`, which keeps cycles out.
- The outside only knows `index.ts`: it exports what outside code may use, and outside code imports only through it (`import { xx } from "@/modules/user"`), never `from "@/modules/user/impl/detail"`. Reaching past the entry drags dependencies across layers and breaks every caller when that directory moves.
- Named exports come first; `export default` is for a framework or loader that requires it, such as routing, lazy loading or a page entry. Export order: methods and components, then types, then constants, with types on their own `export type { ... }` line.
- A component is written `const UserCard = () => {...}` and exported once at the end of the file with `export { UserCard }`, not as a function declaration; an entry file that has to default-export becomes `export default` per the rule above.
- `index.ts` is the module's outward contract, and for a published library the export surface is a compatibility promise. When refactoring, add to `index.ts` first and move the implementation after, so external import paths stay put.
- Subdirectories of a module (`components/`, `hooks/`, `composables/`, `utils/`) follow the same file roles.
- A test file sits beside its implementation by default, and follows a repository that already keeps them in `__tests__/`.

## When the user has to decide

- Read the project's `skill-memory/js-module-structure.md` first; a recorded answer is followed without asking again.
- Ask only when the answer affects the whole repository: which naming style directories and files use, whether every module gets an `index.ts`, and whether type files live in the module or in a shared directory.
- Afterwards write the conclusion and one line of reasoning into that file, one "decision — reason" per line, not the conversation.
- Everything else follows the current state: what a single module is called, where one file goes, whether this module needs a `.mock.ts`.

## Read next

- React projects (components, pages, hooks): [references/react.md](references/react.md)
- Vue projects: [references/vue.md](references/vue.md)
- Mini programs (native, Taro, uni-app): [references/miniprogram.md](references/miniprogram.md). Note that a native mini program's `index.json` is a framework configuration file, not a data file.
- Utility and component libraries: [references/library.md](references/library.md)
- Modules without a UI, such as api, store, hooks and utils: [references/non-ui-modules.md](references/non-ui-modules.md)
- Refactoring and reorganizing directories: [references/refactor.md](references/refactor.md)
