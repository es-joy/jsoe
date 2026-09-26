/**
 * The only runtime pieces for building `queryTree.js` nodes - every search
 * module builds nodes through these factories rather than hand-rolling leaf
 * objects, so tests can import the same constructors to build expected-value
 * fixtures.
 */

/**
 * @param {import('./queryTree.js').QueryNode[]} nodes
 * @returns {import('./queryTree.js').QueryAnd}
 */
export function makeAndNode (nodes) {
  return {$and: nodes};
}

/**
 * Combines the leaves a single widget contributes (e.g. a number leaf's
 * range plus its separate "Is/Is Not Integer" check) into one `QueryNode`:
 * drops any `undefined` (no constraint entered there), returns `undefined`
 * if nothing is left, the bare node if only one is left, else an `$and` of
 * the rest - so a widget with several independent controls still honors
 * `getQuery`'s "`undefined` means no constraint" convention without every
 * such widget re-implementing this collapsing logic itself.
 * @param {(import('./queryTree.js').QueryNode|undefined)[]} nodes
 * @returns {import('./queryTree.js').QueryNode|undefined}
 */
export function combineAnd (nodes) {
  const filtered = /** @type {import('./queryTree.js').QueryNode[]} */ (
    nodes.filter((node) => node !== undefined)
  );
  if (filtered.length === 0) {
    return undefined;
  }
  return filtered.length === 1 ? filtered[0] : makeAndNode(filtered);
}

/**
 * @param {import('./queryTree.js').QueryNode[]} nodes
 * @returns {import('./queryTree.js').QueryOr}
 */
export function makeOrNode (nodes) {
  return {$or: nodes};
}

/**
 * @param {string} path
 * @param {boolean} $exists
 * @returns {import('./queryTree.js').QueryHasPropertyLeaf}
 */
export function makeHasPropertyLeaf (path, $exists) {
  return {kind: 'hasProperty', path, $exists};
}

/**
 * @param {string} path
 * @param {{
 *   $size?: number,
 *   $gt?: number, $gte?: number, $lt?: number, $lte?: number,
 *   sparseCheck?: boolean
 * }} cfg
 * @returns {import('./queryTree.js').QueryLengthSizeLeaf}
 */
export function makeLengthSizeLeaf (
  path,
  /* istanbul ignore next -- Guard: every current caller passes `cfg` explicitly. */
  cfg = {}
) {
  return {kind: 'lengthSize', path, ...cfg};
}

/**
 * @param {string} path
 * @param {import('./queryTree.js').QueryRangeLeaf['valueType']} valueType
 * @param {{
 *   $gt?: number|bigint|string, $gte?: number|bigint|string,
 *   $lt?: number|bigint|string, $lte?: number|bigint|string
 * }} cfg
 * @returns {import('./queryTree.js').QueryRangeLeaf}
 */
export function makeRangeLeaf (
  path,
  valueType,
  /* istanbul ignore next -- Guard: every current caller passes `cfg` explicitly. */
  cfg = {}
) {
  return {kind: 'range', path, valueType, ...cfg};
}

/**
 * @param {import('./queryTree.js').QueryNode} query
 * @returns {import('./queryTree.js').QueryNotLeaf}
 */
export function makeNotLeaf (query) {
  return {kind: 'not', query};
}

/**
 * @param {string} path
 * @param {boolean} isInteger
 * @returns {import('./queryTree.js').QueryIntegerCheckLeaf}
 */
export function makeIntegerCheckLeaf (path, isInteger) {
  return {kind: 'integerCheck', path, isInteger};
}

/**
 * @param {string} path
 * @param {boolean} isValid
 * @returns {import('./queryTree.js').QueryValidDateCheckLeaf}
 */
export function makeValidDateCheckLeaf (path, isValid) {
  return {kind: 'validDateCheck', path, isValid};
}

/**
 * @param {string} path
 * @param {{$in?: unknown[], $nin?: unknown[]}} cfg
 * @returns {import('./queryTree.js').QueryLiteralSetLeaf}
 */
export function makeLiteralSetLeaf (
  path,
  /* istanbul ignore next -- Guard: every current caller passes `cfg` explicitly. */
  cfg = {}
) {
  return {kind: 'literalSet', path, ...cfg};
}

