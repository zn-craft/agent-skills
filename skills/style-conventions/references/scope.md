# Scoping and naming

The test: this style can only take effect inside the component it belongs to.

Take scoping in this order: `xxx.module.css` (CSS Modules), an SFC's `<style scoped>`, component-level wxss, scoped styled components, and only then global CSS with a naming prefix. Whichever the repository uses is the one to follow, never two side by side.

```css
/* Wrong: .card in a global file, and the second page using the same class collides */
.card { padding: 16px; }

/* Right: userCard.module.css inside the userCard directory, reachable only by that component */
.card { padding: var(--space-4); }
```

## A class name says its purpose, not its look

```css
/* Wrong: after the theme turns dark, the class name and its value disagree */
.btn-blue { background: #1d4ed8; }

/* Right: a colour change touches neither the class name nor its references */
.btnPrimary { background: var(--color-primary); }
```

Follow the repository's existing convention: `block__element--modifier` where BEM is in use, lowerCamelCase where that is.

## Inherit and compose before copying

Properties a child inherits anyway (font, colour, line height) are not written again; a change goes on the parent.

```css
/* Wrong: rewritten at every level, so a font change means editing three places */
.card { font-family: var(--font-sans); color: var(--text); }
.cardBody { font-family: var(--font-sans); color: var(--text); }
.cardNote { font-family: var(--font-sans); color: var(--text); }

/* Right: written once and inherited; decoration follows the current text colour */
.card { font-family: var(--font-sans); color: var(--text); }
.cardIcon { color: currentColor; }
```

Reuse a whole rule by composing rather than copying: `composes` in CSS Modules, `@extend %placeholder` or `@include` in SCSS, and in plain CSS the shared part becomes a class in `@layer utilities`.

## Shared classes across components stay few

Once two or more components reference a class it is no longer component styling: it moves to the global layer and is expressed as a variable or a base class.

## Reaching into a child component needs a published exit

```vue
<style scoped>
/* Wrong: a descendant selector punches into the child, and the child's structure change breaks it */
.dialog .title { font-size: 18px; }

/* Right: :deep() is used only on the node that genuinely has to change */
.dialog :deep(.panelTitle) { font-size: var(--font-lg); }
</style>
```

A child component is a scoping boundary for styles. Changing it from outside first means letting it expose a variable or a prop, and only then `:deep()`, aimed at a specific node rather than `.dialog *`.

## Self-check

List the pages that reference this style. When the answer is "this component uses it", it is right; when it is "everything using this class name", it should be split.
