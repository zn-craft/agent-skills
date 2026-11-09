# Refactoring and reorganizing directories

The goal: external import paths stay unchanged, or are replaced in one clean pass, with every step compiling.

The same sequence works for any JS/TS module — utility library, api, store or component — and differs only in whether unit tests or a type check runs at the end.

## Splitting one file into a module directory

1. Establish how it is imported from outside: `rg "from ['\"].*<old path>"`, and write down every call site.
2. Create the directory and move the main logic into it whole. External call sites break at this point, which is expected.
3. Add `index.ts` with re-exports, restoring the outward contract, and the call sites compile again with no changes.
4. Then split file by file: move `xx.type.ts` first, then `xx.config.ts`, fixing imports after each move.
5. Add mocks and tests as needed, or leave them out.
6. Finish by running type check, lint and tests, and confirm no file exists both in the old place and inside the directory.

## Before and after

```ts
// Before: one file mixing implementation and types, imported directly by callers
// src/utils/formatDate.ts
export interface IFormatDateOptions { locale?: string; }
export const formatDate = (value: Date, options: IFormatDateOptions = {}) => { /* … */ };

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

Add `index.ts` first so compilation recovers, then move `xx.type.ts` and `xx.config.ts` one at a time, running the type check after each. No external call site changes at all.

## Gathering scattered files into a directory

- The criterion is what always changes together, not whether the file names look alike.
- An `xx.util.ts` or `xx.helper.ts` holding one or two pure functions folds into `xx.config.ts` or the module's `utils/` rather than keeping another layer.
- After reorganizing, a file with no external reference can usually merge back into the main logic.
- Reorganize one module at a time; mixing them loses the focus of the review.

## What not to do

- Do not change behavior, change an interface signature or upgrade a dependency in the same refactor.
- Do not add an `index.ts` to every directory to satisfy the convention; only a directory imported across modules needs one.
- Do not keep the old and new implementation side by side "just in case", which leaves the next person unsure which one to edit.
- When a library or package changes its export surface, edit `index.ts` before the implementation, keeping the breaking change in one place that a review can spot immediately.
