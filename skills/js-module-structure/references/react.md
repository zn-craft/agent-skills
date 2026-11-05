# React

## 目录示例

```text
userCard/
├── index.ts              # export { UserCard } from "./userCard";
│                         # export type { IUserCardProps } from "./userCard.type";
├── userCard.tsx          # 组件主逻辑，导出 UserCard
├── userCard.config.ts    # 尺寸映射与默认值
├── userCard.type.ts      # IUserCardProps 等对外类型
├── userCard.mock.ts      # makeUserCardProps(): IUserCardProps
├── userCard.module.css   # 组件私有样式
└── userCard.test.tsx     # 渲染与交互测试
```

`hooks/useUserCard.ts` 这类文件，等逻辑要给别的模块复用时再拆。

## 要点

- 文件名小驼峰，组件标识符用大驼峰：`userCard.tsx` 里默认写 `const UserCard = (props: IUserCardProps) => {...}`，文件末尾 `export { UserCard }`；JSX 里写 `<UserCard />`，小写开头会被当成原生标签。被框架或懒加载要求默认导出时，这个文件改成 `export default UserCard`。
- 类型默认都写进 `xx.type.ts`：props、state、接口数据结构、枚举、常量取值表。不要把 `interface` / `type` 散落在 `xx.tsx` 里。
- 请求、订阅、定时器放 `hooks/` 或同级 `useXx.ts`，组件只负责渲染和事件绑定。
- 样式与组件同级同名，CSS Modules 用 `userCard.module.css`。多个组件共用的样式令牌放上层模块，不要放组件目录里。
- `.mock.ts` 导出的工厂函数返回一份完整的 props，方便测试和 story 复用；不要在里面写死业务逻辑。
- 测试沿用仓库既有框架（vitest / jest）+ testing-library，优先断言用户可见行为，不要断言内部 state。
- 路由 / 懒加载指向的文件要默认导出，这是具名导出的例外：`lazy(() => import("./userCard"))` 拿到的是默认导出。目录坚持具名导出时，用 `lazy(() => import("./userCard").then((m) => ({ default: m.UserCard })))`，或者让路由直接指向 `userCard.tsx`。

只有一个消费者的展示型组件不要提前建 `hooks/`、`components/`，等第二个使用者出现再抽。

## 文件内容对照

同一个 `userCard` 模块，类型、映射、mock、主逻辑、入口各写一处：

```ts
// userCard.type.ts：interface、enum、as const 取值表都放这里
export interface IUserCardProps {
  name: string;
  status: EUserStatus;
  size?: UserCardSize;
}

export enum EUserStatus {
  Active = "active",
  Disabled = "disabled",
}

export const USER_CARD_SIZE = ["sm", "md"] as const;
export type UserCardSize = (typeof USER_CARD_SIZE)[number];
```

```ts
// userCard.config.ts：尺寸映射与默认值，常量不进组件文件
import type { UserCardSize } from "./userCard.type";

export const SIZE_CLASS: Record<UserCardSize, string> = {
  sm: "cardSm",
  md: "cardMd",
};

export const DEFAULT_SIZE: UserCardSize = "md";
```

```ts
// userCard.mock.ts：工厂函数返回完整 props，测试与 story 复用
import type { IUserCardProps } from "./userCard.type";
import { EUserStatus } from "./userCard.type";

export const makeUserCardProps = (
  overrides: Partial<IUserCardProps> = {},
): IUserCardProps => ({
  name: "张三",
  status: EUserStatus.Active,
  size: "md",
  ...overrides,
});
```

```tsx
// userCard.tsx：只处理渲染与交互
import { DEFAULT_SIZE, SIZE_CLASS } from "./userCard.config";
import type { IUserCardProps } from "./userCard.type";

const UserCard = ({ name, status, size = DEFAULT_SIZE }: IUserCardProps) => (
  <article className={`card ${SIZE_CLASS[size]}`} data-status={status}>
    <h3 className="cardName">{name}</h3>
  </article>
);

export { UserCard };
```

```ts
// index.ts：只做 re-export，外部不深挖进目录
export { UserCard } from "./userCard";
export type { IUserCardProps, UserCardSize } from "./userCard.type";
```

组件只从 `userCard.type.ts` 拿类型、从 `userCard.config.ts` 拿映射；模块外只认 `userCard/index.ts`，主逻辑换文件不影响调用方。
