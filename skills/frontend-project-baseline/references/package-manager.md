# Package manager and Node constraints

This comes first because command spelling and CI cache keys depend on it, and changing it touches a ring of files.

## Which one

| Repository state | Choice |
| --- | --- |
| A brand-new project | pnpm |
| An existing `package-lock.json`, `yarn.lock` or `bun.lock` | npm, yarn or bun accordingly, kept as it is |

Why pnpm: it is fast, saves disk, and closes off phantom dependencies by default, so a package not written into `package.json` cannot be imported. The cost is that some older packages are sensitive to peer dependencies and need a `public-hoist-pattern` exception, written into the config with its reason.

For a library published to npm, check the built output with `npm pack` before publishing rather than assuming pnpm's symlink layout matches npm's.

## Lock files

- One per repository. Switching package manager deletes the old lock file and updates CI, the README and the Dockerfile in the same change.
- Committed, and never edited by hand.
- CI installs in strict mode: pnpm `--frozen-lockfile`, npm `ci`, yarn `--immutable`. Local installs stay in normal mode.
- Switching package manager means changing CI's install command and cache key together, or the old cache keeps hitting. Cache key composition is covered in [ci.md](ci.md).

## Pinning the Node version

| Location | Written as | Effect |
| --- | --- | --- |
| `.nvmrc` | `22.11.0` | The local version manager switches automatically |
| `engines.node` | `>=22` | Warns at install time, and pnpm enforces it by default |
| `packageManager` | `pnpm@10.0.0` | corepack pins the package manager version from this |

With native modules, a Docker build or archived artifacts, tighten `engines` from `>=22` to `22.x`. `engines` only warns by default; blocking installs means turning on `engine-strict=true` explicitly.

## Version ranges

| Scenario | Written as |
| --- | --- |
| Application dependencies | `^`, with the lock file carrying the real constraint |
| A library's dependencies | `^`, on the loose side |
| A library's peerDependencies | A range covering the major versions consumers may use |
| A CLI or build plugin that must be reproduced exactly | Pinned |

Upgrades happen in one batch, either on a fixed cycle or as a routine task running the full CI. They do not ride along on a feature branch.
