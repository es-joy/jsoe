# Schema-driven search widget subsystem

## Context

jsoe today has two things: per-type modules under `src/fundamentalTypes/`, `src/subTypes/`, `src/superTypes/` that render `viewUI`/`editUI` controls for *editing a value* against a zodexy/Zod schema, and a `README.md` to-do item ("**Schema-driven search**", `README.md:162-185`) that already specs, type-by-type, a second capability that has never been built: iterating a *schema alone* (no value) to build a hierarchical search widget — e.g. a `Date` property gets two date pickers for a range query, an `Object` schema gets additive "has property X" controls, a `Tuple` schema gets distinct per-position controls unlike a plain `Array`. The goal of this work is to build that second capability as a new, parallel subsystem, reusing jsoe's existing schema-shape recognition and rendering conventions rather than reinventing them.

Decisions the user has already made (not open for re-litigation during implementation):
1. **Structure**: a parallel module tree, not new methods bolted onto the existing `viewUI`/`editUI` type objects — because schema-only iteration needs different per-type behavior than value iteration (tuple/record/discriminatedUnion in particular need their own dedicated logic, where the value-editing side currently delegates them to `arrayType`/`objectType` via a runtime `specificSchemaObject.type` check). The new modules should still *call into* existing type files to reuse concrete UI-building pieces where that makes sense (e.g. a date-range widget reusing the date `<input>` construction from `dateType.js`).
2. **Output**: each widget produces a structured, serializable **query object** (an AND/OR tree of typed leaf constraints), not an in-memory predicate function, so a host app can translate it into an IndexedDB query, an HTTP query string, etc.
3. **Scope**: full breadth in this pass — all ~25 type variants in the README to-do, not a small slice first.

Confirmed mid-design clarifications from the user:
- jsoe represents several runtime types via zodexy's "checked" mechanism — `{type: 'any', checks: [{name: 'blob'}]}` for `Blob`, and similarly for `regexp`, `error`, `domrect`, etc. — read by `getCheckedType` (`src/formats/schema.js:117-121`, confirmed at lines 117-166). The new dispatcher must go through the *same* recognizer, not reimplement it.
- `type: 'instanceof'` is **not** a general-purpose case to handle broadly. It occurs in exactly one place: the `File` element schema nested inside a `FileList`'s `codec` definition (confirmed at `src/formats/schema.js:963-969`, resolving `parentSchema.output.element` when `typesonType === 'file'`). No standalone/top-level `instanceof` schema exists elsewhere in this codebase's usage; a bare `instanceof` schema outside that FileList nesting should fall through to the non-editable/escape-hatch case, not to a generic "instanceof" search widget.

## Architecture

### 1. New file layout — `src/search/`

A fourth top-level tree, sibling to `fundamentalTypes/`, `subTypes/`, `superTypes/`, mirroring their names so a contributor can always find `src/search/fundamentalTypes/dateSearchType.js` next to `src/fundamentalTypes/dateType.js`:

```
src/search/
  index.js                 # exports buildSearchChoices (top-level entry point)
  searchDispatch.js         # getSearchSchemaType(), availableSearchTypes registry, getSearchTypeObject()
  queryTree.js              # JSDoc typedefs only: QueryAnd/QueryOr/QueryLeaf and all leaf shapes
  queryTreeBuilders.js       # runtime helpers: makeAndNode, makeOrNode, makeXLeaf(...) constructors
  searchUtils.js            # shared UI helpers: buildPathLabel, buildRangeInputsPair, buildMultiSelect, buildHasPropertyToggle
  fundamentalTypes/          # one *SearchType.js per src/fundamentalTypes/*Type.js: date, number, bigint,
                             #   string, regexp, boolean, symbol, undefined, null, nan, array, object, map,
                             #   set, filelist, file, blob, error, domexception, promise, function
  subTypes/                  # tupleSearchType.js, recordSearchType.js, blobHTMLSearchType.js
  superTypes/                # domrectSearchType.js, dompointSearchType.js, dommatrixSearchType.js,
                             #   errorsSpecialSearchType.js, specialNumberSearchType.js,
                             #   specialRealNumberSearchType.js, buffersourceSearchType.js
  unions/                    # unionSearchType.js, xorSearchType.js, discriminatedUnionSearchType.js
  noneditableSearchType.js   # instanceof-outside-FileList + not-yet-supported types: no widget, escape hatch only
```

