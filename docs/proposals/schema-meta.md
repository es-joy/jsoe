# Proposal: surfacing schema `meta` in viewUI / editUI

Status: draft / accepted for implementation

## Goal

Reveal the Zodexy `meta` bag carried on serialized schemas (`meta.title`,
`meta.description`, `meta.id`, `meta.deprecated`, and custom keys) in both
viewUI and editUI, move the primary "label" role from the schema's top-level
`description` to `meta.title`, and reserve `meta.description` for longer
explanatory prose shown only on hover.

The schema driving a given editUI session, and its metadata, are
developer-supplied inputs. The end user edits **data** that conforms to that
driving schema. (That data may itself be a schema — e.g. when jsoe is driven by
`vendor/zodexy/dist/schema.zodexy.json` to author a Zodexy schema — but the
schema *guiding* the session is still not user-editable.) Nothing in this
proposal makes the driving schema or its metadata editable in that session;
the metadata affordance renders in edit mode too, but strictly read-only, so
the person entering a value can see field guidance.

## 1. What the serialized schema gives us

Zodexy's `zerialize` emits metadata in two places on each `SzType`:

| Author writes | Serialized output | Notes |
|---|---|---|
| `.describe('x')` / `.meta({description:'x'})` (nothing else) | top-level `description: 'x'` **only** | `meta` is suppressed when it is exactly `{description}` |
| `.meta({title, description, id, deprecated, …custom})` | `meta: {…}` (plus a top-level `description` mirror if `description` is among the keys) | the full bag survives round-trip via `dezerializeRefs` |

Consequence that drives the design: **a bare `description` is ambiguous** —
jsoe cannot tell whether the author meant a short label or long prose. The
distinction only becomes real once `meta.title` (or another `meta` key) is
present, which is what forces `meta` to be serialized in full. Therefore:

- `meta.title` present → it is the visible label; `meta.description` is now
  free to be long-form / tooltip-only.
- only top-level `description` → keep treating it as the visible label
  (today's behavior, unchanged).

Today jsoe reads `schemaObject.description` in ~40 places
(`src/fundamentalTypes/arrayType.js`, the `title=` attributes in every leaf
type's `viewUI`/`editUI`, and the type pull-down label in
`src/types.js` `getOptionForType`). There is **no** `meta` handling anywhere.

### Canonical example: `schema.zodexy.json`

Zodexy's own meta-schema (`vendor/zodexy/dist/schema.zodexy.json`, which drives
schema-editing sessions) has already migrated: ~51 nodes now carry
`meta: {title: …}` instead of a bare `description`. It also models the `meta`
bag itself as `{id?, title?, description?, deprecated?} & record<string,
unknown>` — i.e. exactly the reserved keys below plus arbitrary custom keys, so
`RESERVED` in the resolver matches Zodexy's own definition. This file is the
natural integration fixture: exercising the schema demo already drives the new
label path.

One carry-over: Zodexy uses the sentinel string `"Modifiers"` (previously a
`description`, now `meta.title`) that `formats/schema.js` `mergeSchema` already
filters out of intersection merges — see §5.

## 2. One resolver, one render point

### `src/utils/schemaMeta.js`

Normalize the metadata bag and centralize precedence:

```js
const RESERVED = new Set(['title', 'description', 'id', 'deprecated']);

/**
 * @param {import('../formats/schema.js').ZodexSchema} [s]
 * @returns {{
 *   label: string|undefined,      // short, visible
 *   longText: string|undefined,   // prose for the tooltip only
 *   id: string|undefined,
 *   deprecated: boolean|string|undefined,
 *   custom: [string, unknown][],  // everything else in meta
 *   jsoe: object|undefined,       // meta.jsoe directive bag (see §7)
 *   rows: [string, string][],     // key→value for the popover table
 *   hasAny: boolean
 * }}
 */
export function resolveSchemaMeta (s) { /* … */ }

/** Terse call-site sugar used by arrayType.js child labels. */
export const schemaLabel = (s, fallback) =>
  resolveSchemaMeta(s).label ?? fallback;
```

