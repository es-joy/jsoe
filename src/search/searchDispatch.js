import {getSchemaType} from '../formats/schema.js';

import dateSearchType from './fundamentalTypes/dateSearchType.js';
import numberSearchType from './fundamentalTypes/numberSearchType.js';
import bigintSearchType from './fundamentalTypes/bigintSearchType.js';
import stringSearchType from './fundamentalTypes/stringSearchType.js';
import regexpSearchType from './fundamentalTypes/regexpSearchType.js';
import booleanSearchType from './fundamentalTypes/booleanSearchType.js';
import symbolSearchType from './fundamentalTypes/symbolSearchType.js';
import undefinedSearchType from './fundamentalTypes/undefinedSearchType.js';
import nullSearchType from './fundamentalTypes/nullSearchType.js';
import nanSearchType from './fundamentalTypes/nanSearchType.js';
import enumSearchType from './fundamentalTypes/enumSearchType.js';
import arraySearchType from './fundamentalTypes/arraySearchType.js';
import setSearchType from './fundamentalTypes/setSearchType.js';
import objectSearchType from './fundamentalTypes/objectSearchType.js';
import filelistSearchType from './fundamentalTypes/filelistSearchType.js';
import tupleSearchType from './subTypes/tupleSearchType.js';
import recordSearchType from './subTypes/recordSearchType.js';
import mapSearchType from './fundamentalTypes/mapSearchType.js';
import promiseSearchType from './fundamentalTypes/promiseSearchType.js';
import catchSearchType from './fundamentalTypes/catchSearchType.js';
import functionSearchType from './fundamentalTypes/functionSearchType.js';

/**
 * @typedef {import('./queryTree.js').QueryNode} QueryNode
 */

/**
 * The search-side analogue of `TypeObject` (`src/types.js:308-408`): two
 * methods, `buildUI` (a `jml` array) and `getQuery` (reads the built DOM
 * back into a `QueryNode`, or `undefined` when no constraint was entered).
 * @typedef {{
 *   buildUI: (cfg: {
 *     schemaObject: import('../formats/schema.js').ZodexSchema,
 *     path: string,
 *     typeNamespace?: string,
 *     topRoot?: import('../types.js').RootElement,
 *     types?: import('../types.js').default
 *   }) => import('../types.js').JamilihArray,
 *   getQuery: (cfg: {
 *     root: HTMLElement,
 *     path: string
 *   }) => QueryNode|undefined
 * }} SearchTypeObject
 */

/**
 * Temporary placeholder used while a given search type's real module is
 * still to-do (build order, `docs/proposals/search-plan.md` §6). Renders a
 * plainly-labelled marker rather than throwing, so the full dispatch table
 * is exercisable end-to-end before every leaf/composite is implemented.
 * @param {string} searchSchemaType
 * @returns {SearchTypeObject}
 */
function stubSearchType (searchSchemaType) {
  return {
    buildUI: () => ['span', [`TODO: ${searchSchemaType}`]],
    getQuery: () => undefined
  };
}

/**
 * Escape hatch for `instanceof`-outside-`FileList` and any schema shape not
 * (yet) recognized: no widget is rendered for it, only this stand-in.
 * @type {SearchTypeObject}
 */
const noneditableSearchType = stubSearchType('noneditable');

/**
 * `Record<string, SearchTypeObject>` registry, analogous to
 * `Types.prototype.availableTypes` (`src/types.js:473-581`). Every entry is
 * a stub for now (build order step 1); later steps replace individual
 * entries with their real `*SearchType.js` module, one at a time, without
 * touching this shape.
 *
 * A few keys deliberately share one module reference rather than getting
 * their own: `BooleanObject`/`NumberObject`/`StringObject`/`bigintObject`
 * point at their primitive counterpart's module because a search leaf only
 * cares about the query semantics (e.g. "true or false"), never about how
 * the value-editing side constructs the boxed wrapper at runtime. Likewise
 * `arrayNonindexKeys` mirrors `array`, `looseRecord` mirrors `record`, and
 * `templateLiteral` mirrors `string` (README: a template literal is still
 * fundamentally a string-shape constraint for this pass; see §3 of the
 * search plan).
 * @type {{[key: string]: SearchTypeObject}}
 */
