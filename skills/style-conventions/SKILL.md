---
name: style-conventions
description: Style conventions that decide how styles are written: class names and scoping, variables and tokens, selector specificity, layout and breakpoints, themes and states, inline styles, global CSS and file organization. Use when changing component styles, writing CSS Modules, Tailwind or mini program wxss, or tracing overriding values. Does not cover style linter config or visual design review.
---

# Style conventions

One test decides everything: **this style has exactly one place it comes from, and it still holds in another context.** That place is defined by three things — where the value comes from, what it applies to, and where a change would be made. When the answer is not obvious, settle the ownership first and adjust the appearance afterwards. Walk dark mode, hover, disabled, empty data, narrow screens and long copy once each. Styles get no compile-time check, so the flatter the selectors, the closer they sit to their component, and the more central the variables, the less room there is to go wrong.

## Read the existing conventions first

Before writing, establish these in the repository, and follow whatever is already there without inventing a rule anywhere:

- Style approach and file layout: CSS Modules, Vue scoped, Tailwind, CSS-in-JS, wxss or global CSS; styles in one or two files or split per directory.
- Where variables come from and live: `tokens.css`, `theme.scss`, `tailwind.config.js`, or declarations scattered around; split by category or piled into one file.
- Breakpoint values: which widths the existing `@media` rules use, and whether they run min or max.
- Theme mechanism: `data-theme`, `.dark`, `prefers-color-scheme` or something else.
- Component library and design reference: whether the library ships spacing and colour scales that can be reused, and whether there is a design file, design system or UI kit.
- Inline styles: whether the `style` in a template carries a runtime value or a static one.
- Decisions already recorded: whether `skill-memory/style-conventions.md`, another file or a comment states something like "no variable system here", "these three breakpoints only" or "everything goes through this approach". A recorded decision is followed without asking again.

A change of approach is raised on its own rather than migrated on the way past. When something cannot be established, do not fill it in from habit:

- No source of variables: write values the way the code already does and do not open a variables file. When the same kind of value already repeats in three or more places, or this change was going to rescale things anyway, ask once at the end whether to gather them into a set; without that signal, do not raise it.
- No breakpoint convention: reuse the widths existing pages use; finding none, solve it with container queries and fluid sizes first and add no new `@media` step.
- No theme mechanism: follow the system (`prefers-color-scheme`) rather than inventing `data-theme`.

Things the user decides — introducing a variable system, adding a breakpoint step, changing the approach or the organization, touching a component library's own styles — are asked once per session, and the answer is used from then on without asking again. The answer goes into the project's `skill-memory/style-conventions.md`, created when missing, recording only conclusions that outlive the session; it lives in the project, where the next probe reads it, so a new session, a new person or a new tool never asks twice.

Judgement calls and self-checks are yours: apply the default and do not turn it into a question. When a record and the repository disagree, the repository wins and the record is updated.

## Find the rules by category

| Category | What it affects | Rules |
| --- | --- | --- |
| Scoping and naming | Whether a change leaks into other components | [scope.md](references/scope.md) |
| Variables and tokens | How many places one value change touches | [tokens.md](references/tokens.md) |
| Selector specificity | Whether an override is predictable | [selectors.md](references/selectors.md) |
| Layout and spacing | Whether the layout survives longer content or another writing direction | [layout.md](references/layout.md) |
| Responsive and breakpoints | How it behaves on narrow screens and with long copy | [responsive.md](references/responsive.md) |
| Forms and native controls | Whether browser defaults agree | [controls.md](references/controls.md) |
| Theme and states | Whether dark, hover and disabled are complete | [theme.md](references/theme.md) |
| Global styles | Where reset and third-party overrides end | [global.md](references/global.md) |
| File and directory organization | Which file a new style belongs in | [organization.md](references/organization.md) |
| Units and numbers | Scaling, precision and accessibility | [units.md](references/units.md) |
| Print and export | How far the page diverges on paper | [print.md](references/print.md) |
| Inline styles | Whether runtime and static values stay apart | [inline.md](references/inline.md) |
| Where the rules land | How one rule is written in each stack | [stack.md](references/stack.md) |

Read only the files the current task needs.

## Hard constraints

- `!important` is off by default. Where nothing else can win — styles inside a third-party library, inline styles already in a template, page-level overrides in a mini program — it may be used, stating why and which single place it covers.
- Colours, spacing, radii and font sizes reference existing variables; a missing value joins that set rather than opening a parallel scale, and a project without variables follows the probe above.
- When a token is referenced in several places and only one should change, override the local variable the component exposes, or add a finer semantic token, and leave the global value alone; a hard-coded literal carries its reason on the spot.
- Styles go into a stylesheet by default; inline styles carry runtime values only, such as state or data-driven sizes and colours, while static appearance goes back to the stylesheet.
- A global file holds reset, variables, cross-component base typography and shared logic such as utility classes and reused mixins, never a rule aimed at `div`, `span` or `a` alone; component-private styles stay with the component.
- No `#id` for positioning, no selector nested more than three deep, and no extra condition where one class would do.
- A component library's own styles are used as they come; where a design differs, work through its published exits one level at a time rather than editing internal class names.
- With a design file, design system or UI kit, its sizes, spacing, colours and states are the source; a value outside the existing scale is added to the scale with a note rather than hard-coded. Whether the design is good is not yours to judge.

## How to report the change

State which categories and variables moved, and whether narrow screens, dark mode and keyboard focus are covered; when `!important` was used or a variable was missing, say why. With a preview available, run it before drawing a conclusion; without one, write "not verified by rendering" and list what a human has to check, never describing unverified work as passing.
