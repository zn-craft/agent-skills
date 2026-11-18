# Refactoring and reorganizing directories

The goal: external import paths stay unchanged or are replaced in one clean pass, with every step compiling.

The same sequence works for any JS/TS module: utility library, api, store or component. The final check follows the project's available type check, lint and test commands.

## Splitting one file into a module directory

1. Establish how it is imported from outside: `rg "from ['\"].*<old path>"`, and write down every call site.
2. Create the directory and move the main logic into it whole. External call sites break at this point, which is expected.
3. Add `index.ts` with re-exports, restoring the outward contract.
4. Then split file by file: move type and value definitions first, then runtime configuration, fixing imports after each move.
5. Create mock and test files only when they gain real content.
6. Finish by running the project checks and confirming no file exists both in the old place and inside the directory.

## Before and after

```ts
// Before: one file mixing implementation and types, imported directly by callers
// src/utils/formatDate.ts
export interface IFormatDateOptions { locale?: string; }
export const formatDate = (value: Date, options: IFormatDateOptions = {}) => { /* ... */ };

// Caller
import { formatDate } from "@/utils/formatDate";
```

```text
After: the import path is unchanged, the file has become a directory, and index.ts
restores the outward contract
src/utils/formatDate/
├── index.ts             # export { formatDate } from "./formatDate";
│                        # export type { IFormatDateOptions } from "./formatDate.type";
├── formatDate.ts
├── formatDate.type.ts   # IFormatDateOptions
└── formatDate.test.ts
```

Add `index.ts` first so compilation recovers, then move each declaration or implementation file one at a time. No external call site changes.

## Gathering scattered files into a directory

- The criterion is what always changes together, not whether the file names look alike.
- When an `xx.util.ts` or `xx.helper.ts` holds one or two functions, merge it into the main logic or the module's `utils/` according to its consumers. Configuration holds data and fixed runtime values, not executable logic.
- After reorganizing, a file with no external reference can usually merge back into the main logic.
- Reorganize one module at a time; mixing them loses the focus of the review.

## What not to do

- Do not change behavior, change an interface signature or upgrade a dependency in the same refactor.
- Do not add an `index.ts` to every directory; only a directory imported across modules needs one.
- Do not keep the old and new implementation side by side "just in case".
- When a library or package changes its export surface, edit `index.ts` before the implementation.
