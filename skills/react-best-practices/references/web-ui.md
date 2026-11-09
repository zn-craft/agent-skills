# Browser-side web UI

**Scope:** browser DOM, interaction and accessibility. An SSR environment also reads [ssr-and-hydration.md](ssr-and-hydration.md).

## JSX and the DOM

- A component without children is self-closing, as in `<Icon />`. Use `<></>` to group siblings, and an explicit `<Fragment key={id}>` when the group needs a key.
- Lists use a stable, unique business `key`; an index suits only a static list whose order never changes and which is never reordered.
- Remember that `0 && <X />` renders the number `0`; write `count > 0 && <X />` when that matters.
- Early returns fit loading, failure and empty branches; place them after ordinary Hooks and return the matching UI. A simple either-or may be a ternary. Once branches start nesting, use early returns or a `switch` by condition, and a lookup table when picking a result by value.
- A simple event may be inline; complex, reused or separately tested logic gets a named handler.
- Reuse the project's existing UI and routing components first. With nothing suitable, choose a native HTML element by what the content and interaction actually mean.
- Avoid `dangerouslySetInnerHTML` without sanitizing; when HTML genuinely has to be rendered, establish its source and use a reviewed sanitizer.

## UI states

Render loading, success, empty, error and disabled as the requirement asks. An empty state is usually UI derived from a successful response, not another request state. Error messages are understandable to the user while internal stacks go to logs or monitoring. A retry action must actually retry.

## Accessible interaction

- Every interaction works from the keyboard and keeps a visible focus indicator; icon-only buttons carry an accessible name.
- Images set `alt` by meaning, and a purely decorative image uses `alt=""`.
- Field errors and hints are associated through something like `aria-describedby`.
- Focus follows the semantics of the component: a modal dialog usually moves focus in, traps it, and restores it on close; a menu keeps its own keyboard model; a non-modal popover or tooltip must not inherit a dialog's focus trap.
- When wrapping a component, keep its keyboard behavior, focus handling and accessible name. A hand-built complex interaction is checked against the matching pattern, dialogs and menus especially.

## Error boundaries

An error boundary isolates a rendering subtree. Use one only where a region can fail on its own and has a reasonable fallback or recovery. It does not catch ordinary event handlers or most async callback errors, and it does not replace request error handling.
