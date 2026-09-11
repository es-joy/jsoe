# Proposal: raw Typeson/JSON6 edit & view buttons on object/array controls

Status: draft

## Goal

jsoe's README already carries an aspirational to-do: "Ability to replace
content with raw JSON6/Typeson/Safe Eval ... if it validates"
(`README.md:124`). This proposal implements it for every object- and
array-based control: a small "Edit raw" button in edit mode that opens a
syntax-highlighted textual view of the control's current value
(Typeson-encoded, written in JSON6 syntax) which can be hand-edited and saved
back in; and, only when a new opt-in "unsafe eval" privilege is granted, a
second mode in that same editor that instead evaluates the text as a literal
JS expression (mirroring the existing `eval(o)` pattern already used for
`arbitraryJS` functions in `src/formats/structuredCloning.js:23-27`). A
parallel read-only "View raw" button is added to view-mode (`viewUI`)
controls, showing the same highlighted Typeson/JSON6 text with no edit/eval
capability.

Because `objectType.js` and `arrayType.js` share one implementation
(`src/fundamentalTypes/arrayType.js`), and the root control renders through
that same code path (the `topRoot` pattern), adding the buttons there
automatically covers every object/array control in the tree, including root,
with no special-casing needed.

## 1. Scope: which controls get the buttons

The button applies to `type === 'object'` and `type === 'array'`, including
their schema-refined forms (`record`/`tuple`, detected the same way the file
already does via `recordMode`/`tupleMode`) and to `set`/`map` (also real
object/array data, fully representable in Typeson).

