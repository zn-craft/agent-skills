---
name: react-best-practices
description: React component work, covering boundaries between components, where state lives, Hooks, Effects, data fetching, rendering and interaction performance. Use when writing, changing or reviewing React components. For SSR or RSC, consult the guidance for the project's version. Does not cover build configuration, TypeScript type design or CSS conventions.
---

# React best practices

Start with the component in question and its callers, and confirm the React version, the rendering environment and the data layer already in place. Follow the project's own idioms where they fit the current version and its rules, and keep the change inside what the task needs.

## How to write

- Keep client rendering pure. Do not change outer variables, issue imperative requests or touch the DOM while rendering. Call ordinary Hooks at the top level of a component or a custom Hook.
- Decide where data comes from and who may change it before writing JSX. A value that can be computed directly is not stored. Shared state is held by the nearest common owner, read by children through Props, and changed through callbacks.
- A save button sends its request from the submit handler. Subscribing to external data, registering listeners or starting timers uses an Effect that syncs and tears down what the previous run created.
- Split out a component when the UI has its own responsibility or changes on its own. Extract a Hook to reuse stateful behavior, and use a plain function for pure computation. Two chunks of JSX that look alike are split only if they will change for the same reason.
- Queries and caching follow the data layer the project already has. A hand-written request handles failure and stops an older result from overwriting a newer one.
- Components are written `const A = (props) => {...}` and exported at the end of the file with `export { A }`; `export default` only where the framework or a lazy import requires it.
- Handle loading, empty results, failure and keyboard operation for the scenario in front of you.

While changing code, walk the interaction it belongs to, drop duplicated computation and needless updates along the way, and keep the behavior as it was.

## Read on demand

Everyday client changes start from the rules above. Look up the matching document when a specific question comes up: check the cases when a product decision is involved, and the everyday rules when you need implementation detail.

### Everyday work

| Task | File |
|---|---|
| State ownership, derived values, Effects | [state-and-effects.md](references/state-and-effects.md) |
| Component responsibility, internal structure, the Props interface and parent-child communication | [components.md](references/components.md) |
| When to extract a Hook, its call rules, parameters and return value | [hooks.md](references/hooks.md) |
| JSX style, the DOM, interaction and accessibility | [web-ui.md](references/web-ui.md) |
| What triggers a request, caching, race conditions | [client-data.md](references/client-data.md) |
| Changing inputs, scrolling, long lists or repeated computation, or tracking down render cost | [performance.md](references/performance.md) |

### Environment and version

| Task | File |
|---|---|
| Server pre-rendering or hydration is involved | [ssr-and-hydration.md](references/ssr-and-hydration.md) |
| The framework actually uses RSC or Server Functions | [server-components.md](references/server-components.md) |
| API differences between versions | [compatibility.md](references/compatibility.md) |

### Business cases

| Task | File |
|---|---|
| Pagination, row selection, bulk actions | [data-table.md](references/patterns/data-table.md) |
| Search as you type, submitting a search, request races | [search-and-filter.md](references/patterns/search-and-filter.md) |
| Dependent fields, dynamic validation | [dynamic-form.md](references/patterns/dynamic-form.md) |
| Opening a dialog, submitting, restoring focus | [dialog-and-modal.md](references/patterns/dialog-and-modal.md) |

## Business behavior to confirm

Before writing, look at `skill-memory/react-best-practices.md` in the project and read the relevant entries. Follow a record that still matches the code, and update it where it no longer does. Ask only when the requirement, the implementation and the record all leave it open and the answer changes what the user sees, for example whether selected rows survive a page change.

Record only long-lived decisions with one line of reasoning. Create the file when it is missing, and update an entry in place when the decision changes.
