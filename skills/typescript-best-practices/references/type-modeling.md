# Type modeling

Covers how to declare a type, where it lives, how to express domain concepts, and how far abstraction should go. For narrowing boundary data see [type-safety.md](type-safety.md); for naming and imports see [naming-and-declaration.md](naming-and-declaration.md).

## Declaration and location

- Object shapes use `interface`; unions, intersections, mapped and conditional types use `type`, and one kind of shape never mixes the two. Prefixes and naming detail live in [naming-and-declaration.md](naming-and-declaration.md).
- An optional property is written `prop?: T`, not `prop: T | undefined`, unless "not passed" and "passed undefined" have to differ.
- `Function`, `Object` and `{}` are not types; write the signature: `(...args: unknown[]) => void`, `Record<string, unknown>`.
- Exported functions state their return type and internal ones rely on inference; a return type is the module's outward contract and cannot be left to implementation detail.
- A union never mixes in `string` as a catch-all: `"pending" | "done" | string` constrains nothing.
- Types and value definitions belonging to this module go into the project's type file (`type.ts`, `xxx.type.ts`): `interface`, `type` aliases, `enum`, `as const` value tables and shared constants all live there. A project that puts types elsewhere keeps its own layout.
- Anything with an implementation stays in the implementation file: functions, classes, components and side-effecting code do not go into type files. When a type file holds values such as `enum` or `as const`, consumers of those values use a plain `import`, and only pure type consumers use `import type`.
- Ambient declarations go into `xxx.d.ts`: `declare module`, `declare global`, `declare const`, plus types missing from a third-party library (check `@types/xxx` first, and fill in only the parts actually used). A `.d.ts` never carries runtime logic.
- Within a type file, group declarations in this order and put a one-line comment above each group:

```text
1. External types: third-party types being extended or reused
2. Primitives: ids and shared entities
3. Business entities: this module's data structures
4. Requests and responses: input, output, API returns
5. Value definitions: enums, as const tables and the unions derived from them
6. Functions and components: parameters and return shapes
7. Utility types: generics, mapped and conditional types
```

- Inside a group, order by dependency with the depended-on type first to avoid circular references; export with `export type` / `export interface`, never `export *`.
- Types shared across modules live in the project's shared type directory instead of being redefined per module.

## Choosing a value set

| Situation | What to use |
| --- | --- |
| The value only exists in the type system and never needs runtime iteration | a string union |
| Runtime code needs every value: rendering a select, validating, building query parameters, creating a map | an `as const` object plus a union derived with `typeof` |
| Runtime code looks a value up by name, or members need grouping, comments, or to be part of a public SDK | a string enum with the `E` prefix |
| Purely numeric constants | an `as const` array or object, not an enum |

```ts
export const ORDER_STATUS = {
  Pending: "pending",
  Shipped: "shipped",
  Done: "done",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
```

- One value set has exactly one definition: when a union written first later needs runtime iteration, convert it into an `as const` object with a `typeof`-derived union rather than keeping both.
- No numeric enums: they add reverse mapping noise, and `0` reads as falsy.
- A long member list is not a reason to switch to an enum; what decides is whether runtime code needs the values.
- A project already using enums keeps using them; do not convert to `as const` for being more modern.

## Expressing domain concepts in types

- When one business concept is a bare `string` everywhere, distinguish it with a branded type: `type UserId = string & { readonly __brand: "UserId" }` stops an order number being passed as a user id at compile time. `__brand` is only a type marker, produces no runtime member, and has nothing to do with member naming.
- Brand only the fields that have actually been mixed up; wrapping every string adds noise and nothing else.
- State transitions and workflow steps are expressed as unions so a forbidden transition cannot be written.
- Verified and unverified data are separate types: `unknown` goes in, a concrete type comes out, and a validation function sits between them.
- Runtime validity (enum values, required fields, formats) cannot rest on types alone. Validate API responses and user input once with a schema or a predicate and derive the type from that result instead of hand-writing a second copy.
- A constraint that exists only in a comment does not exist; anything a type can express is not written as a comment.

## Where generics and abstraction earn their place

- Generics require the same logic to serve several types while preserving the relationship between them. A single call site, or a generic that only saves writing one concrete type name, means writing the concrete type instead.
- Generic parameters get meaningful names: `TKey` and `TValue` rather than a queue of `T`, `U`, `V`. Constraints go in `extends` and describe only what the caller genuinely relies on; a default goes in `= T`.
- Generics nest no deeper than two levels: `Promise<Array<Map<string, IUserInfo>>>` gets extracted into an alias with a comment.
- An intersection of more than three types is split into semantic pieces or turned into `interface extends`.
- Index chains are not written as one run: past two segments, `keyof typeof X[number]["field"]` gets an intermediate named type.
- Business code carries no advanced types: conditional types, `infer`, mapped types and recursive types appear only in utility type files.
- When a built-in utility type expresses it, do not hand-write it: use `Partial`, `Pick`, `Omit`, `Record`, `ReturnType` and `Parameters` directly, since a hand-written equivalent mapped type only adds a second place to maintain.
- Utility types perform real type transformations, they do not paper over a source design: reaching for `Partial<T>` because optionality was never decided, or peeling fields one by one with `Omit`, means the source type should change. A derivation chain deeper than two levels gets a named intermediate type with meaning.
- A single-line type past about 100 characters, or a declaration past five lines, is split or commented.
- `Type instantiation is excessively deep` or a slowing editor means the types are too complicated: simplify the shape instead of suppressing it with `@ts-expect-error`.

A genuinely complex type carries a comment covering three things: what the type represents, why a simpler form does not work, and what to watch out for when changing it.

```ts
// Strips the shared envelope off an API response, leaving the business fields.
// The backend publishes no separate type and the response shape moves with API
// versions, so a conditional type is the only way; keep this in step when the
// envelope changes.
type UnwrapResponse<T> = T extends { data: infer D } ? D : T;
```
