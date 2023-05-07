# @es-joy/jsoe

JavaScript Object Editor.

Editing of arbitrary JavaScript objects.

See a [demo](https://es-joy.github.io/jsoe/demo/) of this tool or
[a demo](https://brettz9.github.io/idb-manager/index-pages.html) of an
app using this tool.

## Formats

Formats are a collection of allowed types.

- Structured Cloning (using [typeson](https://github.com/dfahlander/typeson)) (e.g., IndexedDB)
- JSON
- IndexedDB keys

## Fundamental types

These are generally atomic types which correlate to JavaScript language structures.

- Array reference (for cyclic arrays)
- Array
- `BigInt`
- `Boolean` object
- `Date`
- `null`
- `Number` object
- number
- Object reference (for cyclic objects)
- Object
- `RegExp`
- `String` object
- string
- `undefined`

## Subtypes

These map to a subset of JavaScript language structures. Note that false and true were common and limited enough in number to justify their own subtype for the sake of having a quick pull-down entry.

- Blob (text/html)
- `false`
- `true`

## Supertypes

These are collections of individual types, justified by the subitems not being so frequent as to necessitate their own
separate enumeration.

- Special Real Number (`Infinity`, `-Infinity`, `-0`) - Used with IndexedDB keys (even though -0 apparently [to be converted](https://github.com/w3c/IndexedDB/issues/375) to 0)
- Special Number (`Infinity`, `-Infinity`, `-0`, `NaN`) - Used with Structured Cloning values

## To-dos

1. Add tests of demo (lower priority as have tests in `idb-manager`)
1. Expand fundamental types
    1. Not in typeson-registry
        1. Structured Cloning
            1. arraybufferview
    1. Already in typeson-registry
        1. Structured Cloning
            1. map, set,
            1. blob, file, filelist
            1. arraybuffer
            1. dataview, imagedata, imagebitmap
            1. error, errors
            1. Typed Arrays
                1. int8array
                1. uint8array
                1. uint8clampedarray
                1. int16array
                1. uint16array
                1. int32array
                1. uint32array
                1. float32array
                1. float64array
            1. Intl (imperfect)
                1. IntlCollator
                1. IntlDateTimeFormat
                1. IntlNumberFormat
1. Expand subtypes
    1. As supported by Zod, JSON Schema, etc. (e.g., email addresses as
        subtype of `string`)
1. Support Schemas based on a JSON serialization of Zod
    - Need special handling for arrays with properties (intersections of arrays and objects) and to handle recursion
    - May just need to streamline to a simpler JSON Schema/Zodex Schema?

This would present a choice of array with specific elements, object
with specific properties, or string (with `maxLength`).

```js
const schema = {union: [{
  type: 'array',
  refinements: [],
  // A union of allowable children
  arrayChildElements: [{
    type: 'string'
  }, {
    type: 'object',
    childElements: {key1: [/* ... */], key2: [/* ... */]}
  }]
  // For tuple, also potentially:
  //   restType: {type: 'object', childElements: {...}}
}, {
  type: 'object',
  refinements: [],
  childElements: {
    // A union of elements
    key1: [],
    key2: []
  }
}, {
  type: 'string',
  // A union of refinements
  refinements: [{
    minLength: 20,
    maxLength: 100
  }, {
    minLength: 500
  }]
  // childElements: {}
}]};
console.log(schema);
```
