# Client requests and caching

Applies to browser-side requests and remote caching. Server loading follows the project's SSR or RSC mechanism.

## Requests and caching

- A project with a query layer (TanStack Query, SWR, RTK Query) or a framework loading mechanism lets it own query state, caching, retries and invalidation. Request functions keep using the project's existing HTTP client and wrappers.
- A project with only an Axios instance, a `fetch` wrapper or another HTTP client reuses its existing authentication, error handling and cancellation conventions. Establish which capabilities the wrapper provides before adding the state a component needs.
- Server data and local UI state stay apart, and the caching and invalidation of remote data belongs to the query layer.
- What triggers a request follows user meaning: search-as-you-type is driven by the query parameter, a search button submits the applied condition, and a change caused by a user action comes from an event or a mutation.
- Do not put every piece of async logic into an Effect. An Effect-driven request is for the case where a component genuinely subscribes to it or a reactive parameter drives it, and the project has no suitable data layer.
- Tell initial loading, background refresh, error and a successful empty result apart; an empty array is not a failed request.

## When a component manages its own request

- On parameter changes or unmount, cancel the request the way the client supports, or mark the old result as stale. Axios accepts `signal` in supported versions, and a wrapper call should be checked to pass it through.
- Failures follow the error conventions of the request layer. Reading `response.ok` is required when using native `fetch`, since HTTP 4xx and 5xx do not reject on their own.
- A cancelled request is usually not an ordinary error; exceptions in events and async callbacks still need a UI, log or monitoring path.
- When the request layer already handles cancellation, errors and caching, a component does not implement them a second time.

When a changing keyword drives the request and no query layer manages the race, the pattern below keeps an older result from overwriting a newer one. Here `searchUsers` uses the project's client, receives and forwards `signal`, and reports errors the way the project does.

```tsx
useEffect(() => {
  const controller = new AbortController();
  const { signal } = controller;

  searchUsers(keyword, signal).then(
    (users) => {
      if (!signal.aborted) setResult({ status: "success", users });
    },
    (error: unknown) => {
      if (!signal.aborted) setResult({ status: "error", error });
    },
  );

  return () => controller.abort();
}, [keyword]);
```
