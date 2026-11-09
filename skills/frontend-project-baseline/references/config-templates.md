# Config templates

Everything under `assets/` is a full set of configuration written for the default choices, copied to the project root and ready to run. A single package uses `assets/baseline/`; a monorepo adds `assets/monorepo/` on top.

Templates get copied into someone else's project, where this skill's documentation does not exist, so a template has to stand alone. Where a template and a reference overlap, the template wins, because that is the copy that runs.

Before copying, read "Checking the wording" at the end: a template records how things were written at the time, and a major tool release changes the configuration format, so land the current official form.

## Copy list

| Template | Destination | Notes |
| --- | --- | --- |
| `assets/baseline/*` | Project root | Includes hidden files (`.husky/`, `.vscode/`, `.github/`), so do not miss them when copying |
| `assets/monorepo/pnpm-workspace.yaml` | Repository root | Change `packages` to the real package directories |
| `assets/monorepo/package.json` | Repository root | Overrides the baseline `package.json` |

A monorepo keeps the rest of the files identical to a single package, all at the repository root: lint, formatting, style checking, hooks and CI are governed from the root, and each package keeps only its own `tsconfig.json` and its `dev` / `build` / `test` / `typecheck` commands. Do not copy `assets/baseline/tsconfig.json` to the repository root, since its `include` is written for a single package's source directory.

The differences in a monorepo root `package.json`: `lint`, `lint:fix`, `format`, `format:check` and `stylelint` run once at the root over every package, while `typecheck`, `test` and `build` recurse through `pnpm -r` and `dev` uses `pnpm -r --parallel`.

## package.json fields

Strict JSON takes no comments and `.nvmrc` holds a single version, so read those two files through this table:

| Field | Purpose |
| --- | --- |
| `name` / `version` | Nothing at runtime for a private project, so rename it |
| `private` | Keeps it out of npm, so it cannot be published by accident |
| `type: module` | Config files parse as ESM |
| `engines.node` | Warns at install time about the Node floor, aligned with `.nvmrc` |
| `packageManager` | Version managers pin the pnpm version from this, and CI reads it too |
| `scripts.dev` | The local dev server; the template writes the Vite command, changed when the bundler changes |
| `scripts.build` | Bundling only, leaving type checking to `typecheck` so CI does not run it twice |
| `scripts.preview` | Previews the built output locally, Vite-specific and deleted with the bundler |
| `scripts.lint` / `lint:fix` | Static analysis; the first reports and the second fixes what it can |
| `scripts.format` / `format:check` | The first writes and the second only checks, running in CI |
| `scripts.stylelint` / `stylelint:fix` | The same pair for style files |
| `scripts.typecheck` | The standalone type check, since a build chain does not type check by default |
| `scripts.test` | One test run, and CI uses the same command |
| `scripts.prepare` | Wires up git hooks on install, skipped in CI through `HUSKY=0` |
| `lint-staged` | pre-commit handles staged files only, grouped by extension |

What to install is in [dependencies.md](dependencies.md).

## Fields to change after installing

| File | What to change |
| --- | --- |
| `package.json` | `name`, `dev` / `build` / `preview` (the template writes Vite commands), and the pnpm version in `packageManager` |
| `.nvmrc` and `engines.node` | The Node version the team actually uses, kept in step across both |
| `tsconfig.json` | Add `lib`, `jsx` and `types` for the framework, and make `include` cover every source directory |
| `eslint.config.mjs` | Add framework plugins and any project-specific ignores |
| `stylelint.config.mjs` | Without SCSS keep `stylelint-config-standard`; `<style>` inside `.vue` or `.svelte` needs `customSyntax` |
| `commitlint.config.mjs` | Replace `type-enum` when the team follows another commit convention |
| `.env.example` | Change prefixes for the framework and replace every variable with what the code actually reads |
| `.github/workflows/ci.yml` | Branch names, whether deployment happens, and the test and build commands; with no tests, delete the `test` job and `pnpm run test` |

Confirm `.gitignore` covers `node_modules`, the build output directory, `.env*` with `.env.example` kept, and editor and OS temporary files.

## First run

```bash
pnpm install          # runs prepare, generating .husky/_ and wiring up the hooks
pnpm run format       # full formatting pass, in a commit of its own
pnpm run lint
pnpm run stylelint
pnpm run typecheck
pnpm run test
pnpm run build
```

A full formatting pass produces a wide diff, so it lands as its own commit per [existing-project.md](existing-project.md), with the hash written into `.git-blame-ignore-revs`.

## Checking the wording

A template was written before the day it is opened, and the places below change with a major release, so confirm each against the official documentation before landing.

| What changes | The template's form | What to check |
| --- | --- | --- |
| ESLint | `eslint.config.mjs` (flat config) | An existing project may still be on `.eslintrc`, and adopting it means deciding between migrating and keeping it |
| stylelint | `stylelint.config.mjs` exporting a config object | Whether stylistic rules moved to `@stylistic`, and whether Prettier conflicts still need turning off |
| husky | A hook file holding one command | Whether a newer version changed the initialization or the hook file requirements |
| pnpm | `packageManager` plus `pnpm-workspace.yaml` | Which file now holds workspace-level settings such as `onlyBuiltDependencies` |
| GitHub Actions | `actions/checkout@v4`, `pnpm/action-setup@v4` | Whether the actions have a newer major version |
| Node | `.nvmrc` with an exact version, `engines` with a major floor | Whether it matches the current LTS, and whether the two agree |
