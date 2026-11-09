---
name: code-comments
description: What a comment should say, when one is required, when to delete it, and how to handle stale ones. Use when writing or changing code or config files, or when cleaning up legacy comments. Does not cover lint rules, formatting or commit messages.
---

# What a comment should say

One test decides it: **if this comment disappeared, what would a reader lose?** If the answer is nothing, delete it. Anything the code already says stays out of comments — when a name, a structure or a type makes it clear, renaming, extracting a function or splitting a branch beats a comment, and that work belongs inside the current change without widening its scope. A comment earns its place by carrying what the code cannot: why it is done this way, where the constraint comes from, where the edge sits.

Declarations that other code calls into get block comments (JSDoc / TSDoc, docstrings, Go doc comments) so hovers and completion can show them; implementation detail and inline logic get `//`. Comment language follows the comments already in the file; a new file follows the dominant language of its directory or repository, and one file never mixes two languages.

## Find the rule for what you are changing

| What you are changing | Read |
| --- | --- |
| Config files of any kind: build, lint, CI, deploy, environment variables, container orchestration | [references/config.md](references/config.md) |
| interface, type, enum, field semantics | [references/types.md](references/types.md) |
| Constants, magic values, enum values, defaults | [references/constants.md](references/constants.md) |
| Functions, methods, hooks, components, exported APIs | [references/functions.md](references/functions.md) |
| Branches, loops, multi-step flows, test cases, workaround logic | [references/inline.md](references/inline.md) |
| Markers for pending work, temporary logic, deprecation, commented-out code | [references/markers.md](references/markers.md) |

A file header says what the file is responsible for and who calls it, in one line; read only the references listed above that you need, never all of them.

Decide whether something is config by who reads it, not by its name: build, lint, CI, deploy, container and runtime readers make it config (`.prettierrc.mjs`, `vitest.workspace.ts`, `Makefile`, `.env.local`, `nginx.conf` all count); anything imported by product code is source.

## Two hard rules

- An old comment is either made correct or deleted. A comment that reads right but is no longer true does more harm than no comment.
- Leave no liabilities: commented-out implementations, debug leftovers and change logs all go. Their home is the commit history.
