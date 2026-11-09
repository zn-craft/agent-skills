---
name: frontend-project-baseline
description: Engineering baseline for a frontend project, covering the package manager, TypeScript, ESLint, Prettier, tsconfig, stylelint, husky and CI. Use when setting up a project or retrofitting lint, format, type check, git hooks or CI into an existing one. Framework agnostic; works for single packages and monorepos. Does not cover business layout or release versioning.
---

# Frontend project baseline

The baseline means: anyone clones the project, installs dependencies once, and it runs; problems surface before a commit; CI catches whatever slips past. One test decides everything: would another person on another machine get the same result?

## The seven baseline items

| # | Item | Where it lands | What passing looks like |
| --- | --- | --- | --- |
| 1 | Runtime and package manager constraints | `engines`, `packageManager`, lock file, `.nvmrc` | Another machine installs the same dependency tree |
| 2 | TypeScript | `tsconfig.json` and its layered configs | Type checking is its own command and CI requires it |
| 3 | Formatting | Tool config and ignore files | Indentation, quotes and line breaks stop being a discussion |
| 4 | Static analysis | Lint and style config, with rules split into error and warn | Only errors block a merge |
| 5 | Environment variables | `.env.example`, variable type declarations | A fresh clone can see what has to be configured |
| 6 | Commit gates | git hooks configuration | Locally it blocks only changed files; the full run stays in CI |
| 7 | CI | Pipeline configuration | It runs the same commands as the local ones |

That table is the checklist, and the order comes from three hard constraints: the package manager and Node come first because they decide command spelling and CI cache keys; type checking comes before lint so type-aware rules can actually run, since switching them on first produces hundreds of errors; and the full formatting pass comes before lint, because the other order has the two fighting each other. An existing project follows the same constraints, split into PRs that merge one step at a time, as described in [references/existing-project.md](references/existing-project.md).

## Configuration rules

- **Every configured option carries a comment**: each option written into the project states what it controls and why it is set that way. Formats that support comments get them next to the value (`.mjs`, `tsconfig.json`, `.yml`, ignore files); a strict JSON file such as `package.json` cannot take one, so the explanation goes into the commit message or the project documentation rather than leaving the next person to guess. When this skill edits the engineering config of an existing project, the options it touches get comments too.
- **Templates can lag behind the current spec**: `assets/` records how things were written when the template was created, and a major tool release can make it stale. Before landing, check the tool's current official configuration format and write that; where the template and the official form disagree, the official form wins, with the difference noted in a comment.

## How it works

Detect first, then fill the gaps, and **keep every choice already in place**. Replacing husky with lefthook or ESLint with Biome is a separate migration decision, not something to fold into completing the baseline; when it genuinely should change, raise it on its own for the user to decide, and record the answer in `skill-memory/frontend-project-baseline.md` so the next run follows it without asking again. A team convention that is explicit and conflicting wins.

Changing config takes two paths with very different cost, chosen by how much is changing.

- **A single-point change**: adjusting the level of one existing rule, adding an ignore, changing one field's value. Read this section, make the change, and skip both the script and the references; the options touched get comments.
- **A whole-project change**: adopting the baseline, reviewing whether it holds, starting a new project, switching package manager. Run the script below first, then load the reference matching each gap in its report.

```bash
node <skill directory>/scripts/detect-stack.mjs <project root>
```

The script prints a text report by default; `--json` is for programmatic use only, and its output is roughly three times the size.

After adopting it, verify in reverse: delete `node_modules`, reinstall, then deliberately commit one type error and one formatting error and confirm the local hooks and CI stop both.

A new project takes the defaults below in one pass, with templates in [references/config-templates.md](references/config-templates.md); an existing project adopts them incrementally per [references/existing-project.md](references/existing-project.md).

## Default choices

| Item | Default | When to change it |
| --- | --- | --- |
| Package manager | `pnpm` | The repository has another lock file, so keep it |
| Node version | `engines` pins the major, `.nvmrc` names the exact version | When a production build has to be reproduced, tighten `engines` to a patch range |
| TypeScript | `strict: true` | An existing project cannot take it, so tighten in steps per [type-check.md](references/type-check.md) |
| Formatting and static analysis | Prettier plus ESLint (flat config) | Wanting one tool for both means Biome |
| Style checking | stylelint with `stylelint-config-standard` | The repository has no CSS, SCSS or Less, so skip it |
| Commit gates | husky with lint-staged | The repository already uses lefthook or simple-git-hooks, so keep it |
| Commit messages | Conventional Commits with commitlint | Without a changelog, constrain the type prefix only |
| CI | GitHub Actions | An existing GitLab CI or Jenkins platform stays |

## What not to do

- Two formatters side by side, or lint and the formatter governing the same thing
- Turning a large batch of warnings into errors at once, until everyone works around them
- Running the full test suite, the full lint or the full build from pre-commit
- CI running commands that differ from the local ones
- A formatting reformat and a logic change landing in the same commit

## Resources

- Inspect the existing config: `node <skill directory>/scripts/detect-stack.mjs <project root>`, adding `--json` for machine-readable output; it handles single packages and monorepos, the scripts can be copied anywhere as a set, and the entry depends on the `detect-stack.*.mjs` files beside it.
- The full template for a single package: `assets/baseline/`, copied to the project root including the hidden files.
- Additions for a monorepo: `assets/monorepo/`, overriding two files on top of the baseline.
- Package manager and Node constraints: [references/package-manager.md](references/package-manager.md)
- Choosing formatting and static analysis: [references/lint-format.md](references/lint-format.md)
- Config templates, fields and what to adapt: [references/config-templates.md](references/config-templates.md)
- Installing dependencies and adapting a framework: [references/dependencies.md](references/dependencies.md)
- Environment variables and prefixes: [references/env.md](references/env.md)
- TypeScript strictness in steps: [references/type-check.md](references/type-check.md)
- Commit gates and hooks: [references/git-hooks.md](references/git-hooks.md)
- CI pipeline structure: [references/ci.md](references/ci.md)
- Incremental adoption for an existing project: [references/existing-project.md](references/existing-project.md)

Load the references by scenario rather than reading them all at once.
