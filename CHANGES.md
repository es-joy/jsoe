# CHANGES TO `@es-joy/jsoe`

## 0.28.0

- feat: add raw Typeson/JSON6 "View raw"/"Edit raw" buttons to every
    object/array-family control (`object`, `array`, `set`, `map`, `record`,
    `tuple`, `filelist`), including the root control
    - New `Types` constructor options: `showRawTypesonControls` (default
        `true`) shows or hides the buttons entirely; `allowUnsafeEval`
        (default `false`) additionally offers editing/seeding the same value
        as literal, `eval`'d JS source instead of Typeson/JSON6
    - New `src/utils/rawTypesonEditor.js` opens a dialog with a
        syntax-highlighted (CodeMirror 6) editor; Save re-populates the
        control's children via the same walk `structuredCloning`'s `iterate`
        already uses for building them, then re-validates. A schema-driven
        control's raw edit is also checked against its own schema before
        being accepted
    - New dependencies `json-6` (parsing only — its own `stringify` has a
        string-value-quoting bug, worked around locally) and CodeMirror 6,
        vendored for the bundler-less demo pages
    - Eval-mode source reconstruction covers `Date`/`RegExp`/`Map`/`Set`/
        `Symbol`/boxed primitives/the `Error` family (including `cause` and
        `AggregateError`'s nested errors)/`DOMException`/`DOMRect`/`DOMPoint`/
        `DOMMatrix`/`ArrayBuffer`/`DataView`/typed arrays (including
        `Float16Array`)/`Blob`/`File`/`FileList`/`-0`; a `Promise` or an
        unrecognized class instance throws a clear error instead of silently
        producing a same-shaped-but-wrong value
    - New demo: `demo/index-unsafe-eval.html`
- fix: resetting an object/array-family control's legend numbering
    (`$resetItemIndex`, used after a raw-value replace) now resets to the
    container's own true starting baseline instead of an array-specific
    `-1`, so replacing a container's content without changing its property
    count keeps each unchanged property's legend number the same as before
    the edit

## 0.27.0

- feat: add `properties` schema support: a zodexy `{type: 'properties'}` node
    (Zod 4.5+ `z.properties()`) is now edited, viewed, and preloaded through the
    same `object` UI, differing from `object` in that it has no `catchall` and
    does not strip properties outside its declared shape.
    - `{type: 'properties'}` maps to the fundamental `object` type
        (`zodexToStructuredCloningTypeMap`), so it reuses the object editor;
        `getTypesForSchema` handles it alongside `object`.
    - A preloaded key that is *not* in the declared shape is kept (not
        stripped) and rendered as a free property offered the unconstrained
        type choice, the same treatment a `looseRecord`'s non-conforming entry
        gets. `convertFromTypeson` (`formats/schema.js`) and `getChildSchema`
        (`fundamentalTypes/arrayType.js`) return `{type: 'unknown'}` for such a
        key. See the related `fix:` below for why.
    - Because it renders as an `object`, a `properties` node would otherwise be
        an indistinguishable "Object" in the type pull-down (`types.js`
        `getOptionForType`) and the edit-mode container-heading tooltip
        (`arrayType.js`); it is now named "Properties" when the schema carries
        no `meta` label of its own. `xor`-branch labels
        (`typeChoices.js` `deriveXorBranchLabel`) likewise treat it as a
        property bag.
    - A new `isPropertyBagType` helper (`object` or `properties`) lets
        `mergeSchema` merge the declared property schemas of two intersected
        `properties` nodes — the previous `type !== 'object'` guard returned
        early and silently dropped the right branch's properties — and lets
        `isValueValidationRequired` treat `properties` like `object` (its
        per-property controls already carry their own schemas, so no
        value-level reparse is needed).
- fix: a preloaded property outside an `object` schema's declared shape, when
    the schema has no `catchall`, is now edited through the unconstrained type
    choice (`{type: 'unknown'}`) instead of an "unschema'd" control. Previously
    `convertFromTypeson` returned the value's bare runtime type while
    `getChildSchema` returned `undefined`, so the type-chooser was built with
    no `schemaContent` and could render an extra, stray control (e.g. a number
    widget beside the string input). `{type: 'unknown'}` expands to the full
    candidate-type set, so the lossless-match pass picks the single control
    matching the value and still offers the `<select>` to change it — the same
    handling `properties` and a `looseRecord`'s non-conforming entry get. A
    strict `object` still strips the key on parse; this governs only how it is
    edited.
- feat: add `iban` string kind

## 0.26.1

- fix: validate invalid regexp source edits
- fix: schema editor readiness and zodexy schema rendering
    - Fixed programmatic schema branch selection so `$setType({specificSchema})` builds the supplied schema-specific UI branch.
    - Made `setValue()` readiness wait for deferred nested control builds before resolving.
    - Preserved `avoidReport` through reference validation during programmatic setup.
    - Fixed validation of flattened schema branches containing `$ref` children by retaining the original schema document for reference resolution.
    - Added Cypress coverage for programmatic schema branch selection and rendering existing schema values with record entries.

## 0.26.0

- feat: awaitable readiness for deferred type/editor builds
- feat: awaitable readiness for type-choices builds (whenReady / $whenReady)

## 0.25.1

- fix: retry if select not connected

## 0.25.0

- feat: surface schema `meta` in viewUI/editUI: `meta.title` is now the
    preferred source for a type's visible label/tooltip (falling back to
    `meta.description`, then the legacy top-level `description`), and a
    read-only info toggle beside each type reveals a table of the remaining
    metadata (`meta.description` long text, `id`, `deprecated`, and any custom
    keys). A `deprecated` schema tags its info toggle (muted-red glyph plus a
    "deprecated" mark) in both view and edit mode, and strikes the field label
    through — the value in viewUI, the property/item legend in editUI. The
    `jsoe` key on `meta` is reserved for jsoe UI directives and is shown in the
    table (acting on directives such as `tableView` is not yet implemented).
    `description` set directly on a schema is now deprecated in favor of
    `meta.description`.
