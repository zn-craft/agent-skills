# Dependency list and framework adaptation

`assets/` holds configuration and `scripts` only, leaving dependency versions to the package manager's current release. The groups below follow the seven baseline items, so install the ones that are missing.

## Shared dependencies

```bash
# Types
pnpm add -D typescript

# Formatting and static analysis
pnpm add -D prettier eslint @eslint/js typescript-eslint globals eslint-config-prettier

# Style checking
pnpm add -D stylelint stylelint-config-standard
# add for SCSS projects
pnpm add -D stylelint-config-standard-scss postcss-scss

# Commit gates
pnpm add -D husky lint-staged @commitlint/cli @commitlint/config-conventional

# Testing, one per project
pnpm add -D vitest
```

Switching package manager changes how the command is spelled, and a whole group installs in one pass rather than across several commits.

## Framework additions

Framework-specific dependencies come on top, with their flat config appended to `eslint.config.mjs`:

| Framework | Additional dependencies | Notes |
| --- | --- | --- |
| React | `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh` | With the React Compiler, add `eslint-plugin-react-compiler` |
| Vue | `eslint-plugin-vue`, `vue-tsc` | `typecheck` becomes `vue-tsc --noEmit` |
| Svelte | `svelte-eslint-parser`, `svelte-check` | `typecheck` becomes `svelte-check` |
| Next.js | `@next/eslint-plugin-next` | Keep the two React plugins as well |
| `<style>` inside single-file components | The parser for the framework, such as `postcss-html` | stylelint needs `customSyntax` to reach the `<style>` block |

## Writing versions

Application dependencies use `^`, and the lock file is what really holds the version; a CLI or build plugin that must be reproduced exactly is pinned. Upgrades happen in one batch rather than riding along on a feature branch. See [package-manager.md](package-manager.md) for the detail.
