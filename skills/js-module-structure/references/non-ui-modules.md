# Modules without a UI: api, store, hooks, utils

This reference only decides where content lives. Request, state, async and test implementations follow project rules.

## File roles

| Content | Default location |
| --- | --- |
| Main logic | A `.ts` or `.js` file matching the module basename; api splits by resource, stores one per file, hooks and utils split by capability |
| Types, enums and `as const` value tables | `xx.type.ts`; a JS project uses JSDoc `@typedef` or its existing convention |
| Runtime fixed values, mappings and defaults | `xx.config.ts` / `xx.config.js` |
| Mock data and factories | `xx.mock.ts` / `xx.mock.js` |
| Tests | `xx.test.ts` / `xx.test.js` |
| Module entry | `index.ts` / `index.js`, re-exports only |

Create a file only when its content appears. Add an entry when the directory is imported from outside.

## api example

```ts
// userApi.type.ts
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
// userApi.config.ts
export const USER_API = {
  list: "/api/users",
};

export const DEFAULT_PAGE_SIZE = 20;
```

```ts
// userApi.mock.ts
import type { IUser } from "./userApi.type";

export const makeUser = (overrides: Partial<IUser> = {}): IUser => ({
  id: "u_1",
  name: "Ada Lovelace",
  ...overrides,
});
```

```ts
// userApi.ts
import { request } from "../http";
import { DEFAULT_PAGE_SIZE, USER_API } from "./userApi.config";
import type { IUserListResponse, IUserQuery } from "./userApi.type";

export const fetchUserList = (
  query: IUserQuery = {},
): Promise<IUserListResponse> => {
  const params = new URLSearchParams({
    page: String(query.page ?? 1),
    size: String(DEFAULT_PAGE_SIZE),
  });

  if (query.keyword) {
    params.set("keyword", query.keyword);
  }

  return request<IUserListResponse>(`${USER_API.list}?${params}`);
};
```

`request` represents the project's existing request adapter. Types, defaults and endpoint data are imported from their owning files.

## hooks example

```ts
// useDebounce.type.ts
export interface IUseDebounceOptions {
  delay?: number;
}
```

```ts
// useDebounce.config.ts
export const DEFAULT_DEBOUNCE_MS = 300;
```

```ts
// useDebounce.ts
import { useEffect, useState } from "react";

import { DEFAULT_DEBOUNCE_MS } from "./useDebounce.config";
import type { IUseDebounceOptions } from "./useDebounce.type";

export const useDebounce = <T,>(
  value: T,
  options: IUseDebounceOptions = {},
): T => {
  const { delay = DEFAULT_DEBOUNCE_MS } = options;
  const [debounced, setDebounced] = useState<T>(() => value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};
```

## Imports

- Inside a module, import the target file directly.
- Across modules, import the other module's `index.ts`.
- Keep implementation in the module that uses it. Move it into a shared directory only when another module needs it, using the project's existing shared-layer convention.

## Boundaries

- `xx.type.ts` may contain enums and `as const` value definitions, but does not execute initialization, registration, I/O or other side effects.
- `xx.config.ts` holds data and fixed runtime values, not executable logic.
- Request, state, async and test behavior follow project rules and are not prescribed here.