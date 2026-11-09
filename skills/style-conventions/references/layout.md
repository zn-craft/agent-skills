# Layout and spacing

The test: double the content and cut the items to a third, and the layout stays where it was.

## flex for one dimension, grid for two

```css
/* Right: the parent container owns the spacing through gap */
.toolbar { display: flex; align-items: center; gap: var(--space-2); }

/* Right: column width follows the container instead of a hard-coded count */
.gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: var(--space-4); }
```

Use grid for a two-dimensional layout and for even division and alignment; assembling a page from `float` plus margins is no longer needed.

## Spacing belongs to the parent container

```css
/* Wrong: spacing stitched from child margins, leaving a trailing gap that
   misaligns once items wrap */
.toolbar > button { margin-right: 8px; }

/* Right: the parent states it once, and adding or removing children changes nothing */
.toolbar { gap: var(--space-2); }
```

Write `margin` on the element itself only to separate it from a sibling, such as the vertical rhythm between paragraphs.

## Direction-aware values use logical properties

```css
/* Wrong: hard-coded left and right, so Arabic and Hebrew cannot mirror the page */
.alert { padding-left: var(--space-4); border-left: 3px solid var(--color-warning); }

/* Right: follows dir, so one implementation holds in both writing directions */
.alert { padding-inline-start: var(--space-4); border-inline-start: 3px solid var(--color-warning); }
```

Spacing, borders and positioning always use logical properties: `padding-inline`, `margin-block-end`, `inset-inline-start`. A physical direction is written as `left` or `right` only when that is genuinely meant, such as a decoration pinned to one side, and then with a `[dir="rtl"]` override.

## Leave room in the sizes

```css
/* Wrong: a flex child sized by its content, and long text pushes the row out */
.toolbarSearch { flex: 1; }
/* Right: allowed to shrink, and long words wrap */
.toolbarSearch { flex: 1 1 auto; min-width: 0; overflow-wrap: anywhere; }

/* Wrong: a fixed height holding text truncates as soon as the font or copy grows */
.cardTitle { height: 24px; }
/* Right: a floor to fall back on, with the ceiling left to the content */
.cardTitle { min-height: 1.5em; }
```

Horizontal overflow starts by checking `min-width` rather than reaching for `overflow: hidden`; a text container gets `min-height`, never a fixed `height`.

## Take z-index from tokens

```css
:root {
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-modal: 300;
  --z-toast: 400;
}
```

Overlays take their values from this set instead of writing `9999` in a component, and a new layer adds one token.
