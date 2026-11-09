[中文](README.md) | [English](README.en.md)

# Agent Skills

[![skills.sh installs](https://skills.sh/b/zn-craft/agent-skills)](https://skills.sh/zn-craft/agent-skills) [![Validate skills](https://github.com/zn-craft/agent-skills/actions/workflows/validate-skills.yml/badge.svg)](https://github.com/zn-craft/agent-skills/actions/workflows/validate-skills.yml) [![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A collection of reusable Agent Skills, installable one at a time instead of cloning the whole repository.

The repository holds two mirrored trees: `skills/<name>/` is the English version and the one this project promotes, while `zh/<name>/` keeps the Chinese version as the source used for writing and proofreading. Both trees have the same directory and file names, and a change to one is expected in the same commit as the other.

Installers and skill directories index the English tree by default. The Chinese tree lives outside `skills/`, so it never takes a promotion slot, but it installs on request and lands as `<name>-zh`.

## Install

Install one skill (Node 18+ required):

```bash
npx skills add zn-craft/agent-skills --skill js-module-structure
```

Leaving out `--skill` lists every English version so you can pick one. Add `-g` to install at the user level so every project on the machine can use it; without it the skill goes into the current project only.

The Chinese tree is not in the default listing; install it by path:

```bash
npx skills add zn-craft/agent-skills/zh/js-module-structure
```

No Node, or need to choose the destination directory yourself? Use the install script:

```bash
curl -fsSL https://raw.githubusercontent.com/zn-craft/agent-skills/main/scripts/install-skill.sh | bash -s -- js-module-structure --agent claude
```

`--agent` picks the target, and `codex`, `claude`, and `cursor` all work; the default destination is that agent’s user-level directory. Add `--lang zh` for the Chinese version. Add `--project` to install into the current project, `--dest` for an explicit directory, or `--force` to replace an existing install. With neither `--agent` nor `--dest` the script exits with an error; there is no default agent.

On Windows, `scripts/install-skill.ps1` takes the same flags:

```powershell
iwr https://raw.githubusercontent.com/zn-craft/agent-skills/main/scripts/install-skill.ps1 -OutFile $env:TEMP\install-skill.ps1
powershell -ExecutionPolicy Bypass -File $env:TEMP\install-skill.ps1 js-module-structure -Agent claude
```

A downloaded `.ps1` carries the mark-of-the-web and execution policies such as RemoteSigned block it; `-ExecutionPolicy Bypass` applies to that run only, or run `Unblock-File` once.

From a clone, run `bash scripts/install-skill.sh js-module-structure --agent claude`; add `--lang zh` for the Chinese version.

## Available skills

Register new skills here: the description column copies the English `description`, and this table and [README.md](README.md) change together. Skills that have no English version yet are only listed in [README.md](README.md).

| Skill | Description | Install |
| --- | --- | --- |
| [code-comments](skills/code-comments) | What a comment should say, when one is required, when to delete it, and how to handle stale ones. Use when writing or changing code or config files, or when cleaning up legacy comments. Does not cover lint rules, formatting or commit messages. | `npx skills add zn-craft/agent-skills --skill code-comments` |
| [frontend-project-baseline](skills/frontend-project-baseline) | Engineering baseline for a frontend project, covering the package manager, TypeScript, ESLint, Prettier, tsconfig, stylelint, husky and CI. Use when setting up a project or retrofitting lint, format, type check, git hooks or CI into an existing one. Framework agnostic; works for single packages and monorepos. Does not cover business layout or release versioning. | `npx skills add zn-craft/agent-skills --skill frontend-project-baseline` |
| [js-best-practices](skills/js-best-practices) | JavaScript language-level style and structure decisions. Use when writing, changing or reviewing JS/TS code. Covers naming, function form, control flow, collections, async style and error handling, plus the tradeoffs in classes, inheritance, loops and caching. Does not cover TypeScript type modeling, module layout, framework components or build and lint config. | `npx skills add zn-craft/agent-skills --skill js-best-practices` |
| [js-module-structure](skills/js-module-structure) | Directory, file role and named-export conventions that decide where code goes in non-backend JS/TS projects. Use when creating a module, adding api / store / hooks / utils / pages to a frontend app, adding types, constants, styles or tests to an existing module, or reorganizing directories in React, Vue, Taro or uni-app projects. Not for backend services. | `npx skills add zn-craft/agent-skills --skill js-module-structure` |
| [react-best-practices](skills/react-best-practices) | React component work, covering boundaries between components, where state lives, Hooks, Effects, data fetching, rendering and interaction performance. Use when writing, changing or reviewing React components. For SSR or RSC, consult the guidance for the project's version. Does not cover build configuration, TypeScript type design or CSS conventions. | `npx skills add zn-craft/agent-skills --skill react-best-practices` |
| [style-conventions](skills/style-conventions) | Style conventions, covering class names and scoping, variables and tokens, selector specificity, layout and breakpoints, themes and states, inline styles, global CSS boundaries and file organization. Use when changing component styles, writing CSS Modules, Tailwind or mini program wxss, or tracing overriding values. Does not cover style linter config or visual design review. | `npx skills add zn-craft/agent-skills --skill style-conventions` |
| [typescript-best-practices](skills/typescript-best-practices) | TypeScript type modeling. Use when writing, changing, reviewing or refactoring TS code. Covers declaring types, narrowing boundary data from unknown, retiring any and assertions, expressing errors and domain concepts in types, choosing strictness, and typing Props / events / refs and generic components in .tsx. Does not cover JS style, module layout, JSX rendering, tsconfig or lint config. | `npx skills add zn-craft/agent-skills --skill typescript-best-practices` |

## Adding a skill

```bash
node scripts/new-skill.mjs my-skill --resources references
node scripts/validate-skills.mjs
node scripts/score-skills.mjs skills/my-skill
```

The scaffold creates `skills/my-skill/` and `zh/my-skill/` together. Fill in the TODOs in both `SKILL.md` files, get validation to zero errors and the score to at least 8.5, then register the skill in both README tables. The two copies are maintained in step; the full conventions live in [CONTRIBUTING.en.md](CONTRIBUTING.en.md).

## License

[MIT](LICENSE)
