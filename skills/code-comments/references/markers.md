# Markers, deprecation and cleanup

Read this when writing a TODO marker, temporary logic or a deprecation notice, or when you find commented-out code.

## TODO markers

The shape is fixed: marker word + reason + release condition. A marker with no release condition never gets done and turns into long-term noise.

✗ `// TODO optimize`
✓ `// TODO(2025-Q4): drop the local filter once the search service supports prefix matching`

✗ `// FIXME concurrency problem`
✓ `// FIXME: concurrent writes to one record lose updates; remove this check once the repository layer adds optimistic locking`

Three or more markers stacked in one place mean the work should be split, not annotated further.

## Deprecation

State the replacement and the removal date; "deprecated" alone says nothing. A deprecation that crosses modules or the client-server boundary has to name both sides, or one side changes while the other keeps calling it.

✓ `/** @deprecated Use fetchOrders; this endpoint goes away in 2026-03, keep it until then */`

## What to delete

All of the following already have a home in the commit history, and leaving them in the code only misleads readers:

- Commented-out implementations and old config. If the evidence matters, it belongs in the commit message.
- Debug leftovers: print statements, temporary switches, hard-coded test values.
- File header templates: `@author`, creation date, version, change log. The code shows what the file does, and the history shows who changed it.
- Commented-out tests. To skip one, use the framework's skip with a stated reason; to abandon it, delete it.
- Markers whose condition is already met, and notes about stages that are finished.

✗ `// const oldUrl = "..."; old endpoint kept as a fallback`
✓ delete it and use `git log` when you need to look back
reason: "as a fallback" usually means an assumption is still unconfirmed, and the assumption should be written down instead of the dead code
