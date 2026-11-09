# Comments on type declarations

Read this when changing an interface, a type, an enum, a type alias or a field declaration.

A type comment carries **the semantics the signature cannot express**: what each value means for behavior, when a field is absent, units and precision, where a default comes from.

## What to write

- Field semantics: the business meaning behind the name, especially where different values drive different system behavior.
- Why a field is optional: under which conditions it holds a value.
- Union types: what state each branch represents.
- Enum members: how the members differ in behavior, not the member name translated into prose.
- Units and precision: money, time, ratios.

With a type system in place, comments carry semantics only and never restate the type. JS has no type system, so comments take on the types: spell the shape out with JSDoc `@typedef` / `@property`.

Write field comments as `/** */` next to the field so hovering the property shows them; a plain line comment tells the caller nothing.

## Cases

Union type
✗ `/** status */` above `status: string`
✓ `/** pending awaiting payment; paid settled and not reversible; closed timed out */` above `status: OrderStatus`
reason: what each value does is missing

Optional field
✗ `/** note */` above `remark?: string`
✓ `/** Set only on offline orders; always undefined on online ones */` above `remark?: string`
reason: when it is absent is missing

Units
✗ `/** amount */` above `amount: number`
✓ `/** In cents, integer, never used in decimal arithmetic */` above `amount: number`
reason: the unit is missing

JS shape
✗ `// the user object`
✓ `/** @typedef {{ id: string, name: string, roles: string[] }} User */`
reason: without a type system the comment is the type declaration