Modules that get their **own** dedicated file instead of delegating (unlike the value-editing side, which delegates tuple/record to `arrayType.js` and has no dedicated union module at all):
- `tupleSearchType.js` — each position needs its own control from `.items[i]`/`.rest`, not one control repeated per element.
- `recordSearchType.js` — record search is "key-schema search AND/OR value-schema search," structurally unlike object's additive "has property."
- `objectSearchType.js` — "has property `<X>`" is an additive pulldown-driven affordance (README: "avoid listing required"), fundamentally different from rendering every property, which is what value-editing's `objectType.js` (thin wrapper over `arrayType.js`) does.
- `discriminatedUnionSearchType.js` (plus sibling `unionSearchType.js`/`xorSearchType.js`) — the discriminator field drives a typed pulldown (README explicitly calls out "discriminator of discriminated union" as its own case), which has no value-editing analogue to delegate to.
- `mapSearchType.js` — key-search × value-search composite, closer to a bespoke type than a delegate.

### 2. Query object shape (`src/search/queryTree.js`)

JSDoc-only typedefs; leaf `path` values reuse the existing JSON-Pointer convention from `src/utils/jsonPointer.js` (`makeJSONPointer`, `getJSONPointerParts`) rather than inventing a new path format.

```js
/**
 * @typedef {{and: QueryNode[]}} QueryAnd
 * @typedef {{or: QueryNode[]}} QueryOr
 * @typedef {QueryAnd|QueryOr|QueryLeaf} QueryNode
 */
```