- feat: add `looseRecord`
- feat: `xor`
- feat: adds serialization for template literals (with `parts`)
- feat: for string schemas with kind uuid, check for version to determine regex for validation
- feat: support schema `type: 'file'` with file type
- feat: `min` and `max` schema validation for Maps
- feat: support credit card string
- feat: treat a `z.stringbool()` schema (serialized as a string -> boolean
    `pipe` with `truthy`/`falsy`/`case`) as a refinement of the String type,
    validating the value against the recognized truthy/falsy tokens
- feat: check nanoid with `length`
- feat: add bigint format validation
- feat: validate email string types using any pattern/flags properties
- feat: add string kinds with validation: jwt (along with optional `algorithm` property), e164, xid, guid, ksuid
- feat: add to literals: bigInt, boolean, null, and undefined types
- feat: optionally utilizes custom errors
- fix: allow any type as Map key
- fix: remove enumType, voidType, and neverType, catchType, literalType as were not really modeling the data; instead have them confine other types
- fix: remove `record` and `tuple` as first-class types (and from the type
    pull-down); a `record` schema now refines the `Object` type and a `tuple`
    schema refines the `Array` type. All prior record/tuple layout is retained,
    now driven by the schema: value validation, the parent `description` as the
    label, and every child `description` (record `key`/`value`, tuple
    positional `items` and `rest`). The `Record{…}` / `Tuple[…]` router-string
    syntax is dropped.
- fix: delegate to Zod 4's regexes for string validation
- fix: remove dropped `unknownKeys`
- fix: allow symbol again, but given dropped schema support
- fix: drop nativeEnum as dropped from Zod/Zodexy
- fix: update literals per changed API
- fix: rework function types to work with Zod 4 Zodexy
- fix: switch from removed "effect" to counterparts

## 0.24.3

- chore: update typeson-registry and devDeps.

## 0.24.2

- fix: swapping of object properties regression

## 0.24.1

- fix: Safari bug with `revokeObjectURL` and videos
- fix: switch to mp4 recording for now over webm for sake of Safari
- fix: set path for now to sceditor as relative to root

## 0.24.0

- feat: Support for non-structured cloning types (symbol, promise, function)

## 0.23.1

- fix(blob HTML): truncating file size at comma

## 0.23.0

- chore: update jamilih, devDeps.

## 0.22.0

- feat: async encapsulation

## 0.21.0

- feat: use sourcemaps

## 0.20.6

- fix(`recordType`): failing `toValue` conversion
- fix(`objectType`): resume reporting duplicate property names
- fix(schema demo): allow for non-schema choices
- fix: ensure tooltip exists for base property if just an array/set
    element description

## 0.20.5

- fix: supply flattened schema for type choices

## 0.20.4

