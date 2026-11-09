# Type naming and declaration

Covers TS type naming, type imports and exports, class member modifiers, and function parameter style. For how to declare a type see [type-modeling.md](type-modeling.md); for narrowing boundary data see [type-safety.md](type-safety.md).

## Naming

| Thing | Convention | Examples |
| --- | --- | --- |
| Interfaces and object contracts | `I` + UpperCamelCase | `IUserInfo`, `IRequestOptions`, `IUserCardProps` |
| Enums | `E` + UpperCamelCase | `EOrderStatus` |
| Enum members | UpperCamelCase | `EOrderStatus.Pending` |
| Type aliases and classes | UpperCamelCase | `UserInfoMap`, `UserService` |

- The prefix is only about object contracts: interfaces and component Props take `I`, enums take `E`. Unions, intersections, utility types, key types derived with `keyof` and classes take none.
- Generated code is exempt: interfaces produced by a code generator and entities derived by an ORM keep their original names, and renaming them gets overwritten on the next run.
- Foreign types are not renamed for the sake of consistency: modules written by others, third-party types and types carried over from another repository keep their names.
- When an `as const` object replaces an enum, the object name is SCREAMING_SNAKE_CASE (`ORDER_STATUS`) and members are UpperCamelCase. A project with `erasableSyntaxOnly` cannot use `enum` at all, so value sets always take this shape.
- Member privacy uses `private`, never a `_` prefix; only an unused parameter takes the `_` prefix.

## Type imports and exports

- An import used only as a type is written `import type`, so the statement is erased at compile time and the module never enters the runtime dependency graph.
- Split into two statements only when both a type and a value are needed, so a runtime module is not dragged in by a type:

```ts
import type { IUserInfo } from "./user.type";
import { fetchUserInfo } from "./user.api";

export type { IUserInfo };
```

- With `verbatimModuleSyntax` this is mandatory: a type import without `type` is a compile error, and re-exporting works the same way.
- Re-export symbols that only serve as types with `export type`.
- Type files depend in one direction only; leave no unused imports and create no cycles.
- Global augmentation (`declare global`, module augmentation) is only for genuinely changing a third-party type, and states its reason next to the declaration.

## Classes and member modifiers

- Every method takes an access modifier instead of relying on the implicit `public`: `private` for what only this class uses, `protected` for subclasses, `public` only for the outward API. A member meant for subclasses is declared `protected`, never `private` with a workaround.
- A property that does not change after initialization takes `readonly`; one that does not depend on instance state takes `static`.
- An override keeps the parent signature; with `noImplicitOverride`, overriding methods take `override`.
- Abstract members are declared `abstract`, and the parent confirms a subclass will implement one before calling it.

## Functions

- Parameters that are not mutated take `readonly`: `sum(items: readonly number[])`, so a caller passing an `as const` array is not rejected; an object parameter takes `Readonly<T>`.
- Overloads only cover the signatures callers actually use; when a union or a generic expresses the same thing, skip the overload, and never expose the implementation signature.
