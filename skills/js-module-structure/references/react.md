# React

## Directory example

```text
userCard/
├── index.ts              # export { UserCard } from "./userCard";
│                         # export type { IUserCardProps } from "./userCard.type";
├── userCard.tsx          # component logic, exporting UserCard
├── userCard.config.ts    # size mapping and defaults
├── userCard.type.ts      # IUserCardProps and other public types
├── userCard.mock.ts      # makeUserCardProps(): IUserCardProps
├── userCard.module.css   # component-private styles
└── userCard.test.tsx     # render and interaction tests
```

A file like `hooks/useUserCard.ts` appears once the logic has a second consumer.

## Points that matter

- File names are lowerCamelCase and component identifiers UpperCamelCase: `userCard.tsx` writes `const UserCard = (props: IUserCardProps) => {...}` and ends with `export { UserCard }`. JSX writes `<UserCard />`, since a lowercase first letter reads as a native tag. When a framework or a lazy import requires a default export, that file changes to `export default UserCard`.
- Types live in `xx.type.ts` by default: props, state, API structures, enums, and constant value tables. Do not scatter `interface` and `type` through `xx.tsx`.
- Requests, subscriptions and timers go into `hooks/` or a sibling `useXx.ts`, leaving the component with rendering and event binding.
- Styles sit beside the component under the same name, with CSS Modules as `userCard.module.css`. A style token shared by several components belongs to a higher-level module, not inside a component directory.
- The factory in `.mock.ts` returns a complete set of props so tests and stories share it; do not bury business logic in it.
- Tests keep the repository's framework (vitest or jest) and testing-library, and assert what the user sees rather than internal state.
- A file reached by routing or lazy loading needs a default export, which is the exception to named exports: `lazy(() => import("./userCard"))` receives the default export. A directory that insists on named exports writes `lazy(() => import("./userCard").then((m) => ({ default: m.UserCard })))`, or lets the route point straight at `userCard.tsx`.

Do not create `hooks/` or `components/` ahead of time for a presentational component with a single consumer; they appear when a second one does.

## What goes in which file

One `userCard` module, with types, mapping, mock, logic and entry each in their own place:

```ts
// userCard.type.ts: interface, enum and as const tables all live here
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
// userCard.config.ts: size mapping and defaults, keeping constants out of the component
import type { UserCardSize } from "./userCard.type";

export const SIZE_CLASS: Record<UserCardSize, string> = {
  sm: "cardSm",
  md: "cardMd",
};

export const DEFAULT_SIZE: UserCardSize = "md";
```

```ts
// userCard.mock.ts: a factory returning complete props, shared by tests and stories
import type { IUserCardProps } from "./userCard.type";
import { EUserStatus } from "./userCard.type";

export const makeUserCardProps = (
  overrides: Partial<IUserCardProps> = {},
): IUserCardProps => ({
  name: "Ada Lovelace",
  status: EUserStatus.Active,
  size: "md",
  ...overrides,
});
```

```tsx
// userCard.tsx: rendering and interaction only
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
// index.ts: re-exports only, so nobody reaches inside the directory
export { UserCard } from "./userCard";
export type { IUserCardProps, UserCardSize } from "./userCard.type";
```

The component takes types from `userCard.type.ts` and mappings from `userCard.config.ts`; outside the module only `userCard/index.ts` is known, so moving the main logic leaves callers untouched.
