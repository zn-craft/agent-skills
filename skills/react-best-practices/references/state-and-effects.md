# State and Effects

## Ownership and shape

- Local interaction state (expanded, active tab, temporary input) is `useState` / `useReducer` inside the component.
- Siblings that share it lift it to the nearest common owner; Context or a store comes in only when a deep subtree genuinely shares it.
- Filters, pagination and the identifier of a detail view, which are shareable and restored after a reload, are worth evaluating as URL state.
- Server data is handled by the framework's data mechanism or a request cache, not copied into a client store without reason.
- State lives in the smallest scope that satisfies every consumer; many readers do not by themselves make it global.
- A list selection usually stores stable ids and derives objects from the current list, while an editing draft states its snapshot semantics explicitly.
- Mutually exclusive flows may use a discriminated state such as `idle | loading | success | error` instead of illegal boolean combinations.
- Merge into one object or reach for `useReducer` only when fields share an invariant and change atomically; independent state does not need merging just to have fewer setters.
- Do not mirror Props into state unconditionally; a draft, an initial-value snapshot or deliberately uncontrolled behavior says so out loud.

## Immutable updates

- Updating an object or an array creates a new value. Mutating the existing one changes data other code is reading.
- When the new value depends on the previous state, use the functional form: `setCount((n) => n + 1)`.

## Deciding on an Effect

Before reaching for an Effect, ask: **does this need React to stay in sync with an external system?**

Effects fit event subscriptions, timers, WebSockets, browser APIs, third-party instances and external DOM systems.

They usually do not fit derived data, formatting, a submit triggered by a click, a request caused directly by a user action, or keeping two React states in step with each other.

Filtered results, for example, depend only on `users` and `keyword`, so the extra state and the Effect that syncs it can go:

```tsx
// Before: render stale results first, then let an Effect update them.
const [visibleUsers, setVisibleUsers] = useState<User[]>([]);
useEffect(() => {
  setVisibleUsers(users.filter((user) => user.name.includes(keyword)));
}, [users, keyword]);
```

```tsx
// After: this render computes the result from the current input.
const visibleUsers = users.filter((user) => user.name.includes(keyword));
```

- An Effect declares every reactive dependency it reads. When the dependencies do not behave, change what the Effect reads before changing the array.
- A long-lived resource or subscription needs symmetric cleanup; a one-off sync such as setting `document.title` does not need an empty cleanup function.
- Setup and cleanup come in pairs, and Strict Mode's extra setup → cleanup → setup sequence must be survivable in development.
- Subscribing to an external store is a case for `useSyncExternalStore` first.
- Do not read or write `ref.current` during render to drive the UI.

## Advanced boundaries

- When changing Props should reset a whole subtree, prefer a stable `key` that carries meaning.
- Updating this component's own state during render is a rare advanced pattern; use a derived value, an event handler or a `key` when one of them works.
- `useEffectEvent` (React 19.2+) is only for non-reactive logic triggered by an Effect; it cannot be called from an ordinary event handler, passed to a child, or used to hide a real dependency.