Precedence:

- `label` = `meta.title` ?? `meta.description` ?? top-level `description`
  (drop the last term once `.description` on the schema is finally removed).
- `longText` = `meta.description` **only when** `meta.title` exists (otherwise
  `meta.description` is already serving as the label; don't repeat it).
- `id`, `deprecated`, `custom` never become visible labels — tooltip table only.
- `custom` = `Object.entries(meta)` minus `RESERVED` minus `jsoe`.

### Render point

`src/types.js` `getUIForModeAndType` wraps every type root for both modes and
already does `this.schemasForRoots.set(root, specificSchemaObject)`. Immediately
after building `root`, append a single metadata affordance when
`resolveSchemaMeta(specificSchemaObject).hasAny`. Universal coverage from one
edit — every fundamental/super/sub type, view and edit, nested or root —
instead of touching 40 call sites. Deprecated schemas additionally get
`root.classList.add('schema-deprecated')` for a CSS strikethrough on the
legend.

## 3. The affordance: a toggled metadata table

The `ⓘ` marker is a `span[role="button"]` (not a real `<button>`, so bare
`getInput` selectors such as `$e(root, 'button')` in `arrayType`/`noneditable`
never mistake it for the type's own control) that toggles a
`<table class="schema-meta-table">` of key→value rows, in the spirit of the
`+`/`-` show/hide toggler in `arrayType.js`.

As implemented (`src/utils/schemaMeta.js`, `appendSchemaMeta`):

- The marker glyph comes from CSS (`.schema-meta-toggle::before {content:"\24D8"}`),
  not a text node, so an untouched affordance adds **no text** to the type root
  — existing `.text()` / `have.text` assertions and a11y snapshots stay stable.
- The table is built **lazily on first activation** and appended after the
  marker; `click` and `keydown` (Enter/Space) both toggle it, keeping
  `aria-expanded` in sync.
- `metaTooltipText(rows)` fills the marker's `title=` so all rows are available
  on hover without opening the table (same technique as
  `src/fundamentalTypes/functionType.js`).
- `metaTable(rows)` builds the rows in order: Title, Description, `ID`,
  `Deprecated`, each custom key, then `jsoe.<key>` entries.
- The affordance is **appended as the last child** of the type root, not
  prepended: tests and internal code select the type's label via
  `root > span` / `root > *:first-child`. The two `arrayType.js` helpers that
  walk a root from its end (`$getArrayItems`, `$getAddArrayElement`) use a new
  `lastTypeChild(el)` helper (also in `schemaMeta.js`) that skips a trailing
  `.schema-meta`.
- New CSS in `src/jsoe.css`: `.schema-meta`, `.schema-meta-toggle`
  (+`::before` glyph), `.schema-meta-table` (small, bordered,
  `border-collapse`).
- **Deprecation** shows in both modes. `appendSchemaMeta` adds
  `.schema-deprecated` to the type root and, since a type's own root is
  usually not where its label lives, the always-present toggle carries the
  reliable signal: a muted-red glyph plus a CSS `::after` "deprecated" tag
  (pseudo-element, so no `.text()` pollution). The label itself is struck
  through where the class lands on an element that *is* a label — an inline
  leaf root (`span`/`b`/`i`) in viewUI, and in editUI the property/item
  `<legend>`, which `arrayType.js`'s `buildLegend` marks via
  `deprecatedClassSuffix(schema)` (from `schemaMeta.js`, alongside
  `isDeprecated`).

This is also the seam where **constraint display** (`min`/`max`/`kind`/
`format` — the existing README to-do "show more schema data in viewUI") later
plugs in: `metaTable` gains a few rows sourced from the schema object itself
rather than from `meta`.

## 4. Targeted edits beyond the central one

| Location | Change |
|---|---|
| `types.js` `getOptionForType` | `schemaContent.description` → `resolveSchemaMeta(schemaContent).label`; keep the `(…)` parens |
| `arrayType.js` ~40 `?.description` reads (record key/value, tuple items/rest, object property names, element labels) | mechanical swap to `schemaLabel(x, propName)`; long `meta.description` for these children already shows via each child root's own `ⓘ` marker |
| Leaf `viewUI`/`editUI` (`stringType`, `numberType`, …) | `title: specificSchemaObject?.description ?? 'String'` → `title: schemaLabel(specificSchemaObject, 'String')`; the metadata `ⓘ` is added by the wrapper, not here |

The `arrayType.js` sweep must preserve every current visible label and tooltip
exactly for schemas that only carry a top-level `description`.

## 5. `formats/schema.js` plumbing so `meta` survives composition

- **`addModifiers`** — add a `meta` branch next to the existing `description`
  one: shallow-merge the wrapper's `meta` into each option; concatenate
  `meta.title` / `meta.description` with `" and "` exactly as `description` is
  concatenated today. Without this, `z.union([...]).meta({...})` drops its
  metadata.
- **`mergeSchema`** (intersection) — explicit key-wise `meta` merge: union of
  custom keys, `title`/`description` concatenated with `" and "` like
  `description` already is. Extend the existing `val !== 'Modifiers'` guard
  (currently only on `description`) to `meta.title` as well, since Zodexy moved
  that sentinel from `description` to `meta.title`.
- `splitConstrainedSchema` — `...schema` spread already carries `meta`; no
  change.
- `dezerialize` / `getValidationSchema` — no change; Zodexy already strips and
  re-applies `meta` cleanly, and `parseValue` is unaffected.

## 6. `meta.description` → `meta.title` migration

- `vendor/zodexy/dist/schema.zodexy.json` is already migrated (§1) — no work,
  and it becomes the reference for the pattern.
- Fixtures in `demo/*.js`: where `description` is a short noun (`'Emoji'`,
  `'Container'`, `'A number'`) → `meta: {title: …}`; where it is genuine prose
  → `meta: {description: …}`.
- Because the resolver falls back `title ?? description ?? description`, every
  existing schema keeps rendering identically until it is migrated.
- `CHANGES.md` + `README.md` schema section: announce `meta` support, the `ⓘ`
  affordance, and the deprecation of `.description` directly on the schema
  (prefer `meta.description`).

## 7. Reserved namespace: `meta.jsoe`

Custom `meta` keys are shown in the tooltip table as-is. The single key
`meta.jsoe` is **reserved** for jsoe's own layout/UI directives, so user
metadata never collides with them.

Implemented now: `meta.jsoe.*` entries are surfaced in the metadata table
(prefixed `jsoe.<key>`) so a schema author can see them round-trip. Acting on
them is a follow-up — e.g. `meta.jsoe.tableView` to flatten an
array-of-arrays into a table (currently the normal Array controls still
render).

## 8. Out of scope

- Editing the schema that drives the current editUI session, or its `meta` —
  jsoe edits data conforming to that schema (which may itself be a schema), not
  the schema guiding the session.
- Folding constraint display (`min`/`max`/`kind`/`format`) into the metadata
  table — a follow-up once the table ships (see §3).
- Acting on `meta.jsoe` directives (e.g. `tableView`) — surfaced but not yet
  wired to rendering (see §7).

## 9. Tests

- Extend `cypress/e2e/fundamentalTypes/array.cy.js` and siblings: assert the
  visible label comes from `meta.title`, the `ⓘ` marker's `title` contains
  `id` / `deprecated` / custom rows, and a `deprecated` schema adds
  `.schema-deprecated`.
- Keep `schemaMeta.js` free of stray `console.log(obj)` lines — several specs
  stub `window.console.log`.

## Summary of the change surface

One new util (`src/utils/schemaMeta.js`), one insertion in
`getUIForModeAndType`, one label-precedence change in `getOptionForType`, a
mechanical `schemaLabel()` sweep through `arrayType.js`, and `meta` merge logic
in `formats/schema.js`. Existing schemas are unaffected until migrated.
