# Modules without a UI: api, store, hooks, utils

These modules render nothing, and their file roles match component modules exactly: main logic plus a `.type`, `.config`, `.mock` or `.test` file as needed.

## api module

Files split by resource, one resource per file.

```text
api/
├── index.ts
├── userApi.ts           # request functions
├── userApi.type.ts      # IUser, IUserQuery, IUserListResponse
├── userApi.config.ts    # USER_API path table, DEFAULT_PAGE_SIZE
├── userApi.mock.ts      # makeUser() for tests and local debugging
└── userApi.test.ts
```

- A request function sends the request and maps the data; business decisions belong to the caller. No state updates or route changes inside the api layer.
- Request bodies, response bodies and query parameters are typed in `xx.type.ts`, with the return type written out rather than left for callers to guess.
- Endpoint tables, error-code mappings and default page sizes go into `xx.config.ts`, or a module-level `api/endpoints.config.ts`.
- `xx.mock.ts` exports a factory rather than a bare object, its parameters cover the key branches, and tests and a mock server share the same one.
- Tests mock at the request adapter (msw and the like) instead of mocking your own request function, which would test nothing.

## store module

One store per file, named after the framework's convention (Pinia `useUserStore.ts`, Redux `userSlice.ts`, Zustand `useUserStore.ts`).

```text
store/
├── index.ts
├── useUserStore.ts
├── useUserStore.type.ts   # State, Action and the types the store exposes
└── useUserStore.mock.ts   # makeInitialUserState()
```

- State and action types go into `xx.type.ts`, including the shape the store returns to its consumers.
- The initial state comes from a factory in `xx.mock.ts`, so resetting the store and writing tests share one definition instead of two copies of the defaults.
- An async action calls the api module rather than writing `fetch` or `axios` inside the store: the request details only the api layer knows.
- Derived state uses the framework's own getter or selector instead of a manually synchronized copy cached in the store.
- Tests assert what an action does to state, with the request side covered by the api layer's mock.

## hooks / utils modules

One capability per file, and the file name is the capability.

```text
hooks/
├── index.ts
├── useDebounce.ts
├── useDebounce.type.ts
└── useDebounce.test.ts
```

- utils holds pure functions only and imports no business module; the moment it needs a store or a request it belongs in hooks or a store.
- In these modules `xx.config.ts` usually holds cache key prefixes, default debounce and throttle durations, and configurable thresholds.
- When the reuse case is unclear, keep it beside the caller and promote it to a shared directory once a second module needs it.

## Cross-module imports

- Inside a module: a relative path straight to the target file.
- Across modules: import the other module's `index.ts` instead of reaching into `other/impl/detail.ts`, or their directory reshuffle becomes yours.
- Something only one module uses stays in that module rather than moving into a shared directory early.

## What goes in each file

### api module: four files, four jobs

```ts
// userApi.type.ts: request and response shapes all live here
export interface IUser {
  id: string;
  name: string;
}

export interface IUserQuery {
  keyword?: string;
  page?: number;
}

export interface IUserListResponse {
  items: IUser[];
  total: number;
}
```

```ts
// userApi.config.ts: endpoints and the default page size in one place
export const USER_API = {
  list: "/api/users",
  detail: (id: string) => `/api/users/${id}`,
} as const;

export const DEFAULT_PAGE_SIZE = 20;
```

```ts
// userApi.ts: build the parameters, send the request, return typed data
import { DEFAULT_PAGE_SIZE, USER_API } from "./userApi.config";
import type { IUserListResponse, IUserQuery } from "./userApi.type";

export const fetchUserList = (
  query: IUserQuery = {},
): Promise<IUserListResponse> => {
  const params = new URLSearchParams({
    page: String(query.page ?? 1),
    size: String(DEFAULT_PAGE_SIZE),
  });
  return http.get<IUserListResponse>(`${USER_API.list}?${params}`);
};
```

```ts
// userApi.mock.ts: a factory whose parameters cover the key branches
import type { IUser } from "./userApi.type";

export const makeUser = (overrides: Partial<IUser> = {}): IUser => ({
  id: "u_1",
  name: "Ada Lovelace",
  ...overrides,
});
```

### hooks module: defaults come from config

```ts
// useDebounce.type.ts
export interface IUseDebounceOptions {
  delay?: number;
  leading?: boolean;
}
```

```ts
// useDebounce.config.ts
export const DEFAULT_DEBOUNCE_MS = 300;
```

```ts
// useDebounce.ts: one file, one capability
import { useEffect, useState } from "react";

import { DEFAULT_DEBOUNCE_MS } from "./useDebounce.config";
import type { IUseDebounceOptions } from "./useDebounce.type";

export const useDebounce = <T,>(value: T, options: IUseDebounceOptions = {}) => {
  const { delay = DEFAULT_DEBOUNCE_MS } = options;
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};
```

The main logic imports types and configuration and is never imported back by them; `xx.type.ts` holds no runtime code, and `xx.config.ts` holds no side effects.
