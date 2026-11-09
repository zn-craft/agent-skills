# Case: narrowing an API response

Applies to the path that fetches from the backend, stores into frontend state and renders, where the caller does not control the response shape. When this side generates the types and the shape is stable (GraphQL codegen and the like), use the generated types as they are and do not hand-write a second schema; one-off scripts and local mocks do not need this layer of checking.

| Decision point | Approach | Criterion |
| --- | --- | --- |
| Where data enters the type system | At the request layer, starting from `unknown` | The earlier it narrows, the fewer assertions downstream |
| What validates | A schema or a hand-written type guard | Choose a schema when the check is reused across modules |
| Where the type comes from | Derived from the schema | A second hand-written interface drifts from the backend sooner or later |
| Where validation runs | Once, at the entry point | Narrowed data is used directly downstream, without checking again whether a field exists |
| How failure is expressed | `Result` when recoverable, a throw when not | Never return a half-built object for the caller to guess about |
| Pagination and lists | A separate `IPageResult<T>` | Do not stamp pagination fields onto every entity |

## Case

```ts
import { z } from "zod";

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.enum(["admin", "member"]),
});

// What is derived is an object contract, so it keeps the I prefix; a value set
// like z.enum is a union and takes no prefix.
export type IUserInfo = z.infer<typeof userSchema>;

export const fetchUserInfo = async (id: string): Promise<IUserInfo> => {
  const raw: unknown = await request(`/api/user/${id}`);
  const parsed = userSchema.safeParse(raw);
  if (!parsed.success) throw new Error(`invalid user payload: ${parsed.error.message}`);
  return parsed.data;
};
```

## Acceptance

1. Change `role` to a number on the backend and validation fails there, not later in production when the page renders blank.
2. No `as ` or `unknown as` can be found along the narrowing path.
3. The field definitions exist once, in the schema; deleting the hand-written interface type still compiles.

## Common mistakes

- A request function returns `any` or `unknown`, pushing the narrowing onto every caller.
- `as IUserInfo` skips validation.
- The server envelope (`{ code, data, message }`) travels all the way into components.

Decisions to confirm with the user: which missing fields are fatal rather than defaulted, whether pagination is driven by `total` or `hasNext`, and which layer maps backend field names onto frontend domain names.
