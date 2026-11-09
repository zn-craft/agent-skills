# Values, numbers and dates

Covers number precision, string handling, date time zones and equality. Collections and properties are in [objects-and-collections.md](objects-and-collections.md), function form in [functions-and-classes.md](functions-and-classes.md).

## Look for the existing tool first

Look for the entry point the project already has: a third-party library in its dependencies, an internal `utils`, or a data-layer wrapper all count. Use it when it exists, and fall back to the built-in forms below only when it does not, keeping one approach per concern; imports are covered in [imports.md](imports.md). The library names in parentheses are common examples, and the criterion is whether a tool of that kind exists.

- Dates: with a date library or an internal wrapper (`dayjs`, `date-fns`, `luxon`, or the project's own `formatDate` and `parseDate`), parsing, time zones and formatting all go through it, and no second implementation is hand-written.
- Money and decimals: with decimal or money handling (`decimal.js`, `bignumber.js`, `Dinero.js` or an internal money utility), the arithmetic goes through it instead of converting to minor units by hand; a project already using integer cents keeps integer cents, and the two never run side by side.
- Copying and immutability: follow the data layer's immutability mechanism (`immer`, `immutable`) or a utility library's deep copy (`cloneDeep`, `klona`); use the library's version when the prototype chain or function references must survive, and `structuredClone` for plain data.
- Data shape follows the call sites: when a library's object turns into a string or a number is decided once at the module boundary, not with `toISOString()` or `toNumber()` scattered around.

## Numbers

- Store money and quantities as integers in minor units (cents, tenths, grams): `0.1 + 0.2` is `0.30000000000000004`, and float accumulation stops adding up after a few entries; presentation goes through `Intl.NumberFormat`.
- Integers beyond 2^53 - 1 (order numbers, snowflake ids) use `BigInt`: it cannot mix with `Number`, and `JSON.stringify` throws on it.
- Test for `NaN` with `Number.isNaN` and for a finite number with `Number.isFinite`; the global `isNaN` and `isFinite` convert their input first.
- Text to number uses `parseInt(text, 10)` with an explicit radix, or `Number(text)`; `Number("")` and `Number(null)` are both `0`, so boundary data is checked for emptiness first.

## Strings

- Replacing every match uses `replaceAll`; prefix, suffix and containment checks use `startsWith` / `endsWith` / `includes`; extraction uses `slice`, and the last character comes from `at(-1)`.
- User input is `normalize("NFC")` before comparison, de-duplication or searching: one character can have two code point sequences, and without normalization they never compare equal.

## Dates

- Only an ISO 8601 string goes to `new Date()` (`2026-11-06T10:00:00.000Z`); `2026/11/06` and `11/06/2026` are parsed per implementation, so the result changes with the runtime.
- A plain date `"2026-11-06"` parses as UTC; local time comes from the argument form `new Date(2026, 10, 6)`, and UTC is written out in full with a `Z`.
- Display uses `Intl.DateTimeFormat` with an explicit `timeZone`; storage and transport use `toISOString()` or a timestamp, not `toString()`.
- An interval is one timestamp minus another, and "today" or "this month" follows the business time zone rather than the machine's.

## Equality

- `===` / `!==` throughout; `NaN` is not equal to itself, and telling `-0` from `0` takes `Object.is`.
- Objects and arrays compare by reference, so comparing contents means comparing field by field. A utility library's `isEqual` works, but it is a full deep comparison and does not belong on a hot path.
- `null` means deliberately nothing while `undefined` means never provided; one piece of data does not use both for the same idea.

## Deep copies

- Spread and `Object.assign` are shallow, which covers one level.
- A deep copy uses `structuredClone`, which handles `Date`, `Map`, `Set`, `RegExp`, `ArrayBuffer` and circular references.
- Avoid `JSON.parse(JSON.stringify(value))`: `Date` becomes a string, `undefined`, functions and `Symbol` disappear, `Map` and `Set` become `{}`, and `BigInt` throws.
- `structuredClone` cannot copy functions, `Error`, DOM nodes or the prototype chain of a class instance; those values need a conversion function of their own.

## Cases

```js
const currencyFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

// Wrong: accumulating in whole units and rounding once at display time leaves
// the books off by a cent.
const total = items.reduce((sum, item) => sum + item.price, 0);

// Right: accumulate integer cents and format only at the display layer.
const totalCents = items.reduce((sum, item) => sum + item.priceCents, 0);
const totalLabel = currencyFormat.format(totalCents / 100);
```

```js
// Wrong: a non-ISO format parsed by the implementation. "2026/11/06" is local
// time in some runtimes and NaN in others.
const deadline = new Date(row.deadline);

// Right: the backend sends an ISO string or a timestamp, and a local date uses
// the argument form.
const deadline = new Date(row.deadlineIso);
const localDate = new Date(row.year, row.month - 1, row.day);
```
