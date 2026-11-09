# Custom Hooks

## Call rules

- Custom Hooks start with `use` followed by a capital letter, such as `useSelection`.
- Ordinary Hooks are called at the top level of a function component or another custom Hook, ahead of any branch that may return early.
- The call order stays the same on every render; never disable the Hooks lint rule with a comment to get around a problem.
- React's `use` API has its own rules; do not apply every restriction of ordinary Hooks to it by reflex.

When a hidden panel must keep its draft, put the early return after `useState`. The example assumes the caller only toggles `visible` and the component stays mounted.

```tsx
const EditPanel = ({ visible }: { visible: boolean }) => {
  const [draft, setDraft] = useState("");
  if (!visible) return null;
  return <input aria-label="Draft" value={draft} onChange={(e) => setDraft(e.currentTarget.value)} />;
};

export { EditPanel };
```

## When to extract one

- Extract when the logic has its own domain meaning, state lifecycle, external subscription or side effect, or a clear reuse case.
- Pure computation stays a plain function and repeated UI stays a component; do not create a Hook only to shorten a file or wrap `useState`.
- Each Hook call owns its own state; calling the same Hook twice does not share anything.

## Parameters and return value

- Prefer a named options object when there are several parameters or optional configuration; positional arguments are fine for a few obvious ones.
- A single value and its setter may return a tuple; several values and actions usually return a named object.
- One Hook keeps the same return shape across loading, success and failure, for example always returning `{ status, data, error }` and expressing the difference in the field values.
- Hooks return data and actions, not JSX.
- A return object rebuilt on every render is not a problem by itself; consider caching only when reference stability has a measurable effect.
- `useMemo` and `useCallback` are optimization tools, not a way to establish correctness or a stable identity for business logic.

## Browser and SSR

With SSR or SSG, reading browser state follows [ssr-and-hydration.md](ssr-and-hydration.md). Never assume `window`, `navigator` or `localStorage` exists during Hook initialization or rendering.