const availableSearchTypes = {
  // fundamentalTypes
  date: dateSearchType,
  number: numberSearchType,
  NumberObject: numberSearchType,
  bigint: bigintSearchType,
  bigintObject: bigintSearchType,
  string: stringSearchType,
  StringObject: stringSearchType,
  regexp: regexpSearchType,
  boolean: booleanSearchType,
  BooleanObject: booleanSearchType,
  symbol: symbolSearchType,
  undef: undefinedSearchType,
  null: nullSearchType,
  nan: nanSearchType,
  array: arraySearchType,
  arrayNonindexKeys: arraySearchType,
  object: objectSearchType,
  map: mapSearchType,
  set: setSearchType,
  filelist: filelistSearchType,
  file: stubSearchType('file'),
  blob: stubSearchType('blob'),
  error: stubSearchType('error'),
  domexception: stubSearchType('domexception'),
  promise: promiseSearchType,
  function: functionSearchType,
  enum: enumSearchType,

  // subTypes
  tuple: tupleSearchType,
  record: recordSearchType,
  looseRecord: recordSearchType,
  blobHTML: stubSearchType('blobHTML'),

  // superTypes
  domrect: stubSearchType('domrect'),
  dompoint: stubSearchType('dompoint'),
  dommatrix: stubSearchType('dommatrix'),
  errors: stubSearchType('errors'),
  SpecialNumber: stubSearchType('SpecialNumber'),
  SpecialRealNumber: stubSearchType('SpecialRealNumber'),
  buffersource: stubSearchType('buffersource'),

  // unions
  union: stubSearchType('union'),
  xor: stubSearchType('xor'),
  discriminatedUnion: stubSearchType('discriminatedUnion'),

  // string-shape alias (§3)
  templateLiteral: stringSearchType,

  // `getSchemaType` has no case for `catch` at all (unlike `promise`/
  //   `function`, already in `zodexToStructuredCloningTypeMap`), so it's
  //   added as its own extra case in `getSearchSchemaType` below
  catch: catchSearchType,

  // escape hatch, also the fallback for any unrecognized/not-yet-supported
  //   schema shape (see `getSearchTypeObject`)
  resurrectable: noneditableSearchType
};

/**
 * Schema-only analogue of `getSchemaType` (`src/formats/schema.js:145-166`).
 * Must not reimplement that function's special-casing (stringbool pipe,
 * `codec`/filelist, `instanceof`, `literal`, `enum`, `templateLiteral`,
 * `getCheckedType` fallback) - it calls straight through to it, and only
 * adds the extra shape distinctions `getSchemaType`'s own
 * `AvailableArbitraryType` output collapses (tuple, record/looseRecord,
 * union/xor/discriminatedUnion all currently reduce to `'array'`/`'object'`/
 * nothing, per `zodexToStructuredCloningTypeMap`,
 * `src/formats/schema.js:30-56`).
 *
 * Intersection schemas are deliberately not a case here - they're resolved
 * before dispatch, by the search-widget walker calling `getTypesForSchema`
 * (search plan §3), reusing jsoe's existing intersection-merging machinery
 * rather than this function reinventing it.
 * @param {import('../formats/schema.js').ZodexSchema} schemaObject
 * @returns {string}
 */
export function getSearchSchemaType (schemaObject) {
  if (schemaObject.type === 'tuple') {
    return 'tuple';
  }
  if (schemaObject.type === 'record' || schemaObject.type === 'looseRecord') {
    return schemaObject.type;
  }
  if (['union', 'xor', 'discriminatedUnion'].includes(schemaObject.type)) {
    return schemaObject.type;
  }

  // An `enum` control can show a multiple-select list and template literal
  //   parts might justify their own search controls, so need to detect
  //   these schema types.
  if (['templateLiteral', 'enum'].includes(schemaObject.type)) {
    return schemaObject.type;
  }

  // `getSchemaType` (`src/formats/schema.js`) has no `catch` case at all -
  //   its `zodexToStructuredCloningTypeMap` never mapped it, unlike
  //   `promise`/`function` - so it's added here rather than there, matching
  //   how tuple/record/union already extend the search-only shape space.
  if (schemaObject.type === 'catch') {
    return 'catch';
  }

  return /** @type {string} */ (
    getSchemaType(schemaObject)
  ); // inherits stringbool/codec/instanceof/checks handling verbatim
}

/**
 * The one exported call site every recursive search widget uses (analogous
 * to `types.getTypeObject(type)`, `src/types.js:1106-1108`, but schema-in
 * rather than type-string-in, since there's no value to key off). Falls
 * back to `noneditableSearchType` for any schema shape `getSearchSchemaType`
 * reports that isn't (yet) registered, rather than throwing - the same
 * escape hatch a bare top-level `instanceof` schema falls through to.
 * @param {import('../formats/schema.js').ZodexSchema} schemaObject
 * @returns {SearchTypeObject}
 */
export function getSearchTypeObject (schemaObject) {
  const searchSchemaType = getSearchSchemaType(schemaObject);
  return availableSearchTypes[searchSchemaType] ?? noneditableSearchType;
}

export {availableSearchTypes, noneditableSearchType};
