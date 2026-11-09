# React performance and everyday optimization

## Find what is slow first

Once the stutter reproduces, use the browser Performance panel to separate script, layout and paint cost, and the React Profiler to find the expensive subtree. While waiting on data, check the network panel; once a request is identified, see [client data and caching](client-data.md).

## Do less work unrelated to the current interaction

| Symptom | Check and adjust first |
|---|---|
| Typing or toggling a checkbox also updates a nearby list and chart | Put state in the component that needs it. A plain `useContext` read takes the whole Context, so destructuring fields still updates with the Provider value. Where that cost is real, split Context by responsibility and update frequency, or keep the project's existing selector subscription for the fields needed. |
| Editing one row turns every row in the table into a new object | An immutable update copies only the path that changed and keeps the references of untouched rows. When row rendering is still expensive and Props are usually equal, consider `memo`. |
| Input must respond immediately while the results area updates slowly | Cut computation or rendering in the results area first. When a slightly later result is acceptable, consider `useDeferredValue` and let the expensive subtree skip the update that uses the old value. Whether typing is debounced is a separate interaction decision. |
| Dragging or scrolling drops frames | Check whether the handler recomputes, sets state or measures layout on every event. When only the latest position per frame matters, coalesce by frame. When measuring and changing the DOM repeatedly, read in a batch first and write afterwards. |
| Data has arrived, but expanding or scrolling the list is still slow | Separate too many rows from one heavy row. Consider pagination when users can page through. When scrolling is continuous and DOM count is the bottleneck, evaluate a virtual list and verify keyboard focus, selection and editing drafts. |
| The first page load is slow and the editor or chart is rarely used | Confirm how much first-load script and initialization that module takes. Load it on demand the way the project already does, then measure the wait for opening it the first time. |

When a table edits one row, for example, keep the object references of the other rows. This assumes row ids are unique.

```tsx
setRows((rows) =>
  rows.map((row) => (row.id === editedId ? { ...row, name: nextName } : row)),
);
```

## State and resources

- Anything the interface must follow uses state or a subscribable source. A timer id, a request sequence number or a third-party instance that only has to survive re-renders within one mount uses `ref`, read and written in events or Effects.
- Subscriptions and timers needed only while a dialog is open are created and cleared with it. Before unloading a hidden panel, confirm whether the draft, scroll position or focus has to survive.
- An expensive initial value that depends only on the first mount may take a pure initializer function in `useState`. Values that depend on data still compute from their real dependencies.
- Before caching, confirm what is expensive and how often the input changes. With the Compiler enabled, confirm the file in question is actually compiled. Measure a hand-written comparison function against the renders it saves.

## Render-time cost

- Configuration unrelated to Props and state goes to module scope; formatting needed only for a click such as exporting stays in that flow instead of on the render path.
- When a render looks up or aggregates a list, check the data size and how often it runs first: small data is not worth restructuring, while large data or recomputation on every interaction calls for less work in render.

## Recording what the team learns

Write down the scenario, the change, the result and the conditions it holds under. Re-measure performance gains with the same data size and actions. General judgement stays on this page; business detail belongs in the matching case file.
