# Selector specificity

The test: one look at a selector tells you whether it can override the target style.

## Let @layer decide the order

Declare the layer order once and who overrides whom is settled, without fighting through selectors.

```css
/* The order is stated in one place, and each layer then keeps to itself */
@layer reset, tokens, base, vendors, components, utilities;

@layer reset {
  /* :where() has 0-0-0 specificity, so a component always wins over it */
  :where(h1, h2, h3, p) { margin: 0; }
}
```

`!important` reverses the layer order, letting an earlier layer beat a later one. Layers do not use it to win.

Older engines without `@layer` (some mini program webviews, old browsers) use import order plus `:where()` instead.

## Keep selectors flat

```css
/* Wrong: 0-3-1, so the next person can only pile on specificity and !important */
.page .card > div .title { color: #1d4ed8; }

/* Right: 0-1-0, and a variant adds one more class */
.cardTitle { color: var(--color-link); }
```

More than two classes, or hierarchy described through parent-child structure, usually means the structure is deciding whether a rule applies; that decision belongs in a class name. A child that genuinely only makes sense inside its parent follows the nesting rule below.

## Nest only states and strongly bound children

```css
/* Right: states hang off the base class, keeping the logic together */
.btn {
  color: var(--color-text);
  &:hover { color: var(--color-link); }
  &.isLoading { opacity: 0.6; }
}

/* Right: decoration that only holds inside the card nests one level */
.card {
  color: var(--color-text);
  .cardIcon { color: currentColor; }
}

/* Wrong: indenting the whole structure compiles to .menu .item .link, and the
   specificity climbs on its own */
```

When a child is also used on its own elsewhere, it gets its own class instead of being indented under the parent. Structurally, at most two levels of parent > child survive, plus a pseudo-class or modifier, keeping the whole chain within three; deeper than that means the component should be split or a responsibility sits in the wrong place.

## Three exits for overriding

Try them in order: add a modifier class, use a variable the component exposes, then move into a higher `@layer`. If none works, the style's ownership is wrong and the structure needs fixing. When what has to be overridden is out of reach, such as a library's internal styles or an inline style, the exception in the hard constraints applies: use `!important` and state why.
