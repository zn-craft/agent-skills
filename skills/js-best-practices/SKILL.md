---
name: js-best-practices
description: JavaScript language-level style and structure decisions. Use when writing, changing or reviewing JS/TS code. Covers naming, function form, control flow, collections, async style and error handling, plus the tradeoffs in classes, inheritance, loops and caching. Does not cover TypeScript type modeling, module layout, framework components or build and lint config.
---

# JavaScript best practices

These rules come from real projects rather than style preference: each one says when it applies, what signal shows the code went wrong, and how to fix it. This file answers language-level questions only; type modeling, component rendering, styling, comments and where files belong follow their own conventions.

The rules assume a modern runtime (ES2023 and later). Before targeting something older, confirm the APIs exist, and re-check when the runtime or build target moves.

## Priority

When one decision is covered by several conventions, decide in this order, earlier wins:

1. What the user explicitly asked for.
2. The state of the project: lint rules already enabled, the way similar code in the directory is written, libraries and utilities already in use.
3. The defaults in this file.

Where a rule conflicts with lint, lint wins; change the lint config rather than hiding a writing problem behind `eslint-disable`. For a genuine local exception (generated code, logging on a startup path), disable it line by line with the reason next to it. Nothing under "Required" below may be deviated from; the "Default" section is decided by the order above.

Do not reimplement with built-ins what a library or utility in the project already does — dates, decimal money and deep copies are where a second implementation shows up most. Import on demand, through named imports or subpaths, instead of a whole-package default import, and do not add a library the project does not already have for a small task.

## Required

- `const` unless reassignment is genuinely needed, then `let`; never `var`.
- `===` / `!==` throughout; the one exception is `x == null`, which covers both `null` and `undefined` in one check.
- Do not mutate arguments in place; when a new value can be returned to the caller, do not change the object or array that came in. A function only mutates in place when that is its point, and then the name says so.
- Throw `Error` instances, never strings.
- No swallowed errors: a catch logs or rethrows, and an empty `catch` never appears.
- Every promise is awaited, returned or explicitly caught; an async operation has a failure branch and a finishing step, and neither is left out.
- A `try` block wraps only the lines that can fail, not the whole function body.

## Default

- Functions are arrow functions; `function` is for class methods, anything needing a dynamic `this` including an explicit `this` parameter, generators, constructors and hoisting by declaration.
- A name states the business meaning; `data`, `temp` and `handleClick2` are out, and booleans start with `is` / `has` / `should` / `can`.
- Early returns flatten nesting; a complex condition is computed into a named boolean, and no side effect hides inside a condition.
- Before changing a collection, see whose data it is: a temporary array you built is sorted or pushed in place, while one coming from arguments, state, a store or a cache is copied first or handled with `toSorted` / `toReversed`.
- For numbers, strings and dates, look for the project's library or utility first; without one, follow [values-and-numbers.md](references/values-and-numbers.md) rather than improvising inside business code.
- Async flows use `async` / `await`, and independent work runs through `Promise.all`; failure and finishing attach with `.catch()` / `.finally()` by default, and `try` / `catch` is for several `await`s sharing one handler or for carrying on after a catch.
- A failure branch follows the business: roll back an optimistic update, return the state to something retryable, write a log entry; `finally` holds the finishing work, and cancellation and timeouts take the same path.
- A business failure that can be handled comes back as a return value and exceptions are left for the unexpected; that return follows the project's existing convention, and one project keeps one shape.
- Inheritance expresses "is a"; code reuse alone uses composition, and a parent class never asks which subclasses it has.

## Exceptions to the defaults

- Performance: measurement decides. A hot spot is usually a repeated lookup inside a loop, the same data computed several times, or a full pass just to answer a yes-or-no question; see [performance.md](references/performance.md).
- Consistency with neighbouring code: an existing in-place function keeps the style around it instead of being rewritten on the way past.
- The shape of a third-party interface: the vendor only offers a callback API, or fixes the argument order.

Write one line of reasoning near the code whenever a default is left behind.

## Read on demand

Write with the rules above first, and look up the matching document when a specific question comes up.

| Task | File |
| --- | --- |
| Function form, parameter design, classes and inheritance | [functions-and-classes.md](references/functions-and-classes.md) |
| Naming, branching, defaults and optional chaining, changing a value | [control-flow-and-values.md](references/control-flow-and-values.md) |
| Number and date precision, strings, equality, deep copies | [values-and-numbers.md](references/values-and-numbers.md) |
| Sorting and de-duplication, property existence, `Map` or object | [objects-and-collections.md](references/objects-and-collections.md) |
| How an import is written and what lands in the bundle | [imports.md](references/imports.md) |
| Repeated lookups in a loop, one pass instead of several, finishing early, when caching pays | [performance.md](references/performance.md) |
| Concurrency, catching failures, finishing work, throwing and logging | [async-and-errors.md](references/async-and-errors.md) |

## When the user has to decide

- Read `skill-memory/js-best-practices.md` first; a recorded answer is followed without asking again.
- Ask only when the answer changes code in more than one place; afterwards write the conclusion and one line of reasoning into that file, one "decision — reason" per line, not the conversation.
- Everything else follows the code as it is: local naming, the parameter shape of a single function, which layer a `try` belongs in.
