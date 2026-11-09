# Case: narrowing `any` in a legacy module

Applies to a module already in production with `any`, `as` and `@ts-ignore` scattered through it, where the tightening has to happen without disturbing other work.

## Set the boundaries first

1. **One scope at a time**: a single file or a single call chain, so `git diff` shows the types and the narrowing code they need and nothing else — no algorithm or structure changes, no opportunistic renames or directory moves.
2. **Exported signatures first**: the moment a caller is typed concretely, passing a wrong value fails immediately and hidden `any` surfaces. The data boundary comes next (API responses, `JSON.parse`, event arguments), and internal functions and component locals last.
3. **Guard the boundary**: a predicate function returns `value is IXxx`; `any` outside the current scope stays as it is, and newly written lines contain no `any`, no `!`, no `@ts-ignore`.

## Case

Before narrowing:

```ts
export const sumAmounts = (data: any) => {
  const items = data.items as any[];
  return items.map((item) => item.amount).reduce((a, b) => a + b, 0);
};
```

After narrowing, only the types and the narrowing code change; the summation is untouched:

```ts
interface IReportRow {
  amount: number;
}

const isReportRow = (value: unknown): value is IReportRow =>
  typeof value === "object" && value !== null && "amount" in value;

export const sumAmounts = (data: unknown): number => {
  const raw = (data as { items?: unknown }).items;
  if (!Array.isArray(raw) || !raw.every(isReportRow)) throw new Error("invalid report payload");
  return raw.reduce((total, row) => total + row.amount, 0);
};
```

### Acceptance

1. `sumAmounts({ items: [{ amount: 1 }] })` passes and `sumAmounts({ items: [{}] })` throws.
2. `git diff` after the change shows types and narrowing code only; the summation line is untouched.
3. The file has fewer `any` than before and no new `@ts-ignore` or `!`.

## Common mistakes

- Replacing every `any` in a directory in one go, producing a diff of hundreds of lines that nobody can review.
- Swapping `any` for `unknown` and stopping there, so the callers light up with errors and the change is reverted.
- Pretending to narrow with `as IXxx`, which still blows up at runtime.
- Refactoring, renaming or moving files along the way, mixing a type change into a structural change.

Decisions to confirm with the user: whether this module is about to be reworked, whether newly reported errors should fail the build or stay compatible, and whether tests exist that would catch a behavior change introduced by narrowing.

## Where this stops applying

One-off scripts and modules about to be deleted do not need narrowing. Confirm basic type checking is in place (`tsc --noEmit` or an equivalent pipeline) before starting, or nobody can verify the result.
