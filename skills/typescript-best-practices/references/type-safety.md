# Type safety

Covers how external data comes in, how `any` and assertions are left behind, and how errors are expressed in types. For how types are declared see [type-modeling.md](type-modeling.md), while naming and import rules live in [naming-and-declaration.md](naming-and-declaration.md).

## Prohibitions

- No `any`. When unsure, use `unknown` and narrow before use; API responses, `JSON.parse` results and caught errors all start as `unknown`.
- No casual non-null assertion `!`: check for null or supply a default with `??`.
- No `@ts-ignore`. Use `@ts-expect-error` when one is needed, since it reports itself once the type is fixed, which is the reminder to delete it.
- No `unknown as T` double assertion to get past the compiler: like `any`, it lies to the compiler and is harder to spot.
- An `as` assertion is only for the case where you genuinely know more than the type system, and it carries one line of reasoning beside it.

## Getting off legacy `any`

A legacy project has `any` in patches, and clearing it in one pass is not realistic: leave what sits outside this change alone and narrow one place at a time. The narrowing order, how to split the diff and a full worked case are in [legacy-any.md](patterns/legacy-any.md).

## Narrowing from unknown

- External data is declared `unknown` first, then narrowed with `typeof` / `in` / `Array.isArray` / a custom type guard.
- A check reused across functions becomes a type guard instead of an `as`:

```ts
const isUserInfo = (value: unknown): value is IUserInfo =>
  typeof value === "object" && value !== null && "id" in value;
```

- When a failed check should throw and the rest of the function should treat the value as narrowed, write an assertion function: `assertUserInfo(value: unknown): asserts value is IUserInfo`.
- To check a shape while keeping literal types, use `satisfies`: `const config = { ... } satisfies IXxxConfig` reports a wrong field and does not widen the type.
- Check arrays and objects for emptiness before use: `if (items == null || items.length === 0) return;` instead of `items!`.
- With `noUncheckedIndexedAccess`, an index access may yield `undefined`; check before destructuring.

## Fallback branches

The fallback branch of a `switch` / `if-else` uses `never`, so adding a member fails the build:

```ts
default: {
  const exhaustive: never = status;
  throw new Error(`unhandled status: ${exhaustive}`);
}
```

A fallback branch that only `break`s or does nothing lets a new member slide silently into the wrong branch; branches over an enum take the same `never` fallback.

## Error handling

- Errors are legible in the type system: what throws, whether the caller has to handle it, and whether the kind of failure can be told apart. Recoverable and unrecoverable failures use different error types or return values.
- A `catch` parameter is handled as `unknown`, never `catch (e: any)`; a `catch` block at least logs or rethrows, and is never empty.
- Expected business failures come back as a return value the caller cannot ignore:

```ts
type Result<T> = { ok: true; value: T } | { ok: false; error: string };
```

- `Result` is used only where the project already works that way; do not invent a second error model that fights the existing one. A repository keeps one shape for failed returns, and the language layer does not add another.
- Async failures use `await` with `try/catch`, or let the promise reject upward; encoding a failure into a return value and then forgetting to check it is not an option.
- A thrown error carries locating information, such as which step and which input, and no unrelated internal detail.

## Async and promises

- An `async` function returns `Promise<T>` where `T` is the success value, never `Promise<any>`.
- `await` yields the success value and throws on failure; it is not `T | undefined`, so do not stack another `?.` on the result.
- An operation that can fail and that the caller must branch on returns `Promise<Result<T>>` and the caller has to check it; everything else propagates through exceptions.
- Parallel requests use `Promise.all`, whose result is a fixed-length tuple; keep the tuple when reading by position rather than asserting it back into an array.
- A callback returning `void` is only for cases that genuinely ignore the result; an async callback has to catch rejections rather than leaving an unhandled promise.

```ts
const loadProfile = async (id: string): Promise<IProfile> => {
  const [user, orders] = await Promise.all([fetchUser(id), fetchOrders(id)]);
  return { user, orders };
};
```
