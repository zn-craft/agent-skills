# Variables and tokens

The test: changing a brand colour or a spacing scale touches the token definitions only.

With no token system in place, do not build a three-layer structure for one change and do not open a variables file to look complete: write values the way the code already does and list the values used in the explanation. Whether they should be gathered into a set is decided by the probe in the main file; once asked, the conclusion goes into `skill-memory/style-conventions.md`. Colour and spacing values from a design file look for a matching semantic token first, and a missing one joins the scale rather than being copied into the component as a literal.

## Three layers

| Layer | Example | Who references it |
| --- | --- | --- |
| Raw value | `--blue-600: oklch(0.55 0.2 264)` | Only the semantic layer |
| Semantic | `--color-primary: var(--blue-600)` | Components and pages |
| Local | `--btn-bg: var(--color-primary)` | Inside the component, allowed to be overridden from outside |

```css
:root {
  /* Raw values: each appears once in the whole project */
  --blue-600: oklch(0.55 0.2 264);
  /* Semantic: the name states the purpose, not the colour */
  --color-primary: var(--blue-600);
  /* Scales: one each for spacing, radius and type size */
  --space-4: 16px;
  --radius-sm: 4px;
}
```

Skipping a layer loses two things at once: that a rebrand can swap the colour, and why this particular blue is here.

## Components reference the semantic layer only

```css
/* Wrong: three magic values, and one change means searching for the hex code everywhere */
.tip {
  color: #dc2626;
  border: 1px solid #dc2626;
  padding: 11px;
}

/* Right: tokens only */
.tip {
  color: var(--color-danger);
  border: 1px solid var(--color-danger);
  padding: var(--space-3);
}
```

Do not turn a scale value into a component-specific `--tip-padding: 11px`; a component-private variable is for the values that genuinely get adjusted from outside.

## Expose one variable to the outside

```css
.btn { --btn-bg: var(--color-primary); background: var(--btn-bg); }
```

A consumer writes `.toolbar .btn { --btn-bg: var(--color-neutral); }`. No more than three or four exposed variables; beyond that the internals are public.

## When only one place should change

A token referenced elsewhere changes every reference when its value changes. Work out which case this is first:

- Only this one place differs: leave the token alone, override the local variable the component exposes, or pass a value that fits the context at the call site.
- One token serves two kinds of use: the granularity is wrong, so split it into two semantic tokens, keeping a link colour apart from a danger colour.
- Every reference should follow: this is the case for editing the token definition.

```css
/* Right: only this button changes colour; the global --color-primary stays put */
.dangerZone .btn { --btn-bg: var(--color-danger); }
```

With no token to hang it on and a literal as the only option, note the reason on that line.

## Naming

`--<category>-<purpose>[-<state>]`, with categories limited to color, space, font, radius, shadow, motion and z, and states to `hover`, `active` and `disabled`. One name means one thing project-wide: `--primary` and `--color-primary` never coexist.

## Store them split by category

One file per category, so a colour change opens the colour file instead of scrolling a long one:

```text
styles/tokens/
  color.css       /* raw scales and semantic colours */
  space.css       /* spacing scale */
  font.css        /* family, size, line height, weight */
  radius.css
  shadow.css
  motion.css      /* durations and easing */
  z.css           /* stacking layers */
  index.css       /* @import only */
```

Category names match the naming prefix, and a new category gets a new file. With only a few dozen variables a single `tokens.css` with section comments is enough; split once it runs past a screen.