`filelist` is **included** too, on closer look: browsers *can* construct a
real `File` via `new File(...)`, and — checked directly in
`src/fundamentalTypes/filelistType.js` and `arrayType.js`'s `getValue` —
jsoe's own filelist control never actually requires a genuine
`instanceof FileList` for its internal value model; it already treats a
filelist's value as a plain array-like of `File` objects (built the same way
the `<input type="file" multiple>` change handler at `arrayType.js:2652-2684`
does, one `File` at a time via `$addAndSetArrayElement`). So no `FileList`
polyfill or extra dependency is needed: Typeson's existing `file` type-spec
(already in `structuredCloningJsoe`'s type list) round-trips `File` content
through the same encapsulate/revive path as everything else, and
`types.setValue({type: 'filelist', root, value})` accepts a plain array of
revived `File`s exactly as it does today. One caveat worth flagging in UI
copy or docs: `File` content typeson-encodes as base64 in the JSON6 text, so
large files will make for a very large edit/view buffer — acceptable for a
first pass, not a blocker.

```js
const isRawEditable = types.showRawTypesonControls &&
  ((type === 'object' || type === 'array' ||
    type === 'set' || type === 'map' || type === 'filelist') ||
    recordMode || tupleMode);
```

## 2. New dependencies

- **`json-6`** (not the unrelated, unmaintained `json6` package — confirmed
  by inspecting both on the registry: `json6` is a dead 2015 prototype with no
  `module`/ESM build; `json-6` is d3x0r's actual JSON6 implementation, matches
  the GitHub project already linked from `README.md:124`, and ships an ESM
  build at `dist/index.mjs`). API used: both `JSON6.parse(text)` and
  `JSON6.stringify(value, replacer, space)` (default export). The README's
  one-line description of `stringify` ("uses JSON stringify, so don't have to
  replace") is misleading — reading `lib/json6.js:1195-1401` shows
  `JSON6.stringify` is reassigned to a real, independent stringifier (not the
  earlier `JSON.stringify` alias, which is just a bootstrapping placeholder
  overwritten further down the file). It emits unquoted keys wherever a key
  doesn't need quoting (`getIdentifier`, only quoting keywords, keys starting
  with a digit/`-`, or keys containing whitespace/special characters), giving
  genuinely simplified, more JS-object-literal-like output than
  `JSON.stringify` would — a better fit for "syntax-highlighted typeson in
  json6 format" as the *initial* text shown to the user. One behavioral quirk
  to note: it also re-sorts object keys alphabetically rather than preserving
  insertion order, which is harmless for round-tripping (the parser doesn't
  care about key order) but worth being aware of if the display order looks
  different from the form's own field order. `JSON6.stringify` produces the
  text shown when the editor/viewer opens; `JSON6.parse` reads back whatever
  superset syntax the user then edits it into (comments, unquoted keys,
  trailing commas, etc.). Have asked the `json-6` author whether he may be
  willing to accept a PR to stop the field sorting. If that isn't resolved
  upstream in time, fall back to reordering `JSON6.stringify`'s output
  ourselves post-hoc (walk the encapsulated value's own key order and reorder
  the top level of each emitted object to match, a small local fixup) rather
  than blocking this feature on the upstream change landing.
- **CodeMirror 6**: `codemirror` (meta-package bundling `basicSetup` +
  `EditorView`/`EditorState`) and `@codemirror/lang-javascript` — used as the
  language extension for *both* modes, not just eval. `@codemirror/lang-json`
  is deliberately not used: it's a strict-JSON grammar and would mishighlight
  (or just fail to recognize) JSON6's extensions — unquoted keys, comments,
  trailing commas — that the safe/Typeson mode's text legitimately contains.
  Since JSON6's syntax is (mostly) a subset of JS object-literal syntax, the
  JS language extension already highlights it reasonably; this gets more
  reliably true once the upstream `json-6` PR mentioned above (stop
  alphabetical key sorting) — and ideally a second guarantee that its
  `stringify` output is always valid ES/JS syntax, not just valid JSON6 — is
  accepted, since JSON6 as a spec is intentionally a bit looser than JS in a
  few corners.
- Both need the same vendoring treatment already established for
  jamilih/typeson-registry/zod/zodexy/acorn/mime (`package.json:39-46`,
  `src/vendor-imports.js`, demo `<script type="importmap">` blocks), so the
  repo's own no-bundler demo pages keep working: add `copy-json6` and
  `copy-codemirror` scripts copying the relevant `node_modules/**/dist` (and
  CodeMirror's transitive `@lezer/*`, `style-mod`, `w3c-keyname`, `crelt`)
  into `vendor/`, add matching bare-specifier re-exports in
  `src/vendor-imports.js`, and add entries to each demo HTML's import map.
  (npm consumers using their own bundler are unaffected either way, since
  `exports`/`main` in `package.json` already point at unbundled `src/`.)

## 3. New constructor options: `allowUnsafeEval` and `showRawTypesonControls`

In `src/types.js`, add two new options alongside the existing
`useZodexyErrorMessages`/`useZodexyErrorMessagesInTypes` options
(`src/types.js:437-451`), assigning both onto `this`:

- `allowUnsafeEval = false` — gates the eval-mode sub-feature (see §4).
- `showRawTypesonControls = true` — a master on/off switch for the whole
  feature. When `false`, neither the "Edit raw" nor "View raw" button is
  rendered at all on any object/array control (including root) — the feature
  is fully hidden, not merely disabled/greyed-out, for integrators who don't
  want end users to see it. `allowUnsafeEval` has no effect when this is
  `false`.

No further threading is required: `getUIForModeAndType` already passes
`types: this` into every `editUI`/`viewUI` call (`src/types.js:781,789`), and
`arrayType.js` already destructures `types` in both functions, so
`types.allowUnsafeEval`/`types.showRawTypesonControls` are immediately
readable where the buttons are built.

## 4. New shared module: `src/utils/rawTypesonEditor.js`

Extracting this out of `arrayType.js` (already 2771 lines) keeps the type
file's diff small. Exports:

- `getTypesonTextForValue(value, {types, format})` — builds a fresh
  `new Typeson().register(structuredCloningJsoe)` (import
  `structuredCloningJsoe` from `src/formats/structuredCloning.js`, the same
  curated type-spec set the real format iteration uses — deliberately
  *without* `functionSpec`, so the safe/Typeson text can never itself carry an
  executable function tag), calls `await typeson.encapsulateAsync(value)`,
  and returns `JSON6.stringify(encapsulated, null, 2)` for the simplified,
  unquoted-key initial display text (see §2).
- `getValueForTypesonText(text, {types, format})` — `JSON6.parse(text)` then
  `typeson.revive(parsed)` using the same registered instance/type-spec set.
  Parse/revive errors propagate to the caller to show inline.
- `getValueForEvalText(text)` — only ever called when `allowUnsafeEval` is
  true; `return (0, eval)('(' + text + ')');` (indirect eval, same "user
  opted in" rationale as `structuredCloning.js:23-27`). This never touches
  Typeson: the whole point of eval mode is that the user's text is a plain JS
  expression like `{a: new Date()}` that already evaluates to the real value
  directly, with no `$types` tagging or revive step involved.
- `getEvalSeedTextForValue(value)` — a **separate, dedicated** serializer used
  only to seed the editor's text *when switching into eval mode*; it must not
  reuse `getTypesonTextForValue`'s output. Typeson's encapsulated form tags
  special values (e.g. a `Date` becomes an ISO-string field plus a `$types`
  entry pointing at it); evaluating that tagged JSON6 text verbatim in eval
  mode would hand back the plain tagged object, not a real `Date` — eval mode
  has no revive step to undo the tagging. So this instead recursively emits
  genuine JS constructor source for the same value — `new Date(<ISO string>)`,
  `new Map([...])`, `new Set([...])`, a `RegExp`'s own literal form
  (`/pattern/flags`), a function's own `toString()` (mirroring
  `functionSpec.replace` in `structuredCloning.js:20-22`, which already does
  exactly this for functions) — recursing into plain objects/arrays
  structurally. Scope this to the same value shapes `structuredCloningJsoe`
  already covers; it's new, hand-rolled code (no extra dependency needed —
  each case is a one-line template), kept in this module specifically so it
  never gets confused with the Typeson-tagged serializer.
- `openRawEditorDialog({types, format, root, type, topRoot, readonly})` —
  builds the modal using the existing `src/utils/dialogs.js` helpers
  (`makeSubmitDialog` for edit mode, `makeDialog`/`alert`-style for read-only
  view mode, following the `fileType.js:201-241` pattern for structure).
  Internals:
  - Reads the *live* current value via
    `types.getValueForRoot(root, {typeNamespace, formats: types.formats, format, types}, '')`
    — using the control's own root element at click-time (not a stale
    construction-time closure variable), since nested fields may have been
    edited since the control was built.
  - Mounts a CodeMirror `EditorView` (readonly in view mode via
    `EditorState.readOnly.of(true)`/`EditorView.editable.of(false)`) inside
    the dialog, using the `javascript()` language extension from
    `@codemirror/lang-javascript` for both modes (Typeson/JSON6 and eval) —
    see §2 on why `@codemirror/lang-json` is not used.
  - In edit mode, if `types.allowUnsafeEval`, renders a small mode toggle
    (radio/select) between "Typeson (JSON6)" and "JS (eval)". Switching modes
    re-seeds the editor from the *original live value*, each mode using its
    own serializer — `getTypesonTextForValue` for Typeson/JSON6,
    `getEvalSeedTextForValue` for eval — rather than trying to textually
    convert one mode's already-produced text into the other's syntax. This
    means anything the user has typed but not yet saved is discarded on a
    mode switch; that's an acceptable, clearly-scoped trade-off (the toggle is
    for picking how to *start* editing, not for round-tripping in-progress
    edits between the two syntaxes).
  - On Save: parse via whichever mode is active
    (`getValueForTypesonText`/`getValueForEvalText`) *before* touching the
    underlying form tree at all. A parse failure — invalid JSON6 syntax from
    `JSON6.parse`, a Typeson `revive` error, or a thrown/syntax-error `eval`
    in unsafe mode — is caught and shown inline in the dialog; the dialog
    stays open with the user's text untouched and **no existing DOM/control
    is replaced or modified in any way**.

    When the control has a `specificSchemaObject` (i.e. a schema is actually
    driving this node), a successful parse is not sufficient on its own: the
    resulting value must also pass that schema before Save is allowed to
    proceed — reusing the existing schema-conformance check already used for
    the `'schema'` format, `parseValue(types, schema, originalShape, value)`
    in `src/formats/schema.js:203-210` (currently module-private; export it
    for reuse here). A schema failure is reported inline the same way a parse
    failure is — dialog stays open, nothing is written to the form. This is a
    deliberately stricter gate than ordinary field-by-field editing (which
    the rest of the app allows to sit in a transiently invalid state while
    typing): a raw-text bulk replacement is a single commit action, not
    incremental typing, so it's the right point to enforce the schema up
    front rather than accept a bad bulk replacement and only flag it
    afterward.

    Only once parsing (and, where applicable, schema validation) succeeds
    does the code proceed to call `types.setValue({type, root, value})` then
    `types.validate({type, root, topRoot, avoidReport: false})` — per the
    project rule that validity must always be recomputed and shown, never
    suppressed, after a bulk value replacement — and close the dialog. This
    means the existing object/array subtree in the form is swapped out only
    on a successful parse; a bad edit never leaves the form in a
    half-replaced or blanked state.

