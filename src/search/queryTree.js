/**
 * JSDoc-only typedefs for the schema-driven search query tree. No runtime
 * exports live here; construct nodes through `queryTreeBuilders.js` instead
 * so every search module (and every test fixture) goes through one place.
 *
 * Leaf `path` values reuse the existing JSON-Pointer convention from
 * `src/utils/jsonPointer.js` (`makeJSONPointer`/`getJSONPointerParts`)
 * rather than Mongo's dot-notation, so the search tree shares a path format
 * with the rest of jsoe (e.g. `arrayType.js`'s `currentPath`).
 *
 * The leaf vocabulary borrows MongoDB's own operator names (`$and`/`$or`,
 * `$gt`/`$gte`/`$lt`/`$lte`, `$in`/`$nin`, `$regex`/`$options`, `$exists`)
 * wherever a leaf kind has a clean Mongo equivalent, so a host can adapt the
 * common cases to `sift()` (or real MongoDB) almost for free - this is not a
 * claim of full drop-in Mongo query-document compatibility: several
 * jsoe-specific leaf kinds have no Mongo equivalent and stay custom, and
 * every leaf keeps jsoe's own `kind`-discriminated, path-carrying shape
 * rather than Mongo's field-keyed document shape.
 */

/**
 * @typedef {{$and: QueryNode[]}} QueryAnd
 */

/**
 * @typedef {{$or: QueryNode[]}} QueryOr
 */

/**
 * `object` (via `$exists: true/false`).
 * @typedef {{kind: 'hasProperty', path: string, $exists: boolean}} QueryHasPropertyLeaf
 */

/**
 * `array`/`set`/tuple-with-rest/`filelist` (via `$size`, or a range of
 * operators when the schema doesn't pin an exact length), +`sparseCheck`
 * for array sparse/not-sparse.
 * @typedef {{
 *   kind: 'lengthSize',
 *   path: string,
 *   $size?: number,
 *   $gt?: number, $gte?: number, $lt?: number, $lte?: number,
 *   sparseCheck?: boolean
 * }} QueryLengthSizeLeaf
 */

/**
 * `number`/`NumberObject`/`bigint`/`date`/`buffersource`, with `valueType`
 * distinguishing them. Bounds are Mongo-style `$gt`/`$gte`/`$lt`/`$lte`
 * rather than a `min`/`max` pair plus an inclusive boolean - inclusivity is
 * simply which operator is present. The README's "Is Not Range" variant
 * wraps the same leaf in `$not` rather than being a separate kind.
 * @typedef {{
 *   kind: 'range',
 *   path: string,
 *   valueType: 'number'|'NumberObject'|'bigint'|'date'|'buffersource',
 *   $gt?: number|bigint|string,
 *   $gte?: number|bigint|string,
 *   $lt?: number|bigint|string,
 *   $lte?: number|bigint|string
 * }} QueryRangeLeaf
 */

/**
 * @typedef {{kind: 'not', query: QueryNode}} QueryNotLeaf
 */

/**
 * `number`/`NumberObject`: is/is-not an integer.
 * @typedef {{kind: 'integerCheck', path: string, isInteger: boolean}} QueryIntegerCheckLeaf
 */

/**
 * `string`/`StringObject`/`Blob`/`File`/regexp-source/symbol-description
 * (via `$in`/`$nin`).
 * @typedef {{
 *   kind: 'literalSet',
 *   path: string,
 *   $in?: unknown[],
 *   $nin?: unknown[]
 * }} QueryLiteralSetLeaf
 */

/**
 * `string`/`StringObject`/`Blob`/`File`/regexp-source/symbol-description
 * (via `$regex`/`$options`, matching Mongo's own field names).
 * @typedef {{
 *   kind: 'regex',
 *   path: string,
 *   $regex: string,
 *   $options?: string
 * }} QueryRegexLeaf
 */

/**
 * `string`/`StringObject`/`Blob`/`File`/regexp-source/symbol-description:
 * a substring the value must not contain.
 * @typedef {{
 *   kind: 'notContains',
 *   path: string,
 *   value: string
 * }} QueryNotContainsLeaf
 */

