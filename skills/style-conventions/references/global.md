# Global styles

The test: every line in global scope reaches every page, so it has to hold for all of them.

```css
@layer reset {
  :where(*, *::before, *::after) { box-sizing: border-box; }
  :where(body, h1, h2, h3, p, figure, blockquote) { margin: 0; }
  :where(img, svg, video) { display: block; max-width: 100%; }
}

@layer base {
  :where(body) {
    font-family: var(--font-sans);
    line-height: 1.5;
    color: var(--text);
    background: var(--surface);
  }
}
```

A reset stays a minimal set, sits inside `@layer reset`, and uses `:where()` throughout.

```css
/* Wrong: a wildcard carrying a transition, and a section's styles in the global
   file, so one line worries every page */
* { transition: all 0.2s ease; }
.sidebar .menu li a { color: #333333; }

/* Right: component styles stay with the component, and global handles base typography */
.sidebarNav { color: var(--text-muted); }
```

## Shared logic in one place

```css
/* Right: utility classes shared by several components live in a shared file, not in each of them */
@layer utilities {
  .visuallyHidden { position: absolute; clip-path: inset(50%); }
  .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
}
```

Styles used by two or more components and tied to no specific business meaning, such as truncation, visual hiding or a skeleton fill, go into a shared file; a style serving one component follows that component. SCSS mixins and `%placeholder` work the same way, and one mixin name does not get rewritten in every component.

## Component libraries and third-party code get their own layer

```css
/* Right: only the variables it publishes, never its internal class names */
@layer vendors {
  :root { --swiper-theme-color: var(--color-primary); }
}
```

A library's own spacing, colours and radii are used as they come. Where a design differs, work down its exits one level at a time: theme configuration, then a component prop, then variables wrapped on a container. Only when all three fail do you write a scoped selector, and never edit an internal class name such as `.swiper-button-next`, which breaks on the next upgrade.

## Self-check

Search the global files for class names. What turns up should be base classes such as `body` and `.container`, plus third-party variable names; a component name showing up means it belongs back in the component.
