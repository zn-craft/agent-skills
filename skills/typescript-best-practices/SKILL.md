---
name: typescript-best-practices
description: TypeScript type modeling. Use when writing, changing, reviewing or refactoring TS code. Covers declaring types, narrowing boundary data from unknown, retiring any and assertions, expressing errors and domain concepts in types, choosing strictness, and typing Props / events / refs and generic components in .tsx. Does not cover JS style, module layout, JSX rendering, tsconfig or lint config.
---

# TypeScript best practices

Every rule here rests on a criterion: when it applies, what signal says the code went wrong, and how to fix it. Before writing, read the project as it stands — `tsconfig` strictness, naming style, how `interface` and `type` are used, the type directory and path aliases. When the project already has a convention, follow it; this skill only fills the gaps.

## How to write

- Object shapes use `interface`; unions, intersections, mapped and conditional types use `type`. Object contracts, including ones derived from a schema, take the `I` prefix, `enum` takes `E`, and unions, utility types and key types take no prefix.
- External data starts as `unknown` and narrows through a type guard; no `any`, no `!`, no `@ts-ignore`.
- Exported functions state their return type. Types and value definitions belonging to this module (`interface`, `type`, `enum`, `as const` value tables) go into `xxx.type.ts` by default, and do not need two call sites before they earn their own file. `declare` and third-party augmentations go into `xxx.d.ts`; functions and classes stay in the implementation file.
- Adding types does not move business logic and does not add dependencies. When the project has no `strict`, keep to strict style in the files this change touches.
- In a `.tsx` file, only types are in scope: Props, events, refs, generic components. Component boundaries, state, Hooks, Effects and render behavior belong elsewhere.
- Do not upgrade rule sets on your own, change `tsconfig` strictness, or reshuffle type files in bulk; those ripple through the whole codebase.

## Read on demand

Write to the rules above first. Look up the matching document when a specific question comes up, and check the cases when a business tradeoff is involved.

### Everyday writing

| Task | File |
| --- | --- |
| How to declare a type, where it lives, domain concepts, how far to take generics and utility types | [type-modeling.md](references/type-modeling.md) |
| Moving off `any`, narrowing `unknown`, assertions and fallback branches, errors and async failures | [type-safety.md](references/type-safety.md) |
| Type naming, `import type` and `export type`, class member modifiers and function parameters | [naming-and-declaration.md](references/naming-and-declaration.md) |
| Typing component Props, events, refs and generic components in `.tsx` | [jsx-types.md](references/jsx-types.md) |

### Business cases

| Task | File |
| --- | --- |
| The whole path from an API response as `unknown` to a domain object | [api-response.md](references/patterns/api-response.md) |
| Modeling order and workflow states with the transitions they allow | [state-machine.md](references/patterns/state-machine.md) |
| Narrowing `any` in a legacy module field by field, without growing the diff | [legacy-any.md](references/patterns/legacy-any.md) |
| Writing config objects and constant tables with `satisfies` | [config-object.md](references/patterns/config-object.md) |

## When the user has to decide

- Read `skill-memory/typescript-best-practices.md` first; a recorded answer is followed without asking again.
- What to ask: how far to tighten strictness, how much of the legacy `any` to narrow, whether types deserve their own file, whether an inheritance chain should be split.
- Ask only when the answer changes code in more than one place; write the conclusion and one line of reasoning into that file afterwards, not the conversation.
- Everything else follows the code as it is: naming, whether a local type gets extracted, whether a particular `as` stays, and the decisions the project already made, such as an existing type file or an enum already in use.
