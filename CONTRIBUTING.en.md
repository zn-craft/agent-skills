[中文](CONTRIBUTING.md) | [English](CONTRIBUTING.en.md)

# Contributing

## Adding a skill

```bash
node scripts/new-skill.mjs my-skill --resources references,scripts
node scripts/validate-skills.mjs
```

`new-skill.mjs` copies the scaffold from `templates/skill` into `skills/my-skill/` and `zh/my-skill/` and substitutes the name and description. You can also create both trees by hand as long as the structure matches.

When you are done:

1. `node scripts/validate-skills.mjs` reports zero errors, per language version.
2. `node scripts/score-skills.mjs skills/<skill-name>` scores 8.5 or above, per language version.
3. Register the skill in `README.md` and `README.en.md`: `README.md` copies the Chinese `description` and `README.en.md` the English one. If you change a `description` later, update both tables with it.
4. Open a pull request. CI runs the same validation and scoring.

`CONTRIBUTING.en.md` is the English counterpart of `CONTRIBUTING.md`, just as `README.en.md` is the English counterpart of `README.md`. Change both files of a pair together, never just one.

## What makes a good skill

- **`description` decides when the skill gets picked**: state what it does and when to use it, include the phrases that should trigger it, and do not turn it into a capability list.
- **Keep the two languages in step**: `skills/<name>/` holds the English version, which is what this project promotes, and `zh/<name>/` the Chinese one used for writing and proofreading. Creating, changing, or deleting anything on one side means the same change on the other, in the same commit; each `description` is written in its own language, and both README tables follow.
- **The body carries only non-obvious information**: the target agent is already capable, so skip generic advice, restated policies, and filler steps.
- **Progressive disclosure**: keep `SKILL.md` short, move long documents into `references/`, and say in the body when to read them.
- **Use `scripts/` for repeated or error-prone steps** instead of rewriting them each time.
- **Self-contained**: everything a skill directory uses has to be installed along with it.
- No `README.md`, changelog, or similar extra documents inside a skill directory.
- No symlinks; the official Codex installer rejects skills that contain them.

## Directories and naming

```text
skills/<skill-name>/        English, indexed by installers and directories by default
├── SKILL.md                required
├── agents/openai.yaml
├── scripts/
├── references/
└── assets/

zh/<skill-name>/            Chinese, the source used for writing and proofreading
```

- Names use lowercase letters, digits, and hyphens, up to 64 characters, and both trees use the same directory names.
- The English version's `name` is the skill name; the Chinese one is `<skill-name>-zh`.
- Both trees stay flat and mirror each other file for file; validation warns where they diverge.
- `skills/<skill-name>/SKILL.md` and `zh/<skill-name>/SKILL.md` are the install contract: before changing either, confirm the install scripts and the directories that index this repository still work.
- Scripts under `scripts/` that grow past roughly 300 lines (or 15 KB) get split the way `js-module-structure` divides work: the entry point `scripts/<name>.mjs` keeps its path, the implementation moves into `scripts/<name>/`, and constants and methods each get their own file.

## After changing the install scripts

`install-skill.sh` and `install-skill.ps1` are two equivalent entry points. Change them together and verify each one:

```bash
bash scripts/install-skill.sh <skill-name> --agent codex --dest /tmp/agent-skills-test
bash scripts/install-skill.sh <skill-name> --agent claude --global --lang zh
bash scripts/install-skill.sh <skill-name> --agent claude --project
```

```powershell
.\scripts\install-skill.ps1 <skill-name> -Agent codex -Dest $env:TEMP\agent-skills-test
.\scripts\install-skill.ps1 <skill-name> -Agent claude -Global -Lang zh
.\scripts\install-skill.ps1 <skill-name> -Agent claude -Project
```

Confirm these before committing:

- `--global` / `-Global` lands in `$<NAME>_HOME/skills` (or `~/.<name>/skills` when that variable is unset), and `--project` / `-Project` lands in `./.<name>/skills` under the current directory.
- `--dest` / `-Dest` points at a directory directly and is mutually exclusive with `--global`/`--project`; with neither given, the script must exit with an error instead of falling back to a default agent.
- `--lang` / `-Lang` accepts only `en` or `zh`, and prefers the English version when omitted; with neither version present it fails and lists what can be installed.
- The installed directory is complete: `SKILL.md` plus that language version's own `agents/`, `references/`, and `scripts/`. English comes from `skills/<name>/` and Chinese from `zh/<name>/`, installed as `<name>` and `<name>-zh`.
