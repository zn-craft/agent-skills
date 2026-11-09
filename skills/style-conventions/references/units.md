# Units and numbers

The test: the layout behaves predictably once the user raises the browser font size or the mobile address bar collapses.

## Font sizes and spacing use relative units

```css
/* Right: the type size follows the user's setting, and the border does not thicken with it */
.title { font-size: 1.25rem; }
.card { padding: var(--space-4); border: 1px solid var(--border); }
.icon { width: 1em; height: 1em; } /* the icon scales with the text around it */
```

Font sizes use `rem` so they follow the browser setting; `em` is for what scales with the surrounding text, such as icons and padding tied to type. Spacing uses tokens, whose values may well be written in `px` from the design file, while components only ever show `var(--space-*)`. `px` is left for what must not scale: a 1px border, a hairline, a bitmap size.

## Viewport units have to be the dynamic ones

```css
/* Wrong: 100vh on mobile gets cut off by the address bar */
.sheet { height: 100vh; }
/* Right: the dynamic viewport unit follows the visible area */
.sheet { max-height: 80dvh; }
```

Widths express relationships through `%`, `min()` and `max()` first; a width measured in characters, such as an input, uses `ch`, for example `max-width: 32ch`.

## Keep one way of writing colours

```css
/* Wrong: keywords mixed with rgba, so a theme change edits both formats */
.tag { color: red; background: rgba(0, 0, 0, 0.06); }
/* Right: one format throughout */
.tag { color: var(--color-danger); background: oklch(0% 0 0 / 6%); }
```

A new project uses `oklch()` throughout, an existing one keeps its hex values, and neither adds a third format; colour values live in tokens and no literal appears in a component.

Transparency keeps the same syntax (`oklch(… / 6%)`, `rgb(… / 0.06)`), and mixing two colours uses `color-mix()`. Changing format is noted with its reason, and two formats coexisting is allowed only where tokens are defined.

## Numbers return to the scale

Values that are not on the scale, such as `3.7px`, `11px` or `13px`, are checked first for whether `var(--space-3)` or `clamp()` is what was meant. Ratios, line heights and `letter-spacing` use unitless numbers or `em`, never `px`.

## Finishing

Look once at a 200% browser font size and once at 150% system zoom, with no truncation or overlap; without a rendering environment, leave both to a human to check.
