# File and directory organization

The test: a new style can be placed in a named file immediately. When it cannot, the organization is not settled yet, and settling it comes before writing.

## Pick a size

| Size | Organization | Fits |
| --- | --- | --- |
| One layered file | A single `styles.css` separated by `@layer` or section comments | A single page with few components |
| Files by role | `styles/` holding reset, tokens, base, utilities and vendors, with component styles following their component | Ordinary projects |
| Slices by feature | Each feature directory carries its own styles and token overrides | Many modules, many people |

Splitting by role looks like this:

```text
src/
  styles/
    reset.css
    tokens/           /* one file per category: colour, spacing, font, radius, shadow, z */
    base.css          /* default element typography */
    utilities.css     /* utility classes and shared snippets */
    vendors.css       /* third-party overrides, touching only published variables */
  components/
    Button/
      Button.module.css
  pages/
    Home/
      Home.module.css
```

Component styles live in the component directory and `styles/` keeps only what crosses components. Swapping `.module.css` for a Vue scoped `<style>`, a `.wxss` file or a Tailwind entry file changes nothing about the placement.

## Where one new style goes

```css
/* Spacing between a card header and its title: this component only, so it follows the component */
/* components/userCard/userCard.module.css */
.cardHeader { display: flex; gap: var(--space-2); }

/* Truncation: shared by three components and tied to no business meaning, so it goes to shared snippets */
/* src/styles/utilities.css */
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* Flattening a library's radius: through the variable it publishes, so it goes to the vendor layer */
/* src/styles/vendors.css */
:root { --el-border-radius-base: var(--radius-sm); }
```

The order of the decision: is it this one component's, do several components share it, and only then does a third-party exit come into it.

## Keep shared and private apart

Every rule in a shared file should be able to name who uses it; when it cannot, it sits in the wrong place.

## Changing the organization

Whether to change follows the probe in the main file, asked once and recorded in `skill-memory/style-conventions.md`. Migrate one kind at a time: tokens first, then shared snippets, and component styles last; stopping halfway leaves two paths and no one knows which to use.
