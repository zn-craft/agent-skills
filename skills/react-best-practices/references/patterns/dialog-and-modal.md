# Case: dialogs, modals and drawers

Applies to confirmation dialogs, form dialogs, drawers and dialogs with async actions.

## Choose how it is controlled

- **Controlled**: the parent holds `open` and receives close requests through `onOpenChange`. Fits page flows, route state and control from an outside button.
- **Uncontrolled**: the component manages its own visibility, with the caller supplying an initial value or a trigger. Fits simple, self-contained display components.
- **Imperative ref**: only where a library or a scenario clearly needs an `open()` or `close()` API; not the default way to manage state.

## Recommended decisions

1. The overlay only displays and handles generic interaction; business actions such as submitting or deleting belong to a business component or Hook.
2. Closing behavior is explicit: backdrop click, Escape, the close button and whether closing is allowed mid-submit are product decisions.
3. A modal dialog manages focus properly, moving focus in, keeping it inside, and restoring it to the trigger on close.
4. A non-modal popover or tooltip is not a dialog and must not inherit a focus trap.
5. An async submit distinguishes idle, submitting, success and error; duplicate submits are blocked and the user can recover from a failure.
6. Whether several overlays may be open at once, and what happens to a child dialog when its parent closes, is a stated policy.
7. Use a proven dialog or drawer library rather than simulating full accessibility from `role="dialog"` alone.

## A Props sketch

```tsx
interface IDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}
```

This is a controlled interface, not a full dialog implementation. A complete component also handles the portal, focus, keyboard, scroll locking, ARIA and SSR compatibility.

## Common mistakes

- One modal component carrying every business action and every business field.
- Combining boolean Props until the dialog types become unreadable.
- No definition of whether form state is cleared when the dialog closes.
- Handling only the visual close, without restoring focus or keyboard operation.
- Treating popovers, menus, tooltips and modal dialogs as one kind of overlay.