- fix: disable incomplete symbol/function/promise support (leaving Zodex
    schema)

## 0.20.3

- fix: require object only if no schema

## 0.20.2

- fix: setting of pull-downs with schemas

## 0.20.1

- fix: allow detection of matching schema which are copies and not references
- fix: should pass original schema to editUI for `schemaContent`
- fix: refer to original JSON

## 0.20.0

- feat: make `getTypesForSchema` public

## 0.19.1

- fix: ensure `originalShape` passed to `dezerialize()` (`$ref`'s require)

## 0.19.0

- feat: change API for `$setFormat` to accept `schema` and change API to object with
    `valueFormat`, `autoTrigger`, and `schema` properties.

## 0.18.0

- feat: give option to disable `autoTrigger` for building type choices, e.g.,
    with `$setFormat(format, autoTrigger)`

## 0.17.0

BREAKING CHANGES: API changes to `formatAndTypeChoices` and
    `getFormatAndSchemaChoices`

- feat: Zodex schema support

## 0.16.0

- feat(regexp): support v flag
- docs: add simpler demo

## 0.15.0

- feat: `buffersource`

## 0.14.0

- feat: allow DOMRect, DOMPoint, DOMMatrix read-only versions
- feat: add noneditable type to catch and transparently pass on
    unsupported types

## 0.13.8

- fix: array/object reference value-retrieval broken

## 0.13.7

- fix: array/object reference value-retrieval broken

## 0.13.6

- fix: distribution file not updated

## 0.13.5

- fix(TS): allow for default arguments

## 0.13.4

- fix(TS): allow for default arguments

## 0.13.3

- fix(TS): allow for default arguments

## 0.13.2

- fix(TS): allow for default arguments

## 0.13.1

- fix(TS): allow for default arguments

## 0.13.0

- refactor(BREAKING): make Types and Formats classes

## 0.12.4

- refactor: Rollup dist.

## 0.12.3

- refactor: TS work

## 0.12.2

- refactor: TS work

## 0.12.1

- refactor: TS work

## 0.12.0

- feat: allow order to be changed in menu
- feat: help TS find files (when imported from file system)
- chore: update devDeps.

## 0.11.1

- fix: add missing type title to svg dom types

## 0.11.0

- feat: support `DOMException`, `DOMPoint`, `DOMMatrix`, `DOMRect` types

## 0.10.0

- feat: add `filelist` type

## 0.9.0

- feat: add `blob` type

## 0.8.1

- feat: fix bug with `file` in array/object context not triggering file
    picker

## 0.8.0

- feat: make `File` fully editable (also by modified date or
    string contents or if by scratch)

## 0.7.1

- feat: fix bug with `file` in array/object context not triggering file
    picker

## 0.7.0

- feat: add `file` type including video, audio, photo, and
   screen sharing recording

## 0.6.1

- refactor: avoid problems for instrumenter

## 0.6.0

- feat: add `set`, `map`, `error`, and special error types
- fix: ensure `Types.getTypeForRoot` always returns a string
- fix: ensure Blob textarea is independent per instance

## 0.5.1

- fix: TS types

## 0.5.0

- chore: update `jamilih`, `typeson-registry`, devDeps.;
  use nodeNext moduleResolution

## 0.4.6

- fix: TS types

## 0.4.5

- fix: TS types (Make `stateObj` argument optional)

## 0.4.4

- fix: TS types (make `customValidateAllReferences` optional)

## 0.4.3

- fix: TS types (`topRoot` optional in `buildTypeChoices`)

## 0.4.2

- fix: TS types

## 0.4.1

- fix: add `main`

## 0.4.0

- feat: TypeScript types

## 0.3.0

- feat: negative zero support
- chore: bump jamilih, typeson-registry, devDeps.

## 0.2.0

- refactor(BREAKING): `typeChoices`->`formatAndTypeChoices`;
    add different `typeChoices`, adding methods to both
- feat: add `getControlsForFormatAndValue` utility
- fix: ensure `setValue` removes existing content
- feat: add stylesheet

## 0.1.0

- refactor: have `getFormatAndSchemaChoices` return fragment of options
- refactor: avoid placement dependency for return results of `typeChoices`
- refactor: return array of return objects for easier direct embedding
   in Jamilih
- docs: better API docs
- docs: add demo
- chore: switch port for testing

## 0.0.2

- fix: `node_modules` paths

## 0.0.1

- initial commit
