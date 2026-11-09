# Component design

## Responsibility and boundaries

- New components are function components, using Hooks when they need state or subscriptions. Existing class components keep their structure; migrating them is a separate piece of work.
- Components are organized around one cohesive UI responsibility or business flow; a component may hold several closely related pieces of state and sub-areas.
- Split by business responsibility, state ownership, reason to change and independent test or error-recovery boundaries, not by line count, JSX depth or the number of state values.
- Function length, nesting depth, the number of Props and the number of boolean Props are complexity warnings, not automatic refactor thresholds; this rule covers components only, while splitting ordinary and utility functions follows the project's language-level conventions.
- Independent UI becomes its own component; reusable stateful logic becomes a Hook; pure computation and formatting stay plain functions.
- A child component is declared outside the parent function. It may live in the same file when only that file uses it, and the project's conventions decide whether it gets a file of its own. Redefining a component inside its parent remounts that subtree and loses local state.

Inside a component, the usual order is local constants → state → derived values → Effects → event handlers → render. Adjust the order by dependency and keep code for one concern together.

## Props and controlled mode

When a search bar and a table share filter conditions, the page owns the condition and the search bar asks for changes. The table only receives the filtered rows. The example below filters locally.

```tsx
const [keyword, setKeyword] = useState("");
const visibleUsers = users.filter((user) => user.name.includes(keyword));

return (
  <>
    <UserSearch value={keyword} onChange={setKeyword} />
    <UserTable rows={visibleUsers} />
  </>
);
```

- Props express what the caller actually needs; event Props are named `onXxx` and internal handlers may use `handleXxx`. Prop names are camelCase, and PascalCase when the value is a component type, as in `Component={Row}`.
- Do not carry business meaning in DOM names such as `style` or `className`, for example passing a theme through `style="dark"`; use a semantic name instead. Passing `className` through when a component wraps a root element is normal and not part of this rule.
- A controlled component receives `value` / `checked` and a callback from the caller; an uncontrolled one uses `defaultValue` / `defaultChecked`. Avoid keeping mirror state in step with an external value.
- When combinations of Props can form contradictory states, consider a discriminated union, a composition API or splitting the component.
- Many Props do not by themselves mean a bad design; look first for duplicated responsibilities, configuration explosion and business coupling.

## Composition and reuse

- Reach for `children` or named composition for complex content instead of adding configuration Props indefinitely.
- Looking alike is not the same as meaning the same. Abstract stable behavior and rules, and do not move the differences into a pile of `variant` flags or booleans.
- Waiting for a third repetition before abstracting is not required; two places sharing a stable rule may already be worth extracting. The reverse holds too: repeated similarity does not mean the code should be merged.
- Wrapping a third-party component earns its place by unifying the API, isolating the vendor or adding business meaning, not by adding a layer for its own sake.

## Communication between components

- Parent-child communication passes Props down and raises callbacks up; a child never mutates an object its parent handed it.
- Siblings that share state look for a common owner first; Context or a store is considered only when deep consumers genuinely need the same data.
- Context mirrors real sharing, not a way to avoid passing Props through a few layers; where updates are frequent, watch how much of the tree subscribes and how narrowly.

## A check before splitting

Ask whether the responsibility stands alone, whether it has its own state, interaction or error recovery, whether it changes for its own reason, and whether splitting makes the caller clearer. If the answer is no, keep it simple for now.