/**
 * `enum`, SpecialNumber's `Infinity`/`-Infinity`/`NaN`/`-0` (via
 * `$in`/`$nin`).
 * @typedef {{
 *   kind: 'multiSelect',
 *   path: string,
 *   $in?: unknown[],
 *   $nin?: unknown[]
 * }} QueryMultiSelectLeaf
 */

/**
 * Native enum key-vs-value; no Mongo equivalent, stays custom.
 * @typedef {{
 *   kind: 'keyValueEnum',
 *   path: string,
 *   matchKeys: boolean,
 *   values: unknown[]
 * }} QueryKeyValueEnumLeaf
 */

/**
 * Union/xor/discriminatedUnion "has type", carrying `discriminatorValue`
 * when applicable, including when nested under a Map/Record key or value;
 * no Mongo equivalent, stays custom.
 * @typedef {{
 *   kind: 'typeOf',
 *   path: string,
 *   searchType: string,
 *   discriminatorValue?: unknown
 * }} QueryTypeOfLeaf
 */

/**
 * XPath/CSS-selector/full-text/raw-HTML-regex; no Mongo equivalent.
 * @typedef {{
 *   kind: 'blobHTML',
 *   path: string,
 *   mode: 'xpath'|'cssSelector'|'fullText'|'rawHTMLRegex',
 *   value: string
 * }} QueryBlobHTMLLeaf
 */

/**
 * Per-dimension ranges for DOMRect/Point/Matrix, each dimension itself a
 * `range` leaf, + `readonlyCheck`/`dimensionCheck` (is/is-not readonly,
 * is/is-not 3d); no Mongo equivalent.
 * @typedef {{
 *   kind: 'domShape',
 *   path: string,
 *   dimensions: {[dimension: string]: QueryRangeLeaf},
 *   readonlyCheck?: boolean,
 *   dimensionCheck?: 2|3
 * }} QueryDomShapeLeaf
 */

/**
 * Paired key+value leaves with a joint-match flag; no Mongo equivalent.
 * @typedef {{
 *   kind: 'mapRecordJoint',
 *   path: string,
 *   keyQuery?: QueryNode,
 *   valueQuery?: QueryNode,
 *   joint: boolean
 * }} QueryMapRecordJointLeaf
 */

/**
 * Promise/literal/catch/function: forwards to a nested `QueryNode` for the
 * child schema so the tree stays uniform even where a type adds no
 * constraint of its own; purely structural, no Mongo equivalent.
 * @typedef {{
 *   kind: 'passThrough',
 *   path: string,
 *   query?: QueryNode
 * }} QueryPassThroughLeaf
 */

/**
 * Undefined/void/null (via `$exists`).
 * @typedef {{kind: 'presence', path: string, $exists: boolean}} QueryPresenceLeaf
 */

/**
 * Boolean/BooleanObject - Mongo would normally express this as a bare
 * `{field: true}` shorthand, which doesn't fit our path-carrying leaf
 * shape, so this stays a custom kind.
 * @typedef {{
 *   kind: 'booleanEquals',
 *   path: string,
 *   value: boolean
 * }} QueryBooleanEqualsLeaf
 */

/**
 * @typedef {QueryHasPropertyLeaf|QueryLengthSizeLeaf|QueryRangeLeaf|
 *   QueryNotLeaf|QueryIntegerCheckLeaf|QueryLiteralSetLeaf|QueryRegexLeaf|
 *   QueryNotContainsLeaf|QueryMultiSelectLeaf|QueryKeyValueEnumLeaf|
 *   QueryTypeOfLeaf|QueryBlobHTMLLeaf|QueryDomShapeLeaf|
 *   QueryMapRecordJointLeaf|QueryPassThroughLeaf|QueryPresenceLeaf|
 *   QueryBooleanEqualsLeaf
 * } QueryLeaf
 */

/**
 * @typedef {QueryAnd|QueryOr|QueryLeaf} QueryNode
 */

export {};
