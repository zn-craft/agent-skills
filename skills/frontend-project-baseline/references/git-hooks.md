# Commit gates and git hooks

A hook stops locally what was changed without being checked, saving one failed push; correctness is CI's job. Piling full checks into pre-commit means a minute of waiting per commit and ends with everyone using `--no-verify`.

## What goes in which hook

| Hook | What it holds | Expected duration |
| --- | --- | --- |
| `pre-commit` | Formatting and lint autofix for staged files | Seconds |
| `commit-msg` | Commit message format | Milliseconds |
| `pre-push` (optional) | Type checking, affected unit tests | Tens of seconds to a minute |

The full test suite, the full build, the full lint and end-to-end tests belong to CI.

## Tools

| Tool | Fits |
| --- | --- |
| husky with lint-staged | The default: the best-known ecosystem and the cheapest to hand over |
| lefthook | Needing speed, and hooks running in parallel |
| simple-git-hooks | Only one or two hooks, with the config living in `package.json` |

Any one of them already in the repository stays; completing the baseline is not the moment to switch.

## husky specifics

- `husky init` generates `.husky/`, which is committed, and it takes effect for a fresh clone once dependencies are installed.
- `prepare` includes the husky initialization, so an install in CI runs it too; set `HUSKY=0` where that matters.
- A hook file carries no business logic and calls the `package.json` script directly, keeping local and CI identical.
- `lint-staged` groups by file type, with commands matching `lint:fix` and `stylelint:fix`.

## Commit messages

The format is `<type>(<scope>): <subject>`, with the module name as the scope. Types are limited to `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `build`, `ci`, `chore` and `revert`.

commitlint checks strictly when a changelog or an automatic version bump depends on it; otherwise only the type prefix is checked. Merge commits, revert commits and dependency bots are either let through or exempted.

Autofix inside a hook changes working-tree files, so confirm before committing that the change contains only this piece of work. `--no-verify` is an escape hatch, not the usual path.
