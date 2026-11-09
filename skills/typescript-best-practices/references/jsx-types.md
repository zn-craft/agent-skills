# JSX and component types

Covers how Props, events, refs and generic components are typed in `.tsx`. How components are split, where state lives and how rendering behaves follow the React conventions in the project; this file is types only.

## Props and component types

- Props are object contracts and follow the other object type rules: `interface`, named `I` + component name + `Props` (`IUserCardProps`). Only mutually exclusive states turn into a `type` union.
- Declare `children` only when the component genuinely takes content, typed `React.ReactNode`.
- When wrapping a component library, reuse the Props, event and ref types the component publishes. When the library exports no Props type of its own, take it from `React.ComponentProps<typeof Button>` and expose only the attributes the wrapper actually supports.
- When wrapping a native element, take the type from the tag: `React.ComponentPropsWithoutRef<"button">` without ref forwarding, `React.ComponentPropsWithRef<"button">` with it.
- Mutually exclusive modes are expressed as a discriminated union rather than an assortment of optional Props that can spell an illegal state.
- Function parameters are typed as Props while the return type is inferred; `React.FC` is not a broken API, so existing code is not rewritten in bulk for style preference.

```tsx
interface IAlertProps {
  children: React.ReactNode;
  kind: "text" | "action";
  text?: string;
  onConfirm?: () => void;
}

// Mutually exclusive states become a discriminated union, so a caller cannot
// pass text and onConfirm at the same time. This one is a type alias over a
// union, so it takes no I prefix.
type StrictAlertProps = { children: React.ReactNode } & (
  | { kind: "text"; text: string }
  | { kind: "action"; onConfirm: () => void }
);
```

## Events

- Callback Props state their signature, such as `(id: string) => void`, never `Function` or `any`.
- Event types follow the actual callback. When a component library hands the selected value straight to the callback, keep its signature; only a native input's change uses `React.ChangeEvent<HTMLInputElement>`.
- When the component library declares its own event type, use it instead of writing an approximate one.

```tsx
interface ISearchProps {
  onKeywordChange: (keyword: string) => void;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
```

## refs

- A DOM ref uses the exact element type and a `null` initial value: `React.useRef<HTMLInputElement>(null)`, never `any`.
- A component library may expose a DOM node or a custom handle such as `focus` or `scrollTo`; the published declaration decides.
- Confirm the React version in use before forwarding refs or using Fragment refs, since the typing differs between versions.

```tsx
const inputRef = React.useRef<HTMLInputElement>(null);

const focusInput = (): void => {
  inputRef.current?.focus();
};
```

## Generic Props

Reach for generics when the caller's data type has to constrain several Props at once. A list component whose `items` and `onSelect` share one element type is the typical case; a single concrete type is written as that concrete type.

```tsx
interface ISelectProps<T> {
  items: readonly T[];
  onSelect: (item: T) => void;
  renderLabel: (item: T) => string;
}

const Select = <T,>({ items, onSelect, renderLabel }: ISelectProps<T>) => {
  return <ul>{items.map((item) => <li key={renderLabel(item)} onClick={() => onSelect(item)}>{renderLabel(item)}</li>)}</ul>;
};
```
