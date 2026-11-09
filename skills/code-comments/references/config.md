# Comments in engineering config

Read this when changing any configuration — build, lint, CI, deploy, environment variables, container orchestration, and tools beyond the ones listed here.

Whether something is config depends on who reads it: a build, lint, CI, deploy, container or runtime process reading it makes it config. `config`, `rc`, `conf` and `.env` in a name are only hints; `Makefile`, `Cargo.toml` and `justfile` are config without any such hint. The other way round, a `config` directory imported by product code is an ordinary module — treat it as source.

A config comment answers three questions: **what this setting controls, why it holds this value, and what changes if you touch it.** Anything the code already shows stays out; what is missing is the reasoning behind the choice.

## 1. Decide first whether you may write anything

1. **Generated files: no.** A file headed `DO NOT EDIT`, `@generated` or similar, a path inside `.gitignore`, `vendor/`, `node_modules/` or `dist/`, or a common lock file — write nothing, it gets overwritten anyway.
2. **A file that already carries comments: yes.** Follow their position and style.
3. **A file with none: judge by format**, see the table. For a format that is not listed, reason the same way — do not read "not listed" as "not allowed". When you are unsure, write one line and run the parser or the build once; if you cannot verify it, treat it as not allowed.

| Format family | Examples | Comment syntax |
| --- | --- | --- |
| Config written as code | `vite.config.ts`, `eslint.config.mjs`, `config.py` | the language's own comment syntax |
| Line-based config | YAML, TOML, INI, properties, `.env`, `Dockerfile`, `Makefile` | `#`, INI may also take `;` |
| JSONC | `tsconfig.json`, VS Code settings | `//` or `/* */` |
| Strict JSON | `package.json`, most `*.json` | unsupported, see section 3 |
| Markup | XML such as `pom.xml` | `<!-- -->`, which some tools strip when they rewrite the file |

`tsconfig.json` carries a `.json` suffix but parses as JSONC, so comments are fine.

## 2. What to write

- **Why this value**: why 3 and not 5, why this setting must be on and that one must be off.
- **Version pinning**: when you pin a version or override a dependency, state the condition that lifts the pin, or nobody dares upgrade.
- **Unusual steps**: non-standard flags, skipped checks, extra caching, a command that runs twice.
- **Environment differences**: why it passes locally and fails in CI, why production needs an extra switch.
- **Temporary workarounds**: the switch added for a specific bug, together with the condition for deleting it.

More than a dozen comments in one config file usually means the file should be split, or the reasoning belongs in a document of its own (section 3).

## 3. When you cannot write a comment

For formats that do not support comments, such as strict JSON, write none — and do not smuggle one in as a data field. If this change really carries a value decision worth recording, read `skill-memory/code-comments.md` in the project first: a recorded answer is followed without asking again. With no record, ask once whether to generate a separate document:

- User agrees: write a Markdown file covering why each setting is what it is and what changes if it is touched. The user picks the location and the name; given neither, put it next to the file as `<filename>.notes.md`.
- User declines: stop there, generate nothing, and do not ask again.
- Nothing to explain (formatting only, routine version bumps): do not ask. Runtime or toolchain minimums, pinned versions and skipped checks are decisions that do deserve the question.

Write the outcome into `skill-memory/code-comments.md`, creating it when it does not exist.

## 4. Traps

- Do not stand in for a comment with a data field: `"comment"`, `"//"`, `x-note`, Kubernetes annotations and labels are all read as real data and may ship with the build.
- No secrets, account names or internal addresses in comments — this is the easiest place to paste them by accident.
- For multi-environment config, state the scope: which environment, which machine, who maintains it.

## Cases

Why this value
✗ `// strict mode`
✓ `// strict on existing files reports hundreds of errors; noImplicitAny first, tighten new directories later`
✓ `"strict": false,`
reason: what is missing is why it stays off and when it goes on

Version pinning
✗ `dependencies = ["httpx==0.27.0"]`
✓ `# 0.28 changed the default timeout; upgrade once the callers have adapted`
✓ `dependencies = ["httpx==0.27.0"]`
reason: without the lifting condition nobody dares upgrade

Unusual steps
✗ `# install dependencies`
✓ `# frozen-lockfile: CI must not rewrite the lock file unnoticed`
reason: what is missing is why it installs this way

A file that cannot take comments
✗ adding `"comment": "do not touch this field"` to `package.json`
✓ write nothing, ask once about a separate document, stop if the user says no
reason: non-standard fields ship as data, and the document is only produced on a yes

Config written as code
✗ `// prettier config` in `prettier.config.mjs`
✓ `/** @type {import('prettier').Config} */` above the exported object, then `// kept in step with the backend template; changes ripple into generated code` above the field
reason: these files are both config and source — value reasoning follows the config rules, while the export takes a block comment so the editor can check its fields