## 5. Changes to `src/fundamentalTypes/arrayType.js`

The eligibility check (§1) is computed identically in both functions, mirroring
the existing `recordMode`/`tupleMode` derivation already present in each.

- **`viewUI`** (~`arrayType.js:416-701`): when `isRawEditable`, add a plain
  text button right after the existing collapse toggle (`arrayType.js:650-662`),
  e.g. `['button', {class: 'viewRawTypeson', $on: {click () {...}}}, ['View raw']]`,
  calling `openRawEditorDialog({..., readonly: true})`. Inserted *after* the
  collapse button (not before) so `getInput`'s `$e(root, 'button')`
  (`arrayType.js:702-705`, which grabs the first button for focus purposes)
  keeps selecting the same element as today.
- **`editUI`** (~`arrayType.js:709-2767`): when `isRawEditable`, add the
  analogous `['button', {class: 'editRawTypeson', ...}]` next to `minusButton`
  at the `[..., minusButton, arrayContents]` assembly (`arrayType.js:2686-2687`),
  calling `openRawEditorDialog({..., readonly: false})`.
- Both call sites pass `root: div` (the control's own `div.arrayHolder` /
  `div[data-type]` element already in scope in each function), `type`,
  `topRoot`, `types`, and `format`.

## 6. CSS

