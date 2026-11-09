# Case: modeling state transitions

Applies to orders, tickets, approvals and payments — business objects with a fixed set of states and rules about which transitions are allowed. With only two or three stable states and no transition restrictions, a union type is enough and no transition table is needed.

| Decision point | Approach | Criterion |
| --- | --- | --- |
| State values | A string union, not a bare `string` | Move to an `as const` object once runtime code iterates every value |
| Transition rules | One `Record<Status, readonly Status[]>` table | Checks scattered across `if`s miss a spot every time one changes |
| Illegal transitions | Unwritable in the type system, caught at runtime as a backstop | Both the frontend and the backend block it |
| State versus history | The current state is a single value, the history an append-only array | Never fold them into one mutable object |

## Case

```ts
export type OrderStatus = "created" | "paid" | "shipped" | "done" | "canceled";

const ALLOWED: Record<OrderStatus, readonly OrderStatus[]> = {
  created: ["paid", "canceled"],
  paid: ["shipped", "canceled"],
  shipped: ["done"],
  done: [],
  canceled: [],
};

export const moveOrder = (from: OrderStatus, to: OrderStatus): OrderStatus => {
  if (!ALLOWED[from].includes(to)) throw new Error(`illegal transition: ${from} -> ${to}`);
  return to;
};
```

## Acceptance

1. Adding `"refunded"` to `OrderStatus` immediately reports `ALLOWED` as missing a key.
2. Moving from `done` to `paid` throws, so the interface cannot land on an illegal state.
3. The `switch` that renders the state uses a `never` fallback in `default` (see type-safety.md), so adding a state fails the build and forces the branch to be filled in.

## Common mistakes

- A bare `string` or a number for the state, which accepts any value and makes logs unreadable.
- Boolean flags assembled into a state (`isPaid`, `isShipped`), which combine into contradictory values.

Decisions to confirm with the user: whether a terminal state can still change, whether cancellation is allowed from every state or only some, and whether the frontend or the backend drives the state.
