# @es-joy/jsoe

JavaScript Object Editor.

Editing and viewing of arbitrary JavaScript objects.

See a [demo](https://es-joy.github.io/jsoe/demo/) of this tool or
[a demo](https://brettz9.github.io/idb-manager/index-pages.html) of an
app using this tool.

## Formats

Formats are a collection of allowed types.

Supported formats include:

- Structured Cloning (using [typeson](https://github.com/dfahlander/typeson)) (e.g., IndexedDB values)
- JSON
- IndexedDB keys

## Fundamental types

These are generally atomic types which correlate to JavaScript language structures.

Supported types include:

- Array reference (for cyclic arrays)
- Array
- `BigInt`
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
- Lacks support for certain Structured Cloning types. See to-dos below.

## To-dos

1. Support Schemas based on a JSON serialization of Zod
1. Expand fundamental types
    1. Not in typeson-registry
        1. Structured Cloning
            1. Web/API types (besides those listed below)
                1. See <https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm#webapi_types>
    1. Already in typeson-registry
        1. Structured Cloning
            1. (JavaScript types already complete)
            1. Web/API types
                1. imagedata, imagebitmap
                1. cryptokey
                1. domquad
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
1. Implement as Custom Elements?
1. Add drag-and-drop support for `File` type
1. Import CSV as array
