[![Licenses badge](https://raw.githubusercontent.com/es-joy/jsoe/main/badges/licenses-badge.svg?sanitize=true)](badges/licenses-badge.svg)
[![coverage badge](https://raw.githubusercontent.com/es-joy/jsoe/main/badges/coverage-badge.svg?sanitize=true)](badges/coverage-badge.svg)

# @es-joy/jsoe

JavaScript Object Editor.

Editing and viewing of arbitrary JavaScript objects.

See a [demo](https://es-joy.github.io/jsoe/demo/) of this tool or
[a demo](https://brettz9.github.io/idb-manager/index-pages.html) of an
app using this tool.

## Formats

Formats are a collection of allowed types.

Supported formats include:

- Schemas (using [zodexy](https://github.com/brettz9/zodexy) serialization of [Zod](https://github.com/colinhacks/zod))
- Structured Cloning (using [typeson](https://github.com/dfahlander/typeson)) (e.g., IndexedDB values)
- JSON
- IndexedDB keys

## Fundamental types

These are generally atomic types which correlate to JavaScript language structures.

Supported types include:

- Array reference (for cyclic arrays)
- Array
- `BigInt`
- `bigintObject`
- `Blob`
- `Boolean` object
- `Date`
- `DOMException`,
- `Error`
- `TypeError`, `RangeError`, `SyntaxError`, `ReferenceError`, `EvalError`,
    `URIError`, `AggregateError`, `InternalError`
- `File`
- `FileList`
- `Map`
- Non-editable type (catch-all for not-yet-supported object types; allows
    for preexisting data to be passed on transparently)
- `null`
- `Number` object
- number
- Object reference (for cyclic objects)
- Object
- `RegExp`
- `Set`
- `String` object
- string
- `undefined`

There are also the following fundamental (structured-cloning capable
Zodexy) schema types:

- `boolean` (using in place of true/false when schema specifies)
- `catch`
- `enum`
- `literal`
- `nan` (standalone in Zodexy)
- `void` (preferred in Zodexy when specified as such)

And there are the following non-structured-cloning Zodexy schema types:

- `function`
- `promise`

The following is no longer supported as a first class type by Zod and thus Zodexy, but it can be supported by type `any` with `checks` (as can other types).

- `symbol`

Has some support for JSON references, but no UI for them at preent.

## Subtypes

These map to a subset of JavaScript language structures. Note that false and true were common and limited enough in number to justify their own subtype for the sake of having a quick pull-down entry.

Supported subtypes include:

- Blob (text/html)
- `false`
- `true`

## Supertypes

These are collections of individual types, justified by the subitems not being so frequent as to necessitate their own
separate enumeration.

Supported supertypes include:

- Special Real Number (`Infinity`, `-Infinity`, `-0`) - Used with IndexedDB keys (even though -0 apparently [to be converted](https://github.com/w3c/IndexedDB/issues/375) to 0)
- Special Number (`Infinity`, `-Infinity`, `-0`, `NaN`) - Used with Structured Cloning values
- `DOMMatrix` (also includes `DOMMatrixReadOnly`)
- `DOMPoint` (also includes `DOMPointReadOnly`)
- `DOMRect` (also includes `DOMRectReadOnly`)
- `buffersource` includes `ArrayBuffer`, `DataView`, and TypedArrays
    (int8array, uint8array, uint8clampedarray, int16array, uint16array,
    int32array, uint32array, float32array, float64array,
    bigint64array, biguint64array)

## Known issues

- Cannot provide maps with object keys pointing to the same objects as used
    as map values; likewise with Sets?
- Certain cyclical structures may have issues
- `typeson-registry`'s structured cloning should throw on more objects, so
   bad data doesn't end up stored
- Currently doesn't support using `isNullable`; instead just use `null` with
    a `union`.
- Lacks support for certain Structured Cloning types. See to-dos below.
- Excessive use of `reportValidity` (e.g., in BufferSource, as seen by
    index-instrumented demo) causing focus of element; should only be triggered by
    event (and only if not auto-triggered event)

## To-dos

1. Ability to replace content with raw JSON/Typeson/Safe Eval (no functions in default mode, etc.)/AI (including speech-to-text) if it validates
1. Expand fundamental types
    1. Not in typeson-registry
        1. Structured Cloning
            1. Web/API types (besides those listed below)
                1. See <https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm#webapi_types>
    1. Already in typeson-registry
        1. Structured Cloning
            1. (JavaScript types already complete)
            1. Web/API types
                1. quotaexceedederror
                1. webtransporterror
                1. imagedata
                1. imagebitmap
                1. domquad
                1. cryptokey
                1. audiodata
                1. encodedaudiochunk
                1. encodedvideochunk
                1. videoframe
            1. Our own custom derivative types? (e.g., MIDI using TypedArray)
1. Expand subtypes
    1. String
        1. As supported by Zod, JSON Schema, etc. (e.g., email addresses as
            subtype of `string`, color as a subtype of string)
    1. `File`/`Blob`
        1. Drawing image for `image/png`, etc. `File`'s
        1. Drawing SVG program for `application/svg` `File`
        1. JS/CSS/HTML/XML/Markdown/JSON/CSV/text text editor (including
            syntax highlighting in view mode); with text-to-speech
        1. OCR (`TextDetector` API if implemented) added as image pop-up
            utility
1. Might put views and data into separate repos
1. Could show more schema data (e.g., min and max) in viewUI, e.g., as extra
    rows in the schema `meta` info toggle
1. Implement as Custom Elements?
1. Add drag-and-drop support for `File` type
1. Import CSV as array
1. **Schema-driven search**
    1. Objects: "Has property &lt;property pull-down>" (avoid listing required)
    1. Arrays, Set, FileList, tuple with rest: "Has length/size of &lt;number>"; arrays: "Is/Is not sparse"
    1. Union/Discriminated Union: "Has type &lt;type pull-down>" (including when union is part of a key to records, maps, discriminator of discriminated union, etc.)
    1. undefined/void, null, NaN, instanceof, Non-editable (no variants to allow for distinct search; if optional, would be in union); non-editable might allow arbitrary JS query against it, but...
    1. boolean, BooleanObject: true or false
    1. number, NumberObject: OR Ranges/Is Not Range, Is/Is Not Integer
    1. bigint, bigint object: OR Ranges/Is Not Range
    1. BufferSource: OR Range/IS Not Range
    1. string, StringObject, Blob, File, regexp (source), symbol (description): OR literal or regex search/Does Not contain search; regexp gets multiple select search of flags or regex search?
    1. Blob HTML:
        1. XPath (ideally JS like jtlt for XSLT-like JS or doc() and collection() as part of $for in FLWOR shorthand for XQuery-like JS)
        2. CSS selectors
        3. Full text search
        4. Regex search of raw HTML
    1. Special number: multiple select of "Infinity", "-Negativity", "NaN"
    1. date: OR date range, Is Not Range
    1. Enum, Native Enum: multiple select; native enum also can search key vs. value
    1. promise, Literal, catch: pass on children
    1. function; pass on args, return type
    1. Error, Special Errors, DOMException: Literal/Regex search of child string properties, numeric of number children; also pull-down of name for DOMException
    1. DOMRect, DOMPoint, DOMMatrix: numeric search ranges for children; "Is/Is not Readonly"; DOMMatrix: "Is/Is not 3d"
    1. Map, Record: string-type searches of keys, values; ideally would allow search to insist on match of key and value (e.g., has key 2-4 and value 7-9)
    1. Tuple (with rest has size search as with arrays): otherwise just passes on children
