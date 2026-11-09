# Case: search and filtering

Applies to text search, combined filters, search-as-you-type and search-on-submit.

## Establish what triggers a search

- **Search as you type**: the debounced input becomes the query parameter, and the cache key must include every condition that affects the result.
- **Search on submit**: keep the draft condition being edited apart from the applied condition, and let only the submit action update the query.
- **Local filtering**: with data already fully loaded at a reasonable size, the filtered result can be derived during render.
- **Server filtering**: when volume, permissions or search semantics require the backend, hand the parameters to the request or query layer.

## Recommended state model

```tsx
const [keyword, setKeyword] = useState("");
const debouncedKeyword = useDebouncedValue(keyword, 300);

const query = useQuery({
  queryKey: ["items", { keyword: debouncedKeyword }],
  queryFn: ({ signal }) => getItems({ keyword: debouncedKeyword }, { signal }),
});
```

This is a TanStack Query style example and assumes `getItems` forwards `signal` to the underlying `fetch`. Another data layer keeps its own cache keys and request semantics. `useDebouncedValue` only debounces; caching, cancellation and race handling are not its job.

## Boundaries that matter

1. The query key holds every parameter that affects the server result, so different filters never share a cache entry by mistake.
2. An older request must not overwrite a newer result; rely on the query layer's cancellation or stale-request handling first.
3. Clearing conditions, submitting conditions and changing the page make it explicit whether pagination resets.
4. When a filter and the page number change together, both are updated in one event handler or reducer.
5. If conditions must be shareable or survive a reload, evaluate URL search params, and avoid storing the same thing in both the URL and component state.
6. Handle input-method composition, whitespace, letter case and the server's search rules without changing the business meaning on your own.

## Common mistakes

- Requesting on every keystroke with no debounce and no stale-request handling.
- Submitting a search and then letting another Effect request from the old state.
- Keeping query conditions, request results and selection in one object.
- Putting only the keyword in the query key and leaving out other filters that change the result.
- Reaching for `useMemo` to filter a small array.

Debounce and submit timing follow the interaction requirement, while caching and requests follow the data layer already in the project.
