# OR-combination support for search widgets

**Status: implemented and verified.** Every site below is done; every spec
listed under Testing has been rewritten for the checkbox-based UI and
passes; a full clean suite run (`npm run cypress`, `ELECTRON_RUN_AS_NODE`
unset) is green at 1047/1047 with no coverage regressions attributable to
this work (see the `blobHTMLSearchType.js` section for the one general bug
found and fixed along the way, in `extractClauseFromList`).

## Context

jsoe's schema-driven search widgets (`src/search/`) build a query tree from
a schema alone. Every widget that combines several sibling facets today
does so via `combineAnd` (`src/search/queryTreeBuilders.js:27-35`) — the
whole tree is 100% AND-only in practice, even though `QueryOr`/`makeOrNode`
already exist as unused typedefs/stubs. The user wants OR support wherever
sibling facets currently combine via implicit AND, giving two concrete
examples: optional object properties, and string/regexp's mutually-
exclusive "Matches regex"/"Does not contain" modes. This was already an
"Important" README to-do ("Need to allow multiple OR'd conditions... like
'matches regex' and 'does not contain'").

Confirmed with the user: implement full breadth in one pass (every site
below, not just the two named examples); the UI affordance is one shared
"All of / Any of" `<select>` per combining site, modeled on the existing
`buildTriStateSelect` pattern; for `objectSearchType.js` specifically, the
toggle governs only the optional ("Has property") rows the user adds —
required rows always stay AND'd in on top regardless.

## Foundational pieces (build first — everything else depends on these)

### 1. `queryTreeBuilders.js`: add `combineOr`

Mirrors `combineAnd` exactly (filter `undefined`s; `undefined` if none
survive; bare node if exactly one survives; otherwise `makeOrNode(filtered)`
— reusing the already-existing, currently-unused `makeOrNode`).

### 2. `searchUtils.js`: make the "read back a saved query" path `$or`-aware

This is the highest-risk part: every site's `applyQuery` runs through
`extractLeafOfKind`/`extractClauseForPath`, which currently only understand
`$and`. Without this fix, `applyQuery` silently fails to find anything the
moment a widget's own `getQuery` produces a bare `{$or: [...]}`.

- **`unwrapAndClauses`** (currently ~948-953): also unwrap `$or` (check
  `'$or' in queryNode` before `'$and'`).
- **New `combinatorOfQuery(queryNode)`**: returns `'or'` iff `queryNode` is
  itself a bare `{$or: [...]}` node, else `'and'` (covers a bare leaf, an
  `$and` node, and `undefined` alike). This is also the answer to the
  "how does a round-tripped single-facet query (no wrapper at all) restore
  the toggle" question — it just defaults to `'and'`, indistinguishable
  from a deliberate "All of" and correctly so.
- **New `extractClauseFromList(clauses, path)`**: the array-level primitive
  factored out of `extractClauseForPath` — needed directly by
  `objectSearchType.js` (see below), which must repeatedly peel clauses out
  of a plain array without reconstructing a `QueryNode` after every peel.
- **`extractLeafOfKind`/`extractClauseForPath`** (currently ~1013-1047):
  recombine remaining clauses with the *same* combinator the input node
  had (`combinatorOfQuery(queryNode) === 'or' ? combineOr : combineAnd`),
  instead of always `combineAnd`. Every existing non-category-1 caller
  (array/map/filelist/set/tuple/function/unionFamily) only ever hands these
  functions AND-only output, so `combinatorOfQuery` always evaluates to
  `'and'` for them — behavior is unchanged there.
- **New `buildCombinatorSelect({name, key})` / `readCombinator(el, key)` /
  `applyCombinator(el, value, key)`**: same build/read/apply triad shape as
  every other control in this file (e.g. `buildTriStateSelect`), but with
  only two options ("All of" → `'and'`, "Any of" → `'or'`) and no "(any)"
  state — some combinator always applies once 2+ facets exist. Default
  `'and'` (today's behavior, unconditionally, for backward compatibility).

### 3. Required fix discovered during design: key the "at least one" sentinel

`buildAtLeastOneSentinel`/`syncAtLeastOneCheck`/`resyncAtLeastOne` currently
key by `root` alone (single-slot `WeakMap`, single fixed class name
`input.searchAtLeastOneSentinel`) — confirmed by reading `searchUtils.js`
directly. Once the literal/regex/notContains restructuring below needs its
*own* "at least one of these three" sentinel nested inside a widget that
*already* has its own top-level sentinel at the same `[data-search-path]`
root (`fileSearchType.js`, `domexceptionSearchType.js`,
`makeErrorFamilySearchType` all do), the second registration silently
overwrites/shadows the first. Fix: give all three functions a `key = ''`
parameter (default keeps every existing call site's behavior identical),
change the class to `searchAtLeastOneSentinel--${key}` and the `WeakMap`
value to a `Map<key, resync>` per root. Update `jsoe.css`'s
`.searchAtLeastOneSentinel` rule to the attribute-prefix form already used
for `jsoeSearchOptInFieldset--` (`[class^="searchAtLeastOneSentinel--"]`).

## The literal/regex/notContains restructuring (`buildLiteralRegexControls`)

Replace the single mutually-exclusive Mode `<select>` (`searchUtils.js`,
`buildLiteralRegexControls`/`readLiteralRegexQuery`/`applyLiteralRegexQuery`,
~483-629, ~1064-1111) with three independent `buildOptInFieldset`-wrapped
facets — Literal, Regex (+ Flags when `flagOptions` given), Does-not-contain
— sharing one `buildCombinatorSelect` and one keyed `buildAtLeastOneSentinel`.
Add a new `wireLiteralRegexControls(root, key)` companion that wires all
three fieldsets + the sentinel in one call (mirrors `wireOptInFieldset`'s
"call once from `connectedCallback`" pattern).

- `readLiteralRegexQuery(el, path, key)`: reads each opt-in facet
  independently, combines via `readCombinator(el, key)`. Return type widens
  from "one bare leaf" to a full `QueryNode` (2-3 leaves can now survive).
- `applyLiteralRegexQuery(el, queryNode, key)`: now accepts the full
  `QueryNode`; uses `unwrapAndClauses` to find each leaf kind, restores each
  facet's opt-in/value, and `applyCombinator`.
- **Consumers needing a `connectedCallback` update** (call
  `wireLiteralRegexControls(this, key)`): `stringSearchType.js`,
  `blobSearchType.js`, `symbolSearchType.js` (currently have *no*
  `connectedCallback` at all — add one), `fileSearchType.js` (two calls,
  keys `'name'`/`'type'`), `domexceptionSearchType.js` (key `'message'`),
  `regexpSearchType.js` (default key, for its "source" facet),
  `searchElementUtils.js`'s `buildErrorFamilyChildren`/`makeErrorFamilySearchType`
  (one call per `errorStringProps` entry, keyed by prop name).
- **Discovered bug to fix in the same pass**: `stringSearchType.js`/
  `blobSearchType.js`/`symbolSearchType.js`'s `applyQuery` currently does
  `queryNode && '$and' in queryNode ? queryNode.$and[0] : queryNode` before
  calling `applyLiteralRegexQuery` — this silently discards every clause
  but the first now that 2-3 real leaves can legitimately survive. Delete
  the unwrap; pass `queryNode` straight through (the widened
  `applyLiteralRegexQuery` does its own extraction).

## Per-site combinator toggle (the ~10 confirmed AND-only sites)

Pattern, applied at each site below: add a `buildCombinatorSelect` right
after the widget's `.searchLabel` span; change `getQuery`'s
`combineAnd([...leaves])` to
`(readCombinator(this) === 'or' ? combineOr : combineAnd)([...leaves])`;
add `applyCombinator(this, combinatorOfQuery(queryNode))` in `applyQuery`
(order relative to existing `extractLeafOfKind` calls doesn't matter — they
already work off the raw incoming `queryNode`).

Representative sites following this pattern as-is: `numberSearchType.js`
(range + integerCheck), `dateSearchType.js` (validDateCheck + range),
`domexceptionSearchType.js` (name + message).

Sites needing a note beyond the plain pattern:
- **`fileSearchType.js`**: has *two* independent combinators — the outer
  name-vs-type toggle (this pattern, default key) *and* the item-9 internal
  toggle nested inside each of its two `buildLiteralRegexControls` facets
  (keys `'name'`/`'type'`). Both apply, independently.
- **`regexpSearchType.js`**: also two combinators on one widget — its
  item-9-restructured "source" facet's own internal toggle (default key)
  and a *new*, distinctly-keyed outer source-vs-flags toggle (key
  `'sourceFlags'`, to avoid colliding with the first). The existing
  "Flags only shown in regex mode" `onModeChange` hook is retired in favor
  of wiring Flags' visibility off the Regex checkbox's own toggle (via
  `wireLiteralRegexControls`'s `onToggle` extension point).
- **`makeErrorFamilySearchType`/`buildErrorFamilyChildren`
  (`searchElementUtils.js`)**: one combinator (default key) across
  `errorClassLeaf` + all `stringLeaves` + all `numberLeaves`.
- **`blobSearchType.js`/`symbolSearchType.js`**: pure item-9 cases — a
  single `buildLiteralRegexControls` facet with nothing else to combine
  against, so no top-level toggle of their own.

## `objectSearchType.js` (most involved site — needs an algorithm change, not just an added toggle)

Confirmed design: the toggle applies only to optional ("Has property")
rows; required rows always AND on top:
`combineAnd([...requiredLeaves, (toggle==='or'?combineOr:combineAnd)(optionalLeaves)])`.
UI: the combinator select lives in `div.searchObjectControls`, next to the
"Add property" pulldown, shown only when `availableProperties.length > 0`
(a static sibling control — it persists naturally across rows being
added/removed, nothing row-specific about it).

**`getQuery`**: split rows by tag name
(`:scope > jsoe-search-required-property` vs. `:scope > jsoe-search-has-property`,
confirmed via reading the file — both are real, distinct custom-element tag
names already used for `dataset.searchKind`), combine required leaves via
plain `combineAnd`, optional leaves via the toggle, then
`combineAnd([...requiredLeaves, combinedOptional])`.

**`applyQuery` needs real restructuring, not just an added line**: the
existing per-row loop calls `extractClauseForPath(remaining, childPath)` for
*each* row in turn against the *whole remaining node* — correct today
because everything is flat `$and`, but once 2+ optional properties can be
OR'd, that call would pull the *entire* `{$or:[...]}` out on the first
matching row and starve every subsequent one. Fix, in order:
1. Process **required-property rows first** (reordering the file's current
   two loops, which today process has-property rows first) — `extractClauseForPath`
   against the full node is still correct for these, since required leaves
   always sit at the `$and` top level regardless of the optional toggle.
2. Whatever's left in `remaining` after that is exactly the
   optional-combined node (bare leaf / `$and` / `$or` / `undefined`).
   Restore the toggle via `applyCombinator(this, combinatorOfQuery(remaining))`,
   then get its clause array via `unwrapAndClauses(remaining)` **once**,
   and peel each has-property row's own clause out of that plain array via
   the new `extractClauseFromList` (not `extractClauseForPath`, which would
   re-wrap and mis-behave the same way) — same fix applies to the existing
   third loop (optional properties referenced but not yet added).

This is the single most important new behavior to get right and test
explicitly (see Testing below) — a naive implementation that doesn't
reorder the loops or switch to array-based extraction for the optional
side will silently mis-populate every has-property row but the first
whenever 2+ optional properties are OR'd together.

## `blobHTMLSearchType.js` (bespoke — not built via `buildLiteralRegexControls`)

Apply the same "exclusive mode → independent opt-in checkboxes + combinator"
treatment, bespoke, to its 4 modes (XPath/CSS-selector/full-text/
regex-of-raw-HTML), each getting its own `buildOptInFieldset`-wrapped Value
control (input/textarea) and, for the regex mode only, its own Flags
multi-select — plus one combinator select and a keyed `buildAtLeastOneSentinel`.
This also lets today's bespoke imperative hidden/required-toggling and the
`isExemptedByAncestorHasProperty` special-casing (per the file's own doc
comment) be deleted, since each mode's own `<fieldset disabled>` gating now
handles that natively. `applyQuery` needs a small bespoke lookup (not
`extractLeafOfKind`/`extractClauseForPath`) since all 4 modes share both
`kind: 'blobHTML'` *and* the same `path` — disambiguated only by each
leaf's own `mode` field.

**Status: done.** Implemented as `readBlobHTMLFacet`/`applyBlobHTMLFacet`
bespoke helpers plus a `blobHTMLModes` array driving `getQuery`/`applyQuery`
uniformly across all 4 modes; `jsoe.css`'s `.searchAtLeastOneSentinel` rule
(missed when foundational piece #3 keyed that class) was also fixed to the
`[class^="searchAtLeastOneSentinel--"]` attribute-prefix form, since every
sentinel on the page was rendering as a plain visible text input until then.
`cypress/e2e/search/subTypes/blobHTML.cy.js` fully rewritten (9 tests,
passing) for the checkbox-based UI, including an AND/OR round-trip pair.

**Bug found and fixed while testing this site (general, not blobHTML-
specific):** `extractClauseFromList` (`searchUtils.js`) used `findIndex` to
grab only the *first* clause touching a given path out of an already-
flattened array. This silently broke `objectSearchType.js`'s optional-
property restore whenever exactly one optional property was configured and
that property's own child widget internally combined 2+ leaves via
`combineOr`/`combineAnd` at the same path (e.g. blobHTML's own two OR'd
facets) — the ancestor `combineAnd`/`combineOr` collapses its wrapper away
for a lone survivor (both functions' own doc), so the child's own internal
`$or`/`$and` surfaces at the flattened level indistinguishable from
"separate sibling properties," and only the first of its leaves survived
round-tripping through "Edit raw." Fixed by having `extractClauseFromList`
collect *every* matching clause and recombine them with a new `combinator`
parameter (the same combinator `clauses` was itself unwrapped from, which
both call sites already had in hand) instead of just the first match;
`extractClauseForPath` and `objectSearchType.js`'s two call sites were
updated to pass it through. Verified via a dedicated "round-trips an
OR-combined query of two facets through Edit raw" test in blobHTML.cy.js,
plus a full re-run of object.cy.js's existing 8 tests to confirm no
regression.

## Testing (run for every site touched)

Per combining site: (1) an AND-mode regression test confirming existing
default behavior is bit-for-bit unchanged; (2) an OR-mode test asserting
the resulting query is `$or`-shaped with the expected leaves; (3) a
round-trip test via the existing `loadQueryButton`/`applyQueryButton`
pattern (see `cypress/e2e/search/applyQuery.cy.js`), covering both a real
OR-combined query and the bare-leaf-collapse edge case (toggle should stay
at its default `'and'`).

Files needing rewrites for the new checkbox-based UI shape (every
`select[name$="-mode"]`/`select.jsoeSearchMode--`/`select.jsoeSearchBlobHTMLMode`
interaction becomes checking the relevant opt-in checkbox + typing into its
own value control): `cypress/e2e/search/fundamentalTypes/string.cy.js`,
`blob.cy.js`, `symbol.cy.js`, `file.cy.js`, `domexception.cy.js`,
`error.cy.js`, `regexp.cy.js`, `cypress/e2e/search/superTypes/errorsSpecial.cy.js`,
`cypress/e2e/search/subTypes/blobHTML.cy.js` (full rewrite — no single
default mode anymore), `cypress/e2e/search/validity.cy.js` (3 mode-select
references).

**Known, expected test-shape change** (not a regression):
`cypress/e2e/search/applyQuery.cy.js`'s "one of each type" test currently
asserts `query.$and[0].$and` has length 36 (flat). With required-vs-optional
now nested (`combineAnd([requiredLeaf, combineAnd(35 optionalLeaves)])`),
the correct new assertion is `query.$and[0].$and` length 2, with
`query.$and[0].$and[1].$and` length 35. Flag this in the PR description.

Object-specific new tests: 2+ optional properties OR'd alongside 1+
required properties (confirming required always applies regardless of the
optional toggle); add/remove an optional row after choosing "Any of"
(confirming the toggle persists and the query re-derives correctly); and
critically, a round-trip of a saved `{$or:[...]}` optional clause sitting
alongside required clauses in one `$and`, confirming every has-property row
(not just the first) is populated from its correct entry.

## Verification

Lint + all three tsc variants (`tsc`, `tsc:ts7`, `tsc-prod` — per this
repo's own convention) after each file group. `npm run instrument`, start
the dev server (`npm run start-instrumented`), then run the touched cypress
specs directly (never the whole suite mid-work, per this project's own
standing convention) — one spec group per site as each is completed, plus
`util-unit-tests/all.cy.js` for `queryTreeBuilders.js`/`searchUtils.js`
unit-test coverage (`combineOr`, `combinatorOfQuery`, `extractClauseFromList`).
Given the size, implement and verify site-by-site (foundational pieces →
literal/regex restructuring → simple sites → `objectSearchType.js` →
`blobHTMLSearchType.js`) rather than all at once, so a regression is easy
to localize.
