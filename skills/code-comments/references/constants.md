# Comments on constants and variables

Read this when writing a constant, a module-level config value, an enum value or a default, or when you meet a magic value.

A constant comment carries **where the value comes from, what range it covers, and when it may change**: unit, bounds, origin, the reasoning behind the value, and what changing it would do.

## What to write

- Unit and precision.
- Range and boundaries, and what happens past them.
- Origin: a server contract, a protocol document, a product decision, a hardware limit.
- Why this value, and what raising or lowering it would do.
- Lifetime: a threshold that depends on time states when it gets reviewed.

For constants: exported ones get `/** */`, file-private ones get `//`. Extract a magic value into a named constant first, then comment it; a number that appears once with an obvious meaning may be commented in place, a number that appears more than once must be extracted.

## Cases

Unit and origin
✗ `export const TIMEOUT = 3000; // timeout`
✓ `/** The gateway counts milliseconds and caps at 10s; 3s leaves room for a retry */`
✓ `export const TIMEOUT = 3000;`
reason: the unit and the reasoning are missing, and a plain line comment stays invisible outside the file

Upper bound
✗ `export const MAX_UPLOAD = 5 * 1024 * 1024; // max upload`
✓ `/** 5MB is the server-side hard limit and the client rejects first; check the gateway config before changing this */`
✓ `export const MAX_UPLOAD = 5 * 1024 * 1024;`
reason: who set the limit and what must move first are missing

Magic value
✗ `if (retry > 3) { ... }`
✓ `// the gateway trips after the 3rd failure, so the 4th is guaranteed to fail`
✓ `if (retry > MAX_RETRY) { ... }`
reason: the number needs its origin explained, and it should be named first

Lifetime
✗ `export const TRIAL_DAYS = 14; // trial days`
✓ `/** A product decision of 14 days; revisit when the contract is revised in 2026 */`
✓ `export const TRIAL_DAYS = 14;`
reason: the review point is missing
