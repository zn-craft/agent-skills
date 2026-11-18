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

When requests, subscriptions, timers or reusable logic go into their own file, use a sibling `useXx.ts` or `hooks/useXx.ts`. Whether to extract the file follows the project rules.

## Points that matter

- File names are lowerCamelCase and component identifiers UpperCamelCase. When a framework or lazy import requires a default export, use it on the entry that needs it.
- Types live in `xx.type.ts` by default: props, state, API structures, enums and `as const` value tables. Do not scatter named type declarations through `xx.tsx`.
- A Hook that is already in its own file uses the `useXx.ts` name and lives beside the module or under `hooks/`.
- Styles sit beside the component under the same name, with CSS Modules as `userCard.module.css`. A style token shared by several components belongs to a higher-level module.
- Put mock data and factories in `xx.mock.ts`; put tests in `xx.test.tsx` and follow the project's testing convention.
- A file reached by routing or lazy loading needs a default export, which is the exception to named exports: `lazy(() => import("./userCard"))` receives the default export. A directory that insists on named exports writes `lazy(() => import("./userCard").then((m) => ({ default: m.UserCard })))`, or lets the route point straight at `userCard.tsx`.

Do not create `hooks/` or `components/` ahead of time for a presentational component with a single consumer.

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
// userCard.config.ts: runtime size mapping and defaults
import type { UserCardSize } from "./userCard.type";

export const SIZE_CLASS: Record<UserCardSize, string> = {
  sm: "cardSm",
  md: "cardMd",
};

export const DEFAULT_SIZE: UserCardSize = "md";
```

```ts
// userCard.mock.ts: mock props for tests and stories
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
// userCard.tsx: component main logic
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

The component takes type and value definitions from `userCard.type.ts` and runtime mappings from `userCard.config.ts`; outside the module only `userCard/index.ts` is known.
