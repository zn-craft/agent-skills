# Incremental adoption for an existing project

The hard part is controlling the blast radius. One huge reformat buries `git blame` and puts every colleague with an open branch into conflict. Three principles: detect the current state first, merge each step on its own, and let a new rule govern new code first.

## Order

Each step is a pull request that merges and rolls back on its own.

| Step | Action | Done when |
| --- | --- | --- |
| 1 | Add `engines`, `.nvmrc` and `packageManager`, and settle on one lock file | Another machine installs the same dependencies |
| 2 | Adopt the formatter, plus stylelint when there are style files, with configuration only and no code changes | `format:check` and `stylelint` run |
| 3 | Run the full formatting pass as a commit of its own | The working tree is clean, with no logic change |
| 4 | Adopt `typecheck` at one step per [type-check.md](type-check.md) | `typecheck` passes |
| 5 | Adopt lint with only a few errors enabled first | lint passes with no errors |
| 6 | Add the commit gates, applying to changed files only | Changing a file and committing shows the autofix running |
| 7 | Add CI running every command above, made required for merging | The pipeline is green |

The order matches the three hard constraints in SKILL.md and cannot be skipped: the full formatting pass follows step 2 and precedes lint, so the two do not fight; type checking precedes lint, so type-aware rules do not explode on day one; and steps 4 and 5 both precede step 6, so a freshly installed hook is not red immediately. Every option touched along the way gets a comment stating what it controls and why it is set that way.

## Running the full formatting pass

1. Run the formatting command alone, with no logic change mixed in. A commit message such as `chore: apply prettier to entire repo` says so.
2. Put that commit's hash into `.git-blame-ignore-revs`, so `git blame` skips it.
3. Tell the team that branches in flight handle conflicts as they rebase.

## Tightening the rules over time

- Enable only the error rules that are clearly worthwhile at first, leaving the rest as warnings.
- Record the current warning count and clear a batch each round, so it only ever falls.
- A legacy directory gets a looser config through overrides, with the reason for the exception and its cleanup condition written down.

## When to leave it alone

- A project about to be retired or replaced: add only the lock file and the Node version.
- A release freeze or a large refactor in progress: wait until the refactor lands.
- Nobody willing to maintain the configuration: find the maintainer first, since rules nobody tends are worse than no rules.

Once adoption finishes, record these in `CONTRIBUTING` or the README: the package manager and Node requirements, what runs before a commit, how to bypass it, the commit message format, and the known exceptions.
