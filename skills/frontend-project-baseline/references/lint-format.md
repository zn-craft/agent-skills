# Formatting and static analysis

The boundary: formatting decides what code looks like (indentation, quotes, line breaks) while static analysis finds suspicious code (an unhandled promise, hook dependencies, a dubious comparison). Format first and lint second; the other order lets style rules leak into lint and leaves you disabling them one by one when the formatter arrives.

## Two routes

| Route | Makeup | Fits | Cost |
| --- | --- | --- | --- |
| Combined | ESLint (flat config) with Prettier | Needing framework-specific or custom rules | Two sets of config and ignore files, plus the occasional rule turned off because the two disagree |
| Single tool | Biome | New projects, basic rules only, speed matters | A smaller rule set, and an unusual framework means writing your own |

The combined route is the default. Biome is for when no framework-specific rules are needed and maintaining two configs is not worth it, with formatting handed to it as well.

## Style checking

CSS, SCSS and Less use stylelint on their own. Prettier only decides what the styles look like; it knows nothing about unknown properties, duplicate selectors or `!important` abuse.

| Project | Config |
| --- | --- |
| Plain CSS | `stylelint-config-standard` |
| SCSS or Less | `stylelint-config-standard-scss`, or the Less variant, with `customSyntax` |
| Vue or Svelte single-file components | Add `postcss-html` so stylelint can reach the `<style>` blocks |

Build output and third-party styles are excluded through `ignoreFiles`. Where stylelint's stylistic rules fight Prettier, turn those rules off and leave formatting to Prettier. A repository with no style files skips this item rather than configuring something unused.

## Layering the rules

| Level | What goes there | Examples |
| --- | --- | --- |
| error | Will cause a runtime failure or a clear defect | `react-hooks/rules-of-hooks`, `no-floating-promises` |
| warn | Consistency, or suspicious but possibly deliberate | Unused variables, `no-console` |
| Off | Handled by the formatter or the type system | `indent`, `quotes`, `no-unused-vars` |

The test: would the problem this rule reports reach the user as an error? If yes it is an error, and if it merely looks wrong it is a warning. Switching everything to error at once is the most common way this fails, and it ends with someone adding a disable or with a stuck pull request nobody dares merge.

## Configuration points

- Build output, generated code and lock files are always ignored; generated code is fixed by fixing the generator.
- With Prettier, `eslint-config-prettier` goes last in extends.
- A type-aware rule such as `no-floating-promises` needs `project` and pays for it in speed, so it runs in CI.
- Tests, scripts and config files are handled by overrides rather than patched with disables.
- A line-level disable states its reason: `// eslint-disable-next-line no-console -- startup logging`.

## Commands

| Command | Effect | Where it runs |
| --- | --- | --- |
| `lint` | The full check | CI |
| `lint:fix` | Fixes what it can | Locally |
| `format` | Formats everything | Locally |
| `format:check` | Checks without writing | CI |
| `stylelint` | The full style check | CI |
| `stylelint:fix` | Fixes what it can in styles | Locally |

`format:check` is mandatory, or formatting never reaches CI and relies on everyone locally. `stylelint` is only needed where the project has style files, and its command name stays `stylelint` rather than becoming `css-lint`, since CI and the hooks call it by name. A repository carries `.vscode/settings.json` and `extensions.json` for format-on-save and recommended extensions, not personal preferences.
