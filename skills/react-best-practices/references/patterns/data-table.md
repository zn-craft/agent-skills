# Case: data tables

Applies to an admin list with filters, pagination, sorting, row selection and bulk actions.

## Decide state ownership first

| Data | Usual owner | How to decide |
|---|---|---|
| Search conditions, page number, sort | URL or page state | Whether it needs sharing, restoration after reload, and back and forward |
| Remote table data | Query or route data layer | Caching, requests, invalidation and loading belong to the server-data mechanism |
| Currently selected rows | Page or table UI state | Whether a selection survives a page change is a business decision |
| Column visibility, density preference | Local preference state | Whether it must persist is a product requirement |
| Editing draft | Owner of the editing form | Kept apart from the server query result |

## Recommended decisions

1. **Keep conditions and results apart**: conditions are input, results are server state, and each is stored on its own.
2. **Store ids for a selection**: usually a `Set<RowId>` rather than objects that go stale. A cross-page selection states the lifetime of the ids and what "select all" means.
3. **Make reset behavior explicit**: whether changing a filter returns to the first page and whether sorting clears the selection are product rules, not something to hide across several Effects.
4. **Separate pagination from virtualization**: pagination bounds the data range, virtualization bounds the DOM for data already loaded, and large tables may use both.
5. **Bound the column configuration**: a stable configuration may sit at module scope, while one that depends on Props or permissions is built inside the component. Do not reach for `useMemo` on an ordinary array of columns.
6. **Report state fully**: tell the first load, a background refresh, no results, a failed request and a permission failure apart; an empty result is not an error.
7. **Plan for partial failure in bulk actions**: define what happens to the selection, the message and the refresh after all-succeed, some-succeed and all-fail.

## Case: selecting across pages, then archiving in bulk

This example keeps the selection across page changes, lets the header checkbox act only on the selectable rows of the current page, clears the selection and returns to the first page when filters change, and allows a partial success.

| Event | How state changes |
|---|---|
| Checking or unchecking on the current page | Update the page's `selectedIds` by row id. The header's checked and indeterminate states come from the selectable ids on the page, and the total is `selectedIds.size`. |
| Changing page or filter | A page change only moves the page number. Submitting a filter updates the filter, the page number and the selection in one event. The request layer keeps the data for each page. |
| Submitting the archive | Snapshot the selected ids at submit time. While the request runs, block duplicate submits and selection or filter changes; paging stays available. |
| Handling the result | Drop the ids that definitely succeeded, keep the failures with their reason, and refresh the affected queries. When a request was interrupted or the result is unknown, check the server state before deciding whether to retry. |

Changing the selection on the current page leaves the ids from other pages in the set, and only ids the server confirmed are removed after a bulk result.

```tsx
function selectPage(checked: boolean) {
  setSelectedIds((previous) => {
    const next = new Set(previous);
    for (const id of selectablePageIds) {
      if (checked) next.add(id);
      else next.delete(id);
    }
    return next;
  });
}

function applyArchiveResult(succeededIds: readonly RowId[]) {
  setSelectedIds((previous) => {
    const next = new Set(previous);
    for (const id of succeededIds) next.delete(id);
    return next;
  });
}
```

### Acceptance

1. Select A and B on the first page and C on the second. Unchecking the second page's header leaves A and B selected.
2. Select C again and submit. A and C succeed while B fails. After the refresh only B remains, with a partial-failure message, and a retry submits only B.
3. Changing the filter returns to the first page and the selection count is zero. With no selectable rows on the page, the header does not read as fully checked.

For a with-skill versus without-skill comparison, hand both groups the same existing paginated table, the business rules above and the acceptance steps. Record whether the behavior passes, whether duplicated state appears and whether the change grew; keep the implementation snippet for review.

## Common mistakes

- Putting every table state into a global store.
- Merging server rows and the editing draft into one mutable object.
- Using an array index as a row key or as the selection identity.
- Letting several Effects keep filters, page number and request parameters in step.
- Leaving the semantics of cross-page selection and of keeping a selection after filtering undefined.
- Building one universal DataTable abstraction to cover every table requirement.

## Business questions for the product owner

- Do filters belong in the URL?
- Does the selection survive a page change?
- Does "select all" mean the current page, the filtered result, or every record?
- Are bulk actions allowed to succeed partially?

## Where this stops applying

A display-only table with little data needs no elaborate state layer. Server pagination, virtual scrolling, tree tables and editable tables extend separately rather than being forced into one abstraction.
