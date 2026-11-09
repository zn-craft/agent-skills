# CI pipeline

CI only does what cannot or should not be done locally: the full check and the single verdict. Its commands are the scripts that already exist locally, with nothing invented on top.

## Stages

| Stage | Command | Gating |
| --- | --- | --- |
| Install | A strict lock-file install, see package-manager.md | Yes |
| Static analysis | `lint`, `stylelint`, `format:check`, `typecheck`, split into parallel jobs | Yes |
| Test | Unit tests, with a coverage threshold where needed | Yes |
| Build | `build` | Yes |
| Optional | End-to-end tests, size comparison, dependency scanning | Depends on the project |

Splitting static analysis into parallel jobs is faster than chaining it in one job and shows at a glance which kind of problem appeared. A repository with no style files drops the `stylelint` leg.

## Gating

- Every check has to pass before a merge, set as required in branch protection, or a red cross still merges.
- Warnings do not block a merge.

## Triggers

| Event | What runs |
| --- | --- |
| Pull request | The full check, no deployment |
| Push to the main branch | The full check, then deployment |
| A tag | Build the artifact and publish |

## Cache and duration

- The cache key includes the lock file name and the Node version, and only the package manager's store is cached, never the whole `node_modules`.
- With dependencies unchanged, the install finishes in seconds.
- A single job past ten minutes needs an explanation: dependencies installed twice, the full end-to-end suite inside it, or a cache that never hits.
- A monorepo runs by affected scope (turbo or nx `affected`).

## Security

- Secrets come from the secret store, never from the workflow or a committed `.env`; a pull request from a fork gets no production secret.
- Permissions are granted as needed, starting from `contents: read`. Third-party actions are pinned to a version, never `@main`.

## Common failures

| Symptom | Cause |
| --- | --- |
| Passes locally, fails in CI | Different commands or Node versions on the two sides |
| Dependencies reinstalled every run | A wrong cache key or cache path |
| A check never fails | The command is wrong and never scans the files |
| Problems appear after the merge | Branch protection does not make the check required |
