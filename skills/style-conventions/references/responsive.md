# Responsive and breakpoints

The test: one look at a narrow screen and one at a wide screen is enough to judge it, without probing every step in between.

## Breakpoints follow the existing ones

Copy the widths the repository already uses, keep new components to those steps, and match the direction existing code takes, either all `width >= 640px` or all descending. Mixing directions leaves gaps nobody tests. A genuinely new step follows the probe in the main file, asked once, with the answer recorded in `skill-memory/style-conventions.md`.

## Components respond to their container first

```css
/* Right: the component looks only at its own width, so a sidebar or a drawer needs no change */
.panel { container-type: inline-size; }

@container (width < 420px) {
  .panelActions { flex-direction: column; }
}
```

A component that lands in containers of different widths uses container queries; viewport breakpoints are for the page-level grid.

## Keep breakpoints within three steps

```css
@media (width >= 640px) { .grid { grid-template-columns: repeat(2, 1fr); } }
@media (width >= 1024px) { .grid { grid-template-columns: repeat(3, 1fr); } }
```

Past three steps the layout is being tuned pixel by pixel, and `repeat(auto-fit, minmax(...))`, `flex-wrap` or `clamp()` is the answer instead. Before adding a step, check whether some fixed width is the real cause.

## Fluid sizes replace the steps in between

```css
.title { font-size: clamp(1.125rem, 1rem + 1vw, 1.5rem); }
.section { padding-inline: clamp(var(--space-4), 5vw, var(--space-8)); }
```

The middle value in `clamp()` is the transition, and both ends must come from tokens.

## One component from narrow to wide

```css
/* Right: the card stacks in a narrow container and splits into two columns in a
   wide one, with fluid sizes covering the steps in between */
.card {
  container-type: inline-size;
  display: grid;
  gap: var(--space-3);
  padding-inline: clamp(var(--space-4), 5vw, var(--space-6));
}

.cardMedia { aspect-ratio: 16 / 9; }

@container (width >= 480px) {
  .card { grid-template-columns: 160px 1fr; align-items: start; }
  .cardMedia { aspect-ratio: auto; block-size: 100%; }
}

.cardTitle { font-size: clamp(1rem, 0.9rem + 0.6vw, 1.25rem); }
```

Going from narrow to wide changes only the column count, while the type size and padding vary continuously, with no extra breakpoint in between.

## Finishing

Look once at 320px and once at 1440px, then bump the browser font size to 125% and look again.
