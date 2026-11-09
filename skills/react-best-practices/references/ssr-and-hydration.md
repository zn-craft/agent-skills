# SSR / SSG and hydration

**Scope:** server rendering, static generation and client hydration. A plain CSR project does not need this file. RSC is a different execution model, covered in [server-components.md](server-components.md).

## Environment boundaries

- Module scope that may run on the server, component render and state initializers cannot read browser APIs such as `window`, `document`, `navigator`, `localStorage` or `matchMedia`.
- `"use client"` marks a client module boundary; it does not guarantee the component only runs in the browser, since the framework may still pre-render it on the server.
- Browser state read on the client uses an Effect, a dynamic import or `useSyncExternalStore` by meaning, with a consistent initial value or server snapshot.
- React DOM 19.3's `browser()` lets a component opt out of server rendering through `use(browser())`; on the server it triggers the fallback of the nearest Suspense boundary. Keep it for the cases that genuinely cannot produce server UI, and do not let it replace the design that serves stable initial HTML.

## Hydration consistency

- The server HTML and the first client render must agree. When a hydration mismatch appears, work out why the two outputs differ before changing anything.
- Avoid differences from random numbers, the current time, a client locale, browser dimensions or unsynchronized external data in the first render.
- Share initial data through the framework's serialization or data-passing mechanism, and give an external store a consistent server snapshot.
- Generate stable ids across SSR and hydration with `useId`, never with a random value or a timestamp.
- Rendering a placeholder on the server and switching to client content in an Effect adds a render pass; keep it for cases that need it and accept the cost.

When a density preference exists only in the browser, for example, both the server render and the first client render use the default, and the stored value is restored after mount.

```tsx
"use client";

import { useEffect, useState } from "react";

const DensityLabel = () => {
  const [density, setDensity] = useState<"normal" | "compact">("normal");

  useEffect(() => {
    let saved: string | null;
    try {
      saved = window.localStorage.getItem("table-density");
    } catch {
      return; // Storage unavailable: keep the default.
    }
    if (saved === "compact") setDensity("compact");
  }, []);

  return <span>{density === "compact" ? "Compact" : "Standard"}</span>;
};

export { DensityLabel };
```

## Data and diagnosis

- Prefer the framework's data loading, route loaders or caching over splitting data that the server could fetch in parallel into a client-side waterfall of Effects.
- Serialize only what the client genuinely needs; no keys, internal credentials or large useless objects.
- Diagnosing a mismatch starts by comparing the data and branches of the server HTML and the first client render, then checking environment checks, time and random values, locale, missing stable initial data, invalid HTML nesting and third-party scripts.
- Streaming SSR, caching, request isolation and deployment belong to the framework and runtime; an ordinary component does not call `react-dom/server` top-level APIs on its own.