/**
 * @param {string} path
 * @param {string} $regex
 * @param {string} [$options]
 * @returns {import('./queryTree.js').QueryRegexLeaf}
 */
export function makeRegexLeaf (path, $regex, $options) {
  return {kind: 'regex', path, $regex, ...($options ? {$options} : {})};
}

/**
 * @param {string} path
 * @param {string} value
 * @returns {import('./queryTree.js').QueryNotContainsLeaf}
 */
export function makeNotContainsLeaf (path, value) {
  return {kind: 'notContains', path, value};
}

/**
 * @param {string} path
 * @param {{$in?: unknown[], $nin?: unknown[]}} cfg
 * @returns {import('./queryTree.js').QueryMultiSelectLeaf}
 */
export function makeMultiSelectLeaf (
  path,
  /* istanbul ignore next -- Guard: every current caller passes `cfg` explicitly. */
  cfg = {}
) {
  return {kind: 'multiSelect', path, ...cfg};
}

/**
 * @param {string} path
 * @param {boolean} matchKeys
 * @param {unknown[]} values
 * @returns {import('./queryTree.js').QueryKeyValueEnumLeaf}
 */
export function makeKeyValueEnumLeaf (path, matchKeys, values) {
  return {kind: 'keyValueEnum', path, matchKeys, values};
}

/**
 * @param {string} path
 * @param {string} searchType
 * @param {unknown} [discriminatorValue]
 * @returns {import('./queryTree.js').QueryTypeOfLeaf}
 */
export function makeTypeOfLeaf (path, searchType, discriminatorValue) {
  return {
    kind: 'typeOf',
    path,
    searchType,
    ...(discriminatorValue === undefined ? {} : {discriminatorValue})
  };
}

/**
 * @param {string} path
 * @param {import('./queryTree.js').QueryBlobHTMLLeaf['mode']} mode
 * @param {string} value
 * @param {string} [$options]
 * @returns {import('./queryTree.js').QueryBlobHTMLLeaf}
 */
export function makeBlobHTMLLeaf (path, mode, value, $options) {
  return {kind: 'blobHTML', path, mode, value, ...($options ? {$options} : {})};
}

/**
 * @param {string} path
 * @param {{[dimension: string]: import('./queryTree.js').QueryRangeLeaf}} dimensions
 * @param {{readonlyCheck?: boolean, dimensionCheck?: 2|3}} [cfg]
 * @returns {import('./queryTree.js').QueryDomShapeLeaf}
 */
export function makeDomShapeLeaf (
  path,
  dimensions,
  /* istanbul ignore next -- Guard: the one current caller always passes `cfg` explicitly */
  cfg = {}
) {
  return {kind: 'domShape', path, dimensions, ...cfg};
}

/**
 * @param {string} path
 * @param {boolean} joint
 * @param {import('./queryTree.js').QueryNode} [keyQuery]
 * @param {import('./queryTree.js').QueryNode} [valueQuery]
 * @returns {import('./queryTree.js').QueryMapRecordJointLeaf}
 */
export function makeMapRecordJointLeaf (path, joint, keyQuery, valueQuery) {
  return {
    kind: 'mapRecordJoint',
    path,
    joint,
    ...(keyQuery ? {keyQuery} : {}),
    ...(valueQuery ? {valueQuery} : {})
  };
}

/**
 * @param {string} path
 * @param {import('./queryTree.js').QueryNode} [query]
 * @returns {import('./queryTree.js').QueryPassThroughLeaf}
 */
export function makePassThroughLeaf (path, query) {
  return {
    kind: 'passThrough',
    path,
    ...(query
      ? {query}
      /* istanbul ignore next -- Guard: both callers (promise/catch) only call this once their own child query is truthy */
      : {})
  };
}

/**
 * @param {string} path
 * @param {boolean} $exists
 * @returns {import('./queryTree.js').QueryPresenceLeaf}
 */
export function makePresenceLeaf (path, $exists) {
  return {kind: 'presence', path, $exists};
}

/**
 * @param {string} path
 * @param {boolean} value
 * @returns {import('./queryTree.js').QueryBooleanEqualsLeaf}
 */
export function makeBooleanEqualsLeaf (path, value) {
  return {kind: 'booleanEquals', path, value};
}
