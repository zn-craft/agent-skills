# React Server Components and Server Functions

Read this only where the project has deliberately adopted RSC or Server Functions and its framework supports them. It is not a general SSR guide.

## Execution model

- **SSR** renders the React tree to HTML, which the client usually hydrates.
- **Server Components (RSC)** run in a separate server or build environment and may reach the data layer there; they are not SSR, and they do not become interactive client components on their own.
- **Client Components** carry client interaction and state; the framework defines the client boundary, and they may still take part in server pre-rendering.

## The server / client boundary

- Follow the framework's module boundary by default and avoid enlarging the client bundle for no reason.
- A Server Component fetches server data and passes serializable data or nodes on to Client Components.
- A Client Component does not import a database, a filesystem module or a module holding secrets that can only run on the server.
- Event handlers, browser APIs and client Hooks live in Client Components; do not mark a whole page as client-side for one interaction.
- React 19.3 renders Context imported from a client module inside Server Components; Server Components still cannot create Context themselves, and what the framework supports decides in practice.

## Server Functions / Actions

- A Server Function marked `"use server"` has a call boundary created by the framework; calling it from the client issues a network request rather than a local function call.
- Treat a Server Function as a server entry point anyone can trigger: it re-validates input on the server, performs authentication and authorization, and trusts no user id or permission field sent by the client.
- No keys, internal data or errors that should not be public are exposed to the client; duplicate submissions, failures and data consistency are handled.
- `useActionState` and `useOptimistic` are React Hooks that take part in client actions and transitions; they are not server-only APIs.
- Server Functions, form actions, caching and revalidation depend on framework integration; read the current framework version's documentation instead of assuming the protocol underneath.

Renaming a project is owner-only in the example below. The client supplies the project id and the new name, and the caller's identity comes from the server session.

```ts
"use server";

import { getSessionUser } from "./session";
import { updateProjectName } from "./projects";

export async function renameProject(projectId: unknown, name: unknown) {
  if (typeof projectId !== "string" || !projectId.trim() || typeof name !== "string") {
    return { ok: false, error: "invalid input" };
  }
  const title = name.trim();
  if (!title || title.length > 80) return { ok: false, error: "invalid name length" };

  const user = await getSessionUser();
  if (!user) return { ok: false, error: "sign in first" };

  const updated = await updateProjectName({ projectId, ownerId: user.id, title });
  return updated ? { ok: true } : { ok: false, error: "project could not be updated" };
}
```

`updateProjectName` matches the project id and the owner id in the same write and reports whether a row was updated. A missing resource and a permission failure share one outward error.

## A safety note

Server code is not automatically safe. Every data access performs authorization, every external input is validated, and hiding a button is never a substitute for server-side permission checks. Watch the security advisories for the framework and the React Server Components packages, and upgrade affected versions promptly.