Leaf kinds, discriminated by `kind`, each carrying a JSON-Pointer `path`:
- `hasProperty` (object); `lengthSize` (array/set/tuple-with-rest/filelist, +`sparseCheck` for array sparse/not-sparse)
- `range` (number/NumberObject/bigint/date/buffersource, with `valueType` distinguishing them and `negate: true` covering every README "Is Not Range" variant — one leaf kind instead of a doubled leaf surface), `integerCheck`
- `literalSet`/`regex`/`notContains` (string/StringObject/Blob/File/regexp-source/symbol-description)
- `multiSelect` (enum, SpecialNumber's Infinity/-Infinity/NaN), `keyValueEnum` (native enum key-vs-value)
- `typeOf` (union/xor/discriminatedUnion "has type", carrying `discriminatorValue` when applicable, including when nested under a Map/Record key or value)
- `blobHTML` (XPath/CSS-selector/full-text/raw-HTML-regex), `domShape` (per-dimension ranges for DOMRect/Point/Matrix) + `readonlyCheck`/`dimensionCheck` (is/is-not readonly, is/is-not 3d)
- `mapRecordJoint` (paired key+value leaves with a joint-match flag)
- `passThrough` (promise/literal/catch/function: forwards to a nested `QueryNode` for the child schema so the tree stays uniform even where a type adds no constraint of its own)
- `presence`/`booleanEquals` (undefined/void/null, boolean/BooleanObject)

`src/search/queryTreeBuilders.js` exposes the only runtime pieces — `makeAndNode`, `makeOrNode`, and one small factory per leaf kind — so every search module builds nodes through one place and tests can import the same constructors to build expected-value fixtures.

### 3. Schema-only dispatcher (`src/search/searchDispatch.js`)

Must not reimplement `getSchemaType`'s special-casing (stringbool pipe, `codec`/filelist, `instanceof`, `literal`, `enum`, `templateLiteral`, `getCheckedType` fallback — all at `src/formats/schema.js:117-166`) — it imports and calls `getSchemaType` directly, then adds only the extra shape distinctions that function's own `AvailableArbitraryType` output collapses (tuple, record/looseRecord, union/xor/discriminatedUnion all currently reduce to `'array'`/`'object'`/nothing, per `zodexToStructuredCloningTypeMap`, `schema.js:30-56`):

```js
export function getSearchSchemaType (schemaObject) {
  if (schemaObject.type === 'tuple') return 'tuple';
  if (schemaObject.type === 'record' || schemaObject.type === 'looseRecord') {
    return schemaObject.type;
  }
  if (['union', 'xor', 'discriminatedUnion'].includes(schemaObject.type)) {
    return schemaObject.type;
  }
  return getSchemaType(schemaObject); // inherits stringbool/codec/instanceof/checks handling verbatim
}
```

No dispatcher-level `instanceof` branch is added. Because the walker only ever reaches `getSchemaType`'s `instanceof` case when recursing into a FileList's `.output.element` (the one real occurrence in this codebase, per `schema.js:963-969`), that recursion naturally resolves to `'file'` and routes to `fileSearchType.js` — enforcing the "FileList-only" invariant by construction. A bare top-level `instanceof` schema (which doesn't occur via any current codec) falls through to `noneditableSearchType.js`'s escape hatch, same as any other unrecognized/not-yet-supported shape.

`availableSearchTypes` is a `Record<string, SearchTypeObject>` registry (analogous to `Types.prototype.availableTypes`, `src/types.js:473-581`) mapping every key `getSearchSchemaType` can return to its module; `getSearchTypeObject(schemaObject)` is the one exported call site every recursive widget uses (analogous to `types.getTypeObject(type)`, `src/types.js:1106-1108`, but schema-in rather than type-string-in, since there's no value to key off).

`SearchTypeObject` (JSDoc typedef alongside `queryTree.js`) is the search-side analogue of `TypeObject` (`src/types.js:308-408`): two methods, `buildUI({schemaObject, path, typeNamespace, topRoot, types})` returning a `jml` array, and `getQuery({root, path})` returning a `QueryNode|undefined` (`undefined` = "no constraint entered here").

### 4. Reuse of existing value-editing modules

- **Date** (`src/fundamentalTypes/dateType.js`): extract the `<input type="datetime-local">` construction (currently inlined in `editUI`, lines 174-193, including the `min`/`max` wiring from `dateSchemaObject?.min`/`.max` and the ISO-slice formatting) into a new named export `buildDateInputControl`, added alongside the existing default export. `dateSearchType.js` calls it twice (range start/end). This is the **only** existing file this feature needs to modify, and it's purely additive — the default export and all existing behavior/tests are untouched.
- **Number/string/regexp** (`numberType.js`, `stringType.js`, `regexpType.js`): no extraction — these types' reusable unit is a single native `<input>`, too trivial to be worth a function boundary, and the value-editing versions carry string round-tripping logic (`stringRegex`/`toValue`) the search UI doesn't need. Search modules build their own inputs directly via `jml`. Exception: `regexpType.js`'s `allowedFlags` list (a plain property, already exported on the object) is imported as-is by `regexpSearchType.js` for its flags multi-select — no extraction needed, it's already accessible.
- **`getChildSchema`** (closure inside `arrayType.js`'s `editUI`, ~lines 1614-1690): not extracted (entangled with `arrayType.js`'s DOM-diffing state). `tupleSearchType.js`/`recordSearchType.js` write their own 1-3 line equivalents (`schemaObject.items[i] ?? schemaObject.rest`; `schemaObject.value`/`.key`) — below the threshold where duplication is a real risk.
- **`schemaLabel`** (`src/utils/schemaMeta.js`) and **`isUnionLike`** (`src/utils/types.js:9-25`): imported as-is by every relevant search module, same as the value-editing side already does.
- **`getXorBranchMatchInfo`** (`src/formats/schema.js:262-279`) is explicitly *not* reused by `xorSearchType.js` — it requires a concrete value to test branch match, which the search side never has.

### 5. Public API entry point

New `src/search/index.js` exports `buildSearchChoices({schemaContent, typeNamespace, topRoot, types})`, re-exported from `src/index.js` alongside the existing `Types`/`Formats`/`typeChoices`/`formatAndTypeChoices`/`getTypesForSchema` exports (`src/index.js:13-27`). Mirrors `buildTypeChoices`'s (`src/typeChoices.js:395`) `whenReady`/pull-based convention rather than inventing a push/callback API: returns `{container, $getQuery, whenReady}`, where `$getQuery()` reads the live DOM into a `QueryAnd` on demand (same shape as `typeChoices.js`'s `$getValue`), and a host that wants live updates wraps it in its own `container.addEventListener('input', ...)` since `container` is a plain `HTMLDivElement`.

`buildSearchChoices` recurses via `getSearchTypeObject(...).buildUI(...)`, starting at `path = '#/'` — it does **not** route through `getTypesForSchema` (`src/formats/schema.js:581-864`), because that function flattens union members into one flat Set of leaf types for a type-choice dropdown, whereas search needs union branches to stay distinguishable nested sub-widgets for the "has type" affordance.

### 6. Build order

1. Query-tree contract + `queryTreeBuilders.js` + `searchDispatch.js` skeleton, with every registry entry pointing at a temporary stub (`{buildUI: () => ['span', ['TODO']], getQuery: () => undefined}`) so the full shape typechecks end-to-end immediately.
2. `searchUtils.js` shared UI helpers + the additive `buildDateInputControl` export on `dateType.js`.
3. Primitive leaves: date, number, bigint, string, regexp, boolean, symbol, undefined, null, nan.
4. Object / Array / Set (first types recursing into child schemas via `getSearchTypeObject`).
5. Tuple / Record (isolated in their own step since per-position/per-key-vs-value logic is qualitatively different from step 4's recursion).
6. Map / FileList / File / Blob — this is where the FileList→instanceof→File routing gets exercised for the first time; add the regression test described below here.
7. Union family (union/xor/discriminatedUnion) — lands after composites so a union-of-composites round-trips through already-working recursion.
8. Remaining independent leaves/composites: Error family, DOMException, DOMRect/Point/Matrix, BlobHTML, promise/function/literal/catch pass-through, SpecialNumber/SpecialRealNumber, buffersource, noneditable. `buffersource` and `function` are flagged as fuzzy in the README itself ("OR Range/Is Not Range" over raw bytes; args/return-type pass-through) — ship a minimal, honest stub for these two (byte-length range only; pass-through only if there's a searchable child) rather than over-building past what the spec actually defines.
9. `buildSearchChoices` + `src/index.js` export (composes everything above).
10. Demo page + Cypress suite.

Watch item: `tsconfig.json` currently excludes `src/formats/schema.js` from type-checking (`tsconfig.json:19` — its `exclude` array includes `"src/formats/schema.js"`), presumably because zodexy's generic unions defeat strict narrowing there. If `getSearchSchemaType`/`getSearchTypeObject`'s narrowing over the same `ZodexSchema` union hits the same wall, decide whether `src/search/searchDispatch.js` needs the same exclusion during step 1, rather than discovering it midway through later steps.

### 7. Test plan

Follows the existing Cypress-e2e-against-a-demo-page convention (this repo has no unit-test runner; per prior verified project knowledge, a change also isn't considered typechecked unless `tsc`, `tsc:ts7`, and `tsc-cypress` all pass, not just the default `tsc`):
- New `demo/index-search.html`/`-instrumented.html` + `demo/index-search.js`, structured like `demo/index-schema.html`/`.js`, reusing existing fixtures from `demo/schema-data.js` where they already cover a shape (e.g. its date schema with real `min`/`max` for the range-widget test), and additively exporting a few new fixtures it lacks (tuple-with-rest, record/looseRecord, a discriminatedUnion with a date branch).
- New `cypress/e2e/search/` directory mirroring the existing `fundamentalTypes/`/`subTypes/`/`superTypes/` structure, each with an `all.cy.js` aggregator per that convention.
- A representative spec (`cypress/e2e/search/fundamentalTypes/date.cy.js`): visit the search demo page, type into both range inputs, trigger the demo's "get query" button, assert the logged/parsed JSON matches the expected `QueryAnd` shape (start/end values, `valueType: 'date'`), and separately assert the two `datetime-local` inputs' `min`/`max` HTML attributes match the schema's constraints — proving `dateSearchType.js` is actually calling `buildDateInputControl` rather than a drifted re-implementation.
- A dedicated regression spec for the FileList/instanceof invariant: build a FileList search widget and assert its element control is `fileSearchType`'s UI (not the generic `noneditableSearchType` stub), and separately confirm a bare `instanceof` schema outside a FileList (if constructible via the demo fixtures) renders `noneditableSearchType`'s escape hatch instead — this is the one test directly protecting the FileList-only `instanceof` invariant from regressing.

## Verification

- `npm run tsc && npm run tsc:ts7 && npm run tsc-cypress` clean after every step (per existing project convention: all three scripts, not just the default, gate a change).
- `npm run eslint` clean (`eslint-config-ash-nazg(['sauron','browser'])`).
- `npm run cypress` (or `npm test`, which runs `eslint && rollup && cypress`) green, including the new `cypress/e2e/search/**` specs.
- Manually open `demo/index-search.html` in a browser and exercise a Date range, an Object "has property," and a Tuple's per-position controls to confirm the rendered UI and the printed query JSON match expectations before considering any given step done.
