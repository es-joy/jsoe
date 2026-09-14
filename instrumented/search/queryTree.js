function cov_1gkcta8evx(){var path="/Users/brett/jsoe/src/search/queryTree.js";var hash="94e98cf4c7cef833d907bb6577c3915ff89d5241";var global=new Function("return this")();var gcv="__coverage__";var coverageData={path:"/Users/brett/jsoe/src/search/queryTree.js",statementMap:{},fnMap:{},branchMap:{},s:{},f:{},b:{},_coverageSchema:"1a1c01bbd47fc00a2c39e90264f33305004495a9",hash:"94e98cf4c7cef833d907bb6577c3915ff89d5241"};var coverage=global[gcv]||(global[gcv]={});if(!coverage[path]||coverage[path].hash!==hash){coverage[path]=coverageData;}var actualCoverage=coverage[path];{// @ts-ignore
cov_1gkcta8evx=function(){return actualCoverage;};}return actualCoverage;}cov_1gkcta8evx();/**
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
 *
 * A path segment of `*` (e.g. `#/tags/*`) means "any element of the array
 * at this point" - `arraySearchType.js`/`setSearchType.js`/`filelistSearchType.js`
 * (element/value length/count constraint aside) and `tupleSearchType.js`'s
 * `rest` portion use it when recursing into their element/value schema's
 * own search widget, so a single nested leaf expresses "the collection
 * contains at least one element matching this" (Mongo's `$elemMatch` is the
 * natural translation target for a host walking a path that contains this
 * segment) without needing a dedicated wrapper leaf kind - the collection's
 * own `lengthSize` leaf and the recursed element leaf simply combine via
 * `$and`. `recordSearchType.js`/`mapSearchType.js` similarly recurse into
 * their `key`/`value` schemas at `*key`/`*value` segments, feeding the
 * results into a single `mapRecordJoint` leaf (below) rather than combining
 * via `$and`, since a host needs to know whether the two must match the
 * same entry. `functionSearchType.js` recurses into its `input`/`output`
 * schemas at `*args`/`*output` segments (the former itself a tuple, so its
 * own per-position segments nest under `*args`), combined via `$and`.
 * `promiseSearchType.js`/`catchSearchType.js` recurse into their wrapped
 * value/`innerType` at the same path (there being exactly one value, no
 * segment to add) and wrap the result in a `passThrough` leaf (below)
 * rather than returning it bare, so the tree keeps visible that the leaf
 * was reached through one of these transparent wrappers.
 *//**
 * @typedef {{$and: QueryNode[]}} QueryAnd
 *//**
 * @typedef {{$or: QueryNode[]}} QueryOr
 *//**
 * `object` (via `$exists: true/false`).
 * @typedef {{kind: 'hasProperty', path: string, $exists: boolean}} QueryHasPropertyLeaf
 *//**
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
 *//**
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
 *//**
 * @typedef {{kind: 'not', query: QueryNode}} QueryNotLeaf
 *//**
 * `number`/`NumberObject`: is/is-not an integer.
 * @typedef {{kind: 'integerCheck', path: string, isInteger: boolean}} QueryIntegerCheckLeaf
 *//**
 * `string`/`StringObject`/`Blob`/`File`/regexp-source/symbol-description
 * (via `$in`/`$nin`).
 * @typedef {{
 *   kind: 'literalSet',
 *   path: string,
 *   $in?: unknown[],
 *   $nin?: unknown[]
 * }} QueryLiteralSetLeaf
 *//**
 * `string`/`StringObject`/`Blob`/`File`/regexp-source/symbol-description
 * (via `$regex`/`$options`, matching Mongo's own field names).
 * @typedef {{
 *   kind: 'regex',
 *   path: string,
 *   $regex: string,
 *   $options?: string
 * }} QueryRegexLeaf
 *//**
 * `string`/`StringObject`/`Blob`/`File`/regexp-source/symbol-description:
 * a substring the value must not contain.
 * @typedef {{
 *   kind: 'notContains',
 *   path: string,
 *   value: string
 * }} QueryNotContainsLeaf
 *//**
 * `enum`, SpecialNumber's `Infinity`/`-Infinity`/`NaN`/`-0` (via
 * `$in`/`$nin`).
 * @typedef {{
 *   kind: 'multiSelect',
 *   path: string,
 *   $in?: unknown[],
 *   $nin?: unknown[]
 * }} QueryMultiSelectLeaf
 *//**
 * Native enum key-vs-value; no Mongo equivalent, stays custom.
 * @typedef {{
 *   kind: 'keyValueEnum',
 *   path: string,
 *   matchKeys: boolean,
 *   values: unknown[]
 * }} QueryKeyValueEnumLeaf
 *//**
 * Union/xor/discriminatedUnion "has type", carrying `discriminatorValue`
 * when applicable, including when nested under a Map/Record key or value;
 * no Mongo equivalent, stays custom.
 * @typedef {{
 *   kind: 'typeOf',
 *   path: string,
 *   searchType: string,
 *   discriminatorValue?: unknown
 * }} QueryTypeOfLeaf
 *//**
 * XPath/CSS-selector/full-text/raw-HTML-regex; no Mongo equivalent.
 * @typedef {{
 *   kind: 'blobHTML',
 *   path: string,
 *   mode: 'xpath'|'cssSelector'|'fullText'|'rawHTMLRegex',
 *   value: string
 * }} QueryBlobHTMLLeaf
 *//**
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
 *//**
 * Paired key+value leaves with a joint-match flag; no Mongo equivalent.
 * @typedef {{
 *   kind: 'mapRecordJoint',
 *   path: string,
 *   keyQuery?: QueryNode,
 *   valueQuery?: QueryNode,
 *   joint: boolean
 * }} QueryMapRecordJointLeaf
 *//**
 * Promise/literal/catch/function: forwards to a nested `QueryNode` for the
 * child schema so the tree stays uniform even where a type adds no
 * constraint of its own; purely structural, no Mongo equivalent.
 * @typedef {{
 *   kind: 'passThrough',
 *   path: string,
 *   query?: QueryNode
 * }} QueryPassThroughLeaf
 *//**
 * Undefined/void/null (via `$exists`).
 * @typedef {{kind: 'presence', path: string, $exists: boolean}} QueryPresenceLeaf
 *//**
 * Boolean/BooleanObject - Mongo would normally express this as a bare
 * `{field: true}` shorthand, which doesn't fit our path-carrying leaf
 * shape, so this stays a custom kind.
 * @typedef {{
 *   kind: 'booleanEquals',
 *   path: string,
 *   value: boolean
 * }} QueryBooleanEqualsLeaf
 *//**
 * @typedef {QueryHasPropertyLeaf|QueryLengthSizeLeaf|QueryRangeLeaf|
 *   QueryNotLeaf|QueryIntegerCheckLeaf|QueryLiteralSetLeaf|QueryRegexLeaf|
 *   QueryNotContainsLeaf|QueryMultiSelectLeaf|QueryKeyValueEnumLeaf|
 *   QueryTypeOfLeaf|QueryBlobHTMLLeaf|QueryDomShapeLeaf|
 *   QueryMapRecordJointLeaf|QueryPassThroughLeaf|QueryPresenceLeaf|
 *   QueryBooleanEqualsLeaf
 * } QueryLeaf
 *//**
 * @typedef {QueryAnd|QueryOr|QueryLeaf} QueryNode
 */export{};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3ZfMWdrY3RhOGV2eCIsImFjdHVhbENvdmVyYWdlIl0sInNvdXJjZXMiOlsicXVlcnlUcmVlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogSlNEb2Mtb25seSB0eXBlZGVmcyBmb3IgdGhlIHNjaGVtYS1kcml2ZW4gc2VhcmNoIHF1ZXJ5IHRyZWUuIE5vIHJ1bnRpbWVcbiAqIGV4cG9ydHMgbGl2ZSBoZXJlOyBjb25zdHJ1Y3Qgbm9kZXMgdGhyb3VnaCBgcXVlcnlUcmVlQnVpbGRlcnMuanNgIGluc3RlYWRcbiAqIHNvIGV2ZXJ5IHNlYXJjaCBtb2R1bGUgKGFuZCBldmVyeSB0ZXN0IGZpeHR1cmUpIGdvZXMgdGhyb3VnaCBvbmUgcGxhY2UuXG4gKlxuICogTGVhZiBgcGF0aGAgdmFsdWVzIHJldXNlIHRoZSBleGlzdGluZyBKU09OLVBvaW50ZXIgY29udmVudGlvbiBmcm9tXG4gKiBgc3JjL3V0aWxzL2pzb25Qb2ludGVyLmpzYCAoYG1ha2VKU09OUG9pbnRlcmAvYGdldEpTT05Qb2ludGVyUGFydHNgKVxuICogcmF0aGVyIHRoYW4gTW9uZ28ncyBkb3Qtbm90YXRpb24sIHNvIHRoZSBzZWFyY2ggdHJlZSBzaGFyZXMgYSBwYXRoIGZvcm1hdFxuICogd2l0aCB0aGUgcmVzdCBvZiBqc29lIChlLmcuIGBhcnJheVR5cGUuanNgJ3MgYGN1cnJlbnRQYXRoYCkuXG4gKlxuICogVGhlIGxlYWYgdm9jYWJ1bGFyeSBib3Jyb3dzIE1vbmdvREIncyBvd24gb3BlcmF0b3IgbmFtZXMgKGAkYW5kYC9gJG9yYCxcbiAqIGAkZ3RgL2AkZ3RlYC9gJGx0YC9gJGx0ZWAsIGAkaW5gL2AkbmluYCwgYCRyZWdleGAvYCRvcHRpb25zYCwgYCRleGlzdHNgKVxuICogd2hlcmV2ZXIgYSBsZWFmIGtpbmQgaGFzIGEgY2xlYW4gTW9uZ28gZXF1aXZhbGVudCwgc28gYSBob3N0IGNhbiBhZGFwdCB0aGVcbiAqIGNvbW1vbiBjYXNlcyB0byBgc2lmdCgpYCAob3IgcmVhbCBNb25nb0RCKSBhbG1vc3QgZm9yIGZyZWUgLSB0aGlzIGlzIG5vdCBhXG4gKiBjbGFpbSBvZiBmdWxsIGRyb3AtaW4gTW9uZ28gcXVlcnktZG9jdW1lbnQgY29tcGF0aWJpbGl0eTogc2V2ZXJhbFxuICoganNvZS1zcGVjaWZpYyBsZWFmIGtpbmRzIGhhdmUgbm8gTW9uZ28gZXF1aXZhbGVudCBhbmQgc3RheSBjdXN0b20sIGFuZFxuICogZXZlcnkgbGVhZiBrZWVwcyBqc29lJ3Mgb3duIGBraW5kYC1kaXNjcmltaW5hdGVkLCBwYXRoLWNhcnJ5aW5nIHNoYXBlXG4gKiByYXRoZXIgdGhhbiBNb25nbydzIGZpZWxkLWtleWVkIGRvY3VtZW50IHNoYXBlLlxuICpcbiAqIEEgcGF0aCBzZWdtZW50IG9mIGAqYCAoZS5nLiBgIy90YWdzLypgKSBtZWFucyBcImFueSBlbGVtZW50IG9mIHRoZSBhcnJheVxuICogYXQgdGhpcyBwb2ludFwiIC0gYGFycmF5U2VhcmNoVHlwZS5qc2AvYHNldFNlYXJjaFR5cGUuanNgL2BmaWxlbGlzdFNlYXJjaFR5cGUuanNgXG4gKiAoZWxlbWVudC92YWx1ZSBsZW5ndGgvY291bnQgY29uc3RyYWludCBhc2lkZSkgYW5kIGB0dXBsZVNlYXJjaFR5cGUuanNgJ3NcbiAqIGByZXN0YCBwb3J0aW9uIHVzZSBpdCB3aGVuIHJlY3Vyc2luZyBpbnRvIHRoZWlyIGVsZW1lbnQvdmFsdWUgc2NoZW1hJ3NcbiAqIG93biBzZWFyY2ggd2lkZ2V0LCBzbyBhIHNpbmdsZSBuZXN0ZWQgbGVhZiBleHByZXNzZXMgXCJ0aGUgY29sbGVjdGlvblxuICogY29udGFpbnMgYXQgbGVhc3Qgb25lIGVsZW1lbnQgbWF0Y2hpbmcgdGhpc1wiIChNb25nbydzIGAkZWxlbU1hdGNoYCBpcyB0aGVcbiAqIG5hdHVyYWwgdHJhbnNsYXRpb24gdGFyZ2V0IGZvciBhIGhvc3Qgd2Fsa2luZyBhIHBhdGggdGhhdCBjb250YWlucyB0aGlzXG4gKiBzZWdtZW50KSB3aXRob3V0IG5lZWRpbmcgYSBkZWRpY2F0ZWQgd3JhcHBlciBsZWFmIGtpbmQgLSB0aGUgY29sbGVjdGlvbidzXG4gKiBvd24gYGxlbmd0aFNpemVgIGxlYWYgYW5kIHRoZSByZWN1cnNlZCBlbGVtZW50IGxlYWYgc2ltcGx5IGNvbWJpbmUgdmlhXG4gKiBgJGFuZGAuIGByZWNvcmRTZWFyY2hUeXBlLmpzYC9gbWFwU2VhcmNoVHlwZS5qc2Agc2ltaWxhcmx5IHJlY3Vyc2UgaW50b1xuICogdGhlaXIgYGtleWAvYHZhbHVlYCBzY2hlbWFzIGF0IGAqa2V5YC9gKnZhbHVlYCBzZWdtZW50cywgZmVlZGluZyB0aGVcbiAqIHJlc3VsdHMgaW50byBhIHNpbmdsZSBgbWFwUmVjb3JkSm9pbnRgIGxlYWYgKGJlbG93KSByYXRoZXIgdGhhbiBjb21iaW5pbmdcbiAqIHZpYSBgJGFuZGAsIHNpbmNlIGEgaG9zdCBuZWVkcyB0byBrbm93IHdoZXRoZXIgdGhlIHR3byBtdXN0IG1hdGNoIHRoZVxuICogc2FtZSBlbnRyeS4gYGZ1bmN0aW9uU2VhcmNoVHlwZS5qc2AgcmVjdXJzZXMgaW50byBpdHMgYGlucHV0YC9gb3V0cHV0YFxuICogc2NoZW1hcyBhdCBgKmFyZ3NgL2Aqb3V0cHV0YCBzZWdtZW50cyAodGhlIGZvcm1lciBpdHNlbGYgYSB0dXBsZSwgc28gaXRzXG4gKiBvd24gcGVyLXBvc2l0aW9uIHNlZ21lbnRzIG5lc3QgdW5kZXIgYCphcmdzYCksIGNvbWJpbmVkIHZpYSBgJGFuZGAuXG4gKiBgcHJvbWlzZVNlYXJjaFR5cGUuanNgL2BjYXRjaFNlYXJjaFR5cGUuanNgIHJlY3Vyc2UgaW50byB0aGVpciB3cmFwcGVkXG4gKiB2YWx1ZS9gaW5uZXJUeXBlYCBhdCB0aGUgc2FtZSBwYXRoICh0aGVyZSBiZWluZyBleGFjdGx5IG9uZSB2YWx1ZSwgbm9cbiAqIHNlZ21lbnQgdG8gYWRkKSBhbmQgd3JhcCB0aGUgcmVzdWx0IGluIGEgYHBhc3NUaHJvdWdoYCBsZWFmIChiZWxvdylcbiAqIHJhdGhlciB0aGFuIHJldHVybmluZyBpdCBiYXJlLCBzbyB0aGUgdHJlZSBrZWVwcyB2aXNpYmxlIHRoYXQgdGhlIGxlYWZcbiAqIHdhcyByZWFjaGVkIHRocm91Z2ggb25lIG9mIHRoZXNlIHRyYW5zcGFyZW50IHdyYXBwZXJzLlxuICovXG5cbi8qKlxuICogQHR5cGVkZWYge3skYW5kOiBRdWVyeU5vZGVbXX19IFF1ZXJ5QW5kXG4gKi9cblxuLyoqXG4gKiBAdHlwZWRlZiB7eyRvcjogUXVlcnlOb2RlW119fSBRdWVyeU9yXG4gKi9cblxuLyoqXG4gKiBgb2JqZWN0YCAodmlhIGAkZXhpc3RzOiB0cnVlL2ZhbHNlYCkuXG4gKiBAdHlwZWRlZiB7e2tpbmQ6ICdoYXNQcm9wZXJ0eScsIHBhdGg6IHN0cmluZywgJGV4aXN0czogYm9vbGVhbn19IFF1ZXJ5SGFzUHJvcGVydHlMZWFmXG4gKi9cblxuLyoqXG4gKiBgYXJyYXlgL2BzZXRgL3R1cGxlLXdpdGgtcmVzdC9gZmlsZWxpc3RgICh2aWEgYCRzaXplYCwgb3IgYSByYW5nZSBvZlxuICogb3BlcmF0b3JzIHdoZW4gdGhlIHNjaGVtYSBkb2Vzbid0IHBpbiBhbiBleGFjdCBsZW5ndGgpLCArYHNwYXJzZUNoZWNrYFxuICogZm9yIGFycmF5IHNwYXJzZS9ub3Qtc3BhcnNlLlxuICogQHR5cGVkZWYge3tcbiAqICAga2luZDogJ2xlbmd0aFNpemUnLFxuICogICBwYXRoOiBzdHJpbmcsXG4gKiAgICRzaXplPzogbnVtYmVyLFxuICogICAkZ3Q/OiBudW1iZXIsICRndGU/OiBudW1iZXIsICRsdD86IG51bWJlciwgJGx0ZT86IG51bWJlcixcbiAqICAgc3BhcnNlQ2hlY2s/OiBib29sZWFuXG4gKiB9fSBRdWVyeUxlbmd0aFNpemVMZWFmXG4gKi9cblxuLyoqXG4gKiBgbnVtYmVyYC9gTnVtYmVyT2JqZWN0YC9gYmlnaW50YC9gZGF0ZWAvYGJ1ZmZlcnNvdXJjZWAsIHdpdGggYHZhbHVlVHlwZWBcbiAqIGRpc3Rpbmd1aXNoaW5nIHRoZW0uIEJvdW5kcyBhcmUgTW9uZ28tc3R5bGUgYCRndGAvYCRndGVgL2AkbHRgL2AkbHRlYFxuICogcmF0aGVyIHRoYW4gYSBgbWluYC9gbWF4YCBwYWlyIHBsdXMgYW4gaW5jbHVzaXZlIGJvb2xlYW4gLSBpbmNsdXNpdml0eSBpc1xuICogc2ltcGx5IHdoaWNoIG9wZXJhdG9yIGlzIHByZXNlbnQuIFRoZSBSRUFETUUncyBcIklzIE5vdCBSYW5nZVwiIHZhcmlhbnRcbiAqIHdyYXBzIHRoZSBzYW1lIGxlYWYgaW4gYCRub3RgIHJhdGhlciB0aGFuIGJlaW5nIGEgc2VwYXJhdGUga2luZC5cbiAqIEB0eXBlZGVmIHt7XG4gKiAgIGtpbmQ6ICdyYW5nZScsXG4gKiAgIHBhdGg6IHN0cmluZyxcbiAqICAgdmFsdWVUeXBlOiAnbnVtYmVyJ3wnTnVtYmVyT2JqZWN0J3wnYmlnaW50J3wnZGF0ZSd8J2J1ZmZlcnNvdXJjZScsXG4gKiAgICRndD86IG51bWJlcnxiaWdpbnR8c3RyaW5nLFxuICogICAkZ3RlPzogbnVtYmVyfGJpZ2ludHxzdHJpbmcsXG4gKiAgICRsdD86IG51bWJlcnxiaWdpbnR8c3RyaW5nLFxuICogICAkbHRlPzogbnVtYmVyfGJpZ2ludHxzdHJpbmdcbiAqIH19IFF1ZXJ5UmFuZ2VMZWFmXG4gKi9cblxuLyoqXG4gKiBAdHlwZWRlZiB7e2tpbmQ6ICdub3QnLCBxdWVyeTogUXVlcnlOb2RlfX0gUXVlcnlOb3RMZWFmXG4gKi9cblxuLyoqXG4gKiBgbnVtYmVyYC9gTnVtYmVyT2JqZWN0YDogaXMvaXMtbm90IGFuIGludGVnZXIuXG4gKiBAdHlwZWRlZiB7e2tpbmQ6ICdpbnRlZ2VyQ2hlY2snLCBwYXRoOiBzdHJpbmcsIGlzSW50ZWdlcjogYm9vbGVhbn19IFF1ZXJ5SW50ZWdlckNoZWNrTGVhZlxuICovXG5cbi8qKlxuICogYHN0cmluZ2AvYFN0cmluZ09iamVjdGAvYEJsb2JgL2BGaWxlYC9yZWdleHAtc291cmNlL3N5bWJvbC1kZXNjcmlwdGlvblxuICogKHZpYSBgJGluYC9gJG5pbmApLlxuICogQHR5cGVkZWYge3tcbiAqICAga2luZDogJ2xpdGVyYWxTZXQnLFxuICogICBwYXRoOiBzdHJpbmcsXG4gKiAgICRpbj86IHVua25vd25bXSxcbiAqICAgJG5pbj86IHVua25vd25bXVxuICogfX0gUXVlcnlMaXRlcmFsU2V0TGVhZlxuICovXG5cbi8qKlxuICogYHN0cmluZ2AvYFN0cmluZ09iamVjdGAvYEJsb2JgL2BGaWxlYC9yZWdleHAtc291cmNlL3N5bWJvbC1kZXNjcmlwdGlvblxuICogKHZpYSBgJHJlZ2V4YC9gJG9wdGlvbnNgLCBtYXRjaGluZyBNb25nbydzIG93biBmaWVsZCBuYW1lcykuXG4gKiBAdHlwZWRlZiB7e1xuICogICBraW5kOiAncmVnZXgnLFxuICogICBwYXRoOiBzdHJpbmcsXG4gKiAgICRyZWdleDogc3RyaW5nLFxuICogICAkb3B0aW9ucz86IHN0cmluZ1xuICogfX0gUXVlcnlSZWdleExlYWZcbiAqL1xuXG4vKipcbiAqIGBzdHJpbmdgL2BTdHJpbmdPYmplY3RgL2BCbG9iYC9gRmlsZWAvcmVnZXhwLXNvdXJjZS9zeW1ib2wtZGVzY3JpcHRpb246XG4gKiBhIHN1YnN0cmluZyB0aGUgdmFsdWUgbXVzdCBub3QgY29udGFpbi5cbiAqIEB0eXBlZGVmIHt7XG4gKiAgIGtpbmQ6ICdub3RDb250YWlucycsXG4gKiAgIHBhdGg6IHN0cmluZyxcbiAqICAgdmFsdWU6IHN0cmluZ1xuICogfX0gUXVlcnlOb3RDb250YWluc0xlYWZcbiAqL1xuXG4vKipcbiAqIGBlbnVtYCwgU3BlY2lhbE51bWJlcidzIGBJbmZpbml0eWAvYC1JbmZpbml0eWAvYE5hTmAvYC0wYCAodmlhXG4gKiBgJGluYC9gJG5pbmApLlxuICogQHR5cGVkZWYge3tcbiAqICAga2luZDogJ211bHRpU2VsZWN0JyxcbiAqICAgcGF0aDogc3RyaW5nLFxuICogICAkaW4/OiB1bmtub3duW10sXG4gKiAgICRuaW4/OiB1bmtub3duW11cbiAqIH19IFF1ZXJ5TXVsdGlTZWxlY3RMZWFmXG4gKi9cblxuLyoqXG4gKiBOYXRpdmUgZW51bSBrZXktdnMtdmFsdWU7IG5vIE1vbmdvIGVxdWl2YWxlbnQsIHN0YXlzIGN1c3RvbS5cbiAqIEB0eXBlZGVmIHt7XG4gKiAgIGtpbmQ6ICdrZXlWYWx1ZUVudW0nLFxuICogICBwYXRoOiBzdHJpbmcsXG4gKiAgIG1hdGNoS2V5czogYm9vbGVhbixcbiAqICAgdmFsdWVzOiB1bmtub3duW11cbiAqIH19IFF1ZXJ5S2V5VmFsdWVFbnVtTGVhZlxuICovXG5cbi8qKlxuICogVW5pb24veG9yL2Rpc2NyaW1pbmF0ZWRVbmlvbiBcImhhcyB0eXBlXCIsIGNhcnJ5aW5nIGBkaXNjcmltaW5hdG9yVmFsdWVgXG4gKiB3aGVuIGFwcGxpY2FibGUsIGluY2x1ZGluZyB3aGVuIG5lc3RlZCB1bmRlciBhIE1hcC9SZWNvcmQga2V5IG9yIHZhbHVlO1xuICogbm8gTW9uZ28gZXF1aXZhbGVudCwgc3RheXMgY3VzdG9tLlxuICogQHR5cGVkZWYge3tcbiAqICAga2luZDogJ3R5cGVPZicsXG4gKiAgIHBhdGg6IHN0cmluZyxcbiAqICAgc2VhcmNoVHlwZTogc3RyaW5nLFxuICogICBkaXNjcmltaW5hdG9yVmFsdWU/OiB1bmtub3duXG4gKiB9fSBRdWVyeVR5cGVPZkxlYWZcbiAqL1xuXG4vKipcbiAqIFhQYXRoL0NTUy1zZWxlY3Rvci9mdWxsLXRleHQvcmF3LUhUTUwtcmVnZXg7IG5vIE1vbmdvIGVxdWl2YWxlbnQuXG4gKiBAdHlwZWRlZiB7e1xuICogICBraW5kOiAnYmxvYkhUTUwnLFxuICogICBwYXRoOiBzdHJpbmcsXG4gKiAgIG1vZGU6ICd4cGF0aCd8J2Nzc1NlbGVjdG9yJ3wnZnVsbFRleHQnfCdyYXdIVE1MUmVnZXgnLFxuICogICB2YWx1ZTogc3RyaW5nXG4gKiB9fSBRdWVyeUJsb2JIVE1MTGVhZlxuICovXG5cbi8qKlxuICogUGVyLWRpbWVuc2lvbiByYW5nZXMgZm9yIERPTVJlY3QvUG9pbnQvTWF0cml4LCBlYWNoIGRpbWVuc2lvbiBpdHNlbGYgYVxuICogYHJhbmdlYCBsZWFmLCArIGByZWFkb25seUNoZWNrYC9gZGltZW5zaW9uQ2hlY2tgIChpcy9pcy1ub3QgcmVhZG9ubHksXG4gKiBpcy9pcy1ub3QgM2QpOyBubyBNb25nbyBlcXVpdmFsZW50LlxuICogQHR5cGVkZWYge3tcbiAqICAga2luZDogJ2RvbVNoYXBlJyxcbiAqICAgcGF0aDogc3RyaW5nLFxuICogICBkaW1lbnNpb25zOiB7W2RpbWVuc2lvbjogc3RyaW5nXTogUXVlcnlSYW5nZUxlYWZ9LFxuICogICByZWFkb25seUNoZWNrPzogYm9vbGVhbixcbiAqICAgZGltZW5zaW9uQ2hlY2s/OiAyfDNcbiAqIH19IFF1ZXJ5RG9tU2hhcGVMZWFmXG4gKi9cblxuLyoqXG4gKiBQYWlyZWQga2V5K3ZhbHVlIGxlYXZlcyB3aXRoIGEgam9pbnQtbWF0Y2ggZmxhZzsgbm8gTW9uZ28gZXF1aXZhbGVudC5cbiAqIEB0eXBlZGVmIHt7XG4gKiAgIGtpbmQ6ICdtYXBSZWNvcmRKb2ludCcsXG4gKiAgIHBhdGg6IHN0cmluZyxcbiAqICAga2V5UXVlcnk/OiBRdWVyeU5vZGUsXG4gKiAgIHZhbHVlUXVlcnk/OiBRdWVyeU5vZGUsXG4gKiAgIGpvaW50OiBib29sZWFuXG4gKiB9fSBRdWVyeU1hcFJlY29yZEpvaW50TGVhZlxuICovXG5cbi8qKlxuICogUHJvbWlzZS9saXRlcmFsL2NhdGNoL2Z1bmN0aW9uOiBmb3J3YXJkcyB0byBhIG5lc3RlZCBgUXVlcnlOb2RlYCBmb3IgdGhlXG4gKiBjaGlsZCBzY2hlbWEgc28gdGhlIHRyZWUgc3RheXMgdW5pZm9ybSBldmVuIHdoZXJlIGEgdHlwZSBhZGRzIG5vXG4gKiBjb25zdHJhaW50IG9mIGl0cyBvd247IHB1cmVseSBzdHJ1Y3R1cmFsLCBubyBNb25nbyBlcXVpdmFsZW50LlxuICogQHR5cGVkZWYge3tcbiAqICAga2luZDogJ3Bhc3NUaHJvdWdoJyxcbiAqICAgcGF0aDogc3RyaW5nLFxuICogICBxdWVyeT86IFF1ZXJ5Tm9kZVxuICogfX0gUXVlcnlQYXNzVGhyb3VnaExlYWZcbiAqL1xuXG4vKipcbiAqIFVuZGVmaW5lZC92b2lkL251bGwgKHZpYSBgJGV4aXN0c2ApLlxuICogQHR5cGVkZWYge3traW5kOiAncHJlc2VuY2UnLCBwYXRoOiBzdHJpbmcsICRleGlzdHM6IGJvb2xlYW59fSBRdWVyeVByZXNlbmNlTGVhZlxuICovXG5cbi8qKlxuICogQm9vbGVhbi9Cb29sZWFuT2JqZWN0IC0gTW9uZ28gd291bGQgbm9ybWFsbHkgZXhwcmVzcyB0aGlzIGFzIGEgYmFyZVxuICogYHtmaWVsZDogdHJ1ZX1gIHNob3J0aGFuZCwgd2hpY2ggZG9lc24ndCBmaXQgb3VyIHBhdGgtY2FycnlpbmcgbGVhZlxuICogc2hhcGUsIHNvIHRoaXMgc3RheXMgYSBjdXN0b20ga2luZC5cbiAqIEB0eXBlZGVmIHt7XG4gKiAgIGtpbmQ6ICdib29sZWFuRXF1YWxzJyxcbiAqICAgcGF0aDogc3RyaW5nLFxuICogICB2YWx1ZTogYm9vbGVhblxuICogfX0gUXVlcnlCb29sZWFuRXF1YWxzTGVhZlxuICovXG5cbi8qKlxuICogQHR5cGVkZWYge1F1ZXJ5SGFzUHJvcGVydHlMZWFmfFF1ZXJ5TGVuZ3RoU2l6ZUxlYWZ8UXVlcnlSYW5nZUxlYWZ8XG4gKiAgIFF1ZXJ5Tm90TGVhZnxRdWVyeUludGVnZXJDaGVja0xlYWZ8UXVlcnlMaXRlcmFsU2V0TGVhZnxRdWVyeVJlZ2V4TGVhZnxcbiAqICAgUXVlcnlOb3RDb250YWluc0xlYWZ8UXVlcnlNdWx0aVNlbGVjdExlYWZ8UXVlcnlLZXlWYWx1ZUVudW1MZWFmfFxuICogICBRdWVyeVR5cGVPZkxlYWZ8UXVlcnlCbG9iSFRNTExlYWZ8UXVlcnlEb21TaGFwZUxlYWZ8XG4gKiAgIFF1ZXJ5TWFwUmVjb3JkSm9pbnRMZWFmfFF1ZXJ5UGFzc1Rocm91Z2hMZWFmfFF1ZXJ5UHJlc2VuY2VMZWFmfFxuICogICBRdWVyeUJvb2xlYW5FcXVhbHNMZWFmXG4gKiB9IFF1ZXJ5TGVhZlxuICovXG5cbi8qKlxuICogQHR5cGVkZWYge1F1ZXJ5QW5kfFF1ZXJ5T3J8UXVlcnlMZWFmfSBRdWVyeU5vZGVcbiAqL1xuXG5leHBvcnQge307XG4iXSwibWFwcGluZ3MiOiJra0JBZVk7QUFBQUEsY0FBQSxTQUFBQSxDQUFBLFNBQUFDLGNBQUEsV0FBQUEsY0FBQSxFQUFBRCxjQUFBLEdBZlo7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUVBO0FBQ0E7QUFDQSxHQUVBO0FBQ0E7QUFDQSxHQUVBO0FBQ0E7QUFDQTtBQUNBLEdBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FFQTtBQUNBO0FBQ0EsR0FFQTtBQUNBO0FBQ0E7QUFDQSxHQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBRUE7QUFDQTtBQUNBO0FBQ0EsR0FFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUVBO0FBQ0E7QUFDQSxHQUVBIiwiaWdub3JlTGlzdCI6W119