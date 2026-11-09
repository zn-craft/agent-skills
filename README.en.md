[中文](README.md) | [English](README.en.md)

# Agent Skills

A collection of reusable Agent Skills. Every skill is a standalone directory with a `SKILL.md` plus the scripts, references, and templates it actually uses, so you install one at a time instead of cloning the whole repository.

## Install

Install one skill (Node 18+ required):

```bash
npx skills add zn-craft/agent-skills --skill js-module-structure -g
```

`-g` installs at the user level so every project on the machine can use it; without it the skill goes into the current project only. Leave out `--skill` to list the available skills and pick one.

No Node, or need to choose the destination directory yourself? Use the install script:

```bash
curl -fsSL https://raw.githubusercontent.com/zn-craft/agent-skills/main/scripts/install-skill.sh | bash -s -- js-module-structure --agent claude
```

`--agent` picks the target, and `codex`, `claude`, and `cursor` all work; the default destination is that agent’s user-level directory. Add `--project` to install into the current project, `--dest` for an explicit directory, or `--force` to replace an existing install. With neither `--agent` nor `--dest` the script exits with an error; there is no default agent.

On Windows, `scripts/install-skill.ps1` takes the same flags:

```powershell
iwr https://raw.githubusercontent.com/zn-craft/agent-skills/main/scripts/install-skill.ps1 -OutFile $env:TEMP\install-skill.ps1
powershell -ExecutionPolicy Bypass -File $env:TEMP\install-skill.ps1 js-module-structure -Agent claude
```

A downloaded `.ps1` carries the mark-of-the-web and execution policies such as RemoteSigned block it; `-ExecutionPolicy Bypass` applies to that run only, or run `Unblock-File` once.

From a clone, run `bash scripts/install-skill.sh js-module-structure --agent claude`.

## Available skills

Register new skills here: the description column copies the skill’s own `description`, and this table and [README.md](README.md) change together.

| Skill | Description | Install |
| --- | --- | --- |
| [frontend-project-baseline](skills/frontend-project-baseline) | Build, complete, or change the engineering baseline of a frontend project: package manager and runtime constraints, TypeScript, formatting and static analysis, environment variable templates, commit gates, required CI checks. Use it when setting technical constraints for a new project, retrofitting lint / formatting / type checking / git hooks / CI into an existing one, reviewing whether the setup meets the baseline, or changing ESLint, Prettier, tsconfig, stylelint, husky, or CI config. Framework-agnostic, works for single packages and monorepos, and ships an inspection script with copy-ready templates. It does not cover business directory or module responsibility layout, build output optimization, release versioning, or monorepo splitting | `npx skills add zn-craft/agent-skills --skill frontend-project-baseline` |
| [js-module-structure](skills/js-module-structure) | Module directory, file role, and named-export conventions for non-backend JS/TS projects. Use it when creating a module, writing a utility or component library, adding api / store / hooks / utils / components / pages to a frontend app, adding types, constants, mocks, styles or tests to an existing module, or splitting and reorganizing directories in React, Vue, native mini program, Taro, and uni-app projects. Only when creating or reorganizing JS/TS code, or deciding which file a piece of code belongs in; not for backend services | `npx skills add zn-craft/agent-skills --skill js-module-structure` |
| [code-comments](skills/code-comments) | What comments should say, when one is required, when to delete it, and what to do with stale ones. Use it when writing or changing code or configuration files, and when tidying up legacy comments. It does not cover lint rules, comment formatting, API doc generation, or commit messages | `npx skills add zn-craft/agent-skills --skill code-comments` |
| [style-conventions](skills/style-conventions) | How styles should be written: class names and scoping, variables and design tokens, selector specificity, layout and responsive breakpoints, themes and interaction states, inline styles and runtime values, and where global CSS ends, plus how style files and folders are organized. Use it when adding or changing component styles, turning a design into CSS / SCSS / Less, writing CSS Modules, Vue scoped styles, Tailwind, or mini program wxss, and when tracking down styles that override each other or magic values. It does not cover style linter configuration, build output optimization, or visual design review | `npx skills add zn-craft/agent-skills --skill style-conventions` |
| [js-best-practices](skills/js-best-practices) | JavaScript language-level style and structure decisions: use when writing, changing, or reviewing JS/TS code. Covers naming, function form (arrow functions by default), control flow and value handling, collections (numbers and dates, strings, cloning), async style, error handling, and the tradeoffs in inheritance, loops, and caching. Does not cover TypeScript type modeling, module layout, framework components, comments, or build / lint configuration. | `npx skills add zn-craft/agent-skills --skill js-best-practices` |
| [typescript-best-practices](skills/typescript-best-practices) | TypeScript type modeling and writing decisions: use when writing, changing, reviewing, or refactoring TS code. Decides how to declare types (interface / type / unions / enums / `as const`), how to narrow boundary data from `unknown`, how to move away from `any` and assertions, how to express errors and domain concepts in types, and how much strictness to take on. Also covers typing Props, events, refs, and generic components in `.tsx`. Does not cover general JS style, module layout, JSX rendering, tsconfig, or lint configuration. | `npx skills add zn-craft/agent-skills --skill typescript-best-practices` |
| [react-best-practices](skills/react-best-practices) | Use when writing, changing, or reviewing React components. Covers component boundaries, state ownership, Hooks, Effects, data fetching, rendering, and interaction performance. For SSR or RSC, consult the guidance for the project's version. Excludes build configuration, TypeScript type design, and CSS conventions. | `npx skills add zn-craft/agent-skills --skill react-best-practices` |

## Adding a skill

```bash
node scripts/new-skill.mjs my-skill --resources references
node scripts/validate-skills.mjs
node scripts/score-skills.mjs skills/my-skill
```

Fill in the TODOs the scaffold leaves in `SKILL.md`, get validation to zero errors and the score to at least 8.5, then add a row to both README tables. The full conventions live in [CONTRIBUTING.en.md](CONTRIBUTING.en.md).

## License

[MIT](LICENSE)
