# Themes and states

The test: switch the theme to dark and tab focus onto a control, and every component is still complete. Whatever is missing is a state that was never written.

## Theme values live only where tokens are overridden

```css
:root {
  color-scheme: light dark;
  --surface: light-dark(#ffffff, #111827);
  --text: light-dark(#111827, #f9fafb);
}

/* Right: a manual switch overrides variables only, leaving components untouched */
[data-theme="dark"] {
  color-scheme: dark;
  --surface: #111827;
  --text: #f9fafb;
}
```

The default theme follows the system (`prefers-color-scheme` or `light-dark()`), a manual switch uses `data-theme` on the root, and no other mechanism is added. Components know only semantic variables such as `var(--surface)`, never a branch like `.dark .card`, which the next new component will miss.

## Complete the interaction states from the list

| Component | States it needs at least |
| --- | --- |
| Buttons, links | `:hover`, `:focus-visible`, `:active`, `:disabled` |
| Inputs | `:focus-visible`, `:disabled`, `:read-only`, an error state |
| Controls with async work | A loading state (`isLoading`), plus success and failure messages |
| Lists and tables | Empty data, a single row, very long text |

States are expressed as class names (`isLoading`, `hasError`), never inferred from `:nth-child` or a sibling selector.

## The list applied to one component

```css
/* Right: one button covers the list, with every colour coming from semantic tokens */
.button {
  background: var(--color-primary);
  color: var(--color-on-primary);
  border-radius: var(--radius-sm);
  padding: var(--space-2) var(--space-4);
}
.button:hover { background: var(--color-primary-hover); }
.button:active { background: var(--color-primary-active); }
.button:focus-visible { outline: 2px solid var(--color-focus); outline-offset: 2px; }
.button:disabled,
.button.isLoading { opacity: 0.6; cursor: not-allowed; }
```

A dark theme swaps the variables on `:root` and rewrites none of this; a missing state adds one line from the list.

## Focus and motion

```css
/* Wrong: removing the focus ring leaves keyboard users with no idea where they are */
.button:focus-visible { outline: none; }

/* Wrong: transitioning everything animates a colour change and anything else along with it */
.card { transition: all 0.2s; }

/* Right: only the properties meant to move */
.card { transition: background-color 0.2s; }

@media (prefers-reduced-motion: reduce) {
  .card { transition: none; }
}
```

Never remove a focus ring with `outline: none`; a custom one replaces it with a visible border or shadow. Transitions name specific properties, and a user who asks for reduced motion gets them turned off.
