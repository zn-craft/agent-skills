# 不带界面的模块：api、store、hooks、utils

这里只判断内容落在哪个文件。请求、状态、异步和测试的实现方式沿用项目规则。

## 文件分工

| 内容 | 默认位置 |
| --- | --- |
| 主逻辑 | 与模块基名一致的 `.ts` / `.js`；api 按资源切文件，store 按 store 切文件，hooks / utils 按能力切文件 |
| 类型、枚举、`as const` 取值表 | `xx.type.ts`；JS 项目使用 JSDoc `@typedef` 或仓库已有约定 |
| 运行期固定值、映射、默认值 | `xx.config.ts` / `xx.config.js` |
| mock 数据及生成函数 | `xx.mock.ts` / `xx.mock.js` |
| 测试 | `xx.test.ts` / `xx.test.js` |
| 模块入口 | `index.ts` / `index.js`，只做 re-export |

文件只在出现对应内容时创建；目录被外部引用时才补入口。

## api 示例

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
  name: "张三",
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

`request` 代表项目已有的请求适配器。类型、默认值和接口地址分别从各自文件读取。

## hooks 示例

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

## 引用

- 同模块内部直接引用目标文件。
- 跨模块只引用对方的 `index.ts`。
- 实现放在使用它的模块里；只有需要供其他模块使用时才放入共享目录，共享层级沿用项目结构。

## 边界

- `xx.type.ts` 可以包含枚举和 `as const` 取值定义，但不执行初始化、注册、IO 等副作用。
- `xx.config.ts` 只放数据与运行期固定值，不承载执行逻辑。
- 请求、状态、异步和测试行为按项目规则，不在本文件里另行规定。