No new styling is required to match existing conventions — buttons in this
file are plain unstyled `<button>` elements with class names used only as
JS/test hooks (`arrayType.js:2139-2182` `addArrayElement`, confirmed no
matching CSS rule in `src/jsoe.css`). Add one small `.jsoe-raw-editor` rule to
`src/jsoe.css` sizing the CodeMirror host element, following the existing
`.view-binary, .view-text { width:300px; height:300px; }` convention
(`src/jsoe.css:137-140`).

## 7. Out of scope

- A real bidirectional syntax converter between the Typeson/JSON6 mode and
  the eval mode's text — switching modes re-seeds from the original value
  instead (§4).
- A `FileList` polyfill/construction library — not needed (§1).
- Constructing real, upstream-standard-conformant `FileList` instances at
  all; jsoe's own filelist value model already tolerates a plain array-like
  of `File`s, so this proposal doesn't change that.

## 8. Tests

- Unit tests for `getTypesonTextForValue`/`getValueForTypesonText`/
  `getValueForEvalText`/`getEvalSeedTextForValue` round-tripping
  representative values (plain object, array, nested Date/RegExp/Map/Set, and
  — only under `allowUnsafeEval` — a function).
- Cypress specs exercising: the view-mode button opens a read-only highlighted
  panel at root and at a nested object/array; the edit-mode button opens,
  editing valid JSON6 text and saving updates the real form fields; invalid
  syntax on Save shows an inline error and does not close the dialog; a
  schema-driven control rejects a syntactically valid but schema-invalid
  value the same way; the eval-mode option is absent unless `allowUnsafeEval`
  is passed to `Types`, and, when present, evaluated text populates the
  control; `showRawTypesonControls: false` hides both buttons everywhere.
  Keep this work free of stray `console.log(obj)` lines — several specs stub
  `window.console.log`.

## 9. Verification

1. `npm test` (unit) and the Cypress suite to confirm no regressions in
   existing object/array editing flows.
2. Manually run the demo (`demo/index.html` or `demo/index-schema.html`) after
   adding the CodeMirror import-map entries, exercise "View raw"/"Edit raw" at
   root and on a nested object/array, and confirm the unsafe-eval mode is
   hidden by default and appears only when the demo is changed to construct
   `new Types({allowUnsafeEval: true})`.
3. Confirm `new Types({showRawTypesonControls: false})` renders no "Edit raw"/
   "View raw" buttons anywhere in the tree (root or nested), and that the
   default (option omitted) still shows them.

## Summary of the change surface

One new dependency pair (`json-6`, CodeMirror 6) plus their vendoring, two new
`Types` constructor options, one new util
(`src/utils/rawTypesonEditor.js`), an export added to
`src/formats/schema.js` (`parseValue`), and a button + eligibility check added
to both `viewUI` and `editUI` in `src/fundamentalTypes/arrayType.js`. No
existing behavior changes when the buttons are unused; `showRawTypesonControls`
lets integrators opt out entirely.
