import {
  buildPathLabel, buildCheckbox, readCheckbox,
  buildLiteralRegexControls, readLiteralRegexQuery, applyOptInLiteralRegexFacet,
  buildRangeInputsPair, readRangeInputsPair, syncRangeValidity, applyOptInRangeFacet,
  applyRangeQuery,
  buildTriStateSelect, readTriStateSelect, applyTriState,
  buildOptInFieldset, readOptInChecked, wireOptInFieldset, applyOptIn,
  buildAtLeastOneSentinel, syncAtLeastOneCheck,
  extractLeafOfKind
} from './searchUtils.js';
import {combineAnd, makeRangeLeaf, makeDomShapeLeaf} from './queryTreeBuilders.js';
import regexpType from '../fundamentalTypes/regexpType.js';

/**
 * Locates a built search element by the JSON-Pointer path it was built for.
 * Compares `dataset.searchPath` in JS rather than interpolating `path` into
 * a `querySelector` attribute-value string, since a schema path can embed
 * arbitrary property-name characters (only `~`/`/` are escaped by
 * `makeJSONPointer`) that would otherwise need CSS-selector escaping.
 * @param {ParentNode} root
 * @param {string} path
 * @returns {HTMLElement|undefined}
 */
export function findSearchElement (root, path) {
  return /** @type {HTMLElement[]} */ (
    [...root.querySelectorAll('[data-search-path]')]
  ).find((el) => el.dataset.searchPath === path);
}

/**
 * @typedef {HTMLElement & {
 *   getQuery: () => import('./queryTree.js').QueryNode|undefined,
 *   applyQuery?: (queryNode: import('./queryTree.js').QueryNode|undefined) => void
 * }} SearchElement
 */

/**
 * The `SearchTypeObject.getQuery` every leaf module implements identically:
 * locate the element it built under `root` and delegate to its own
 * (per-element, `dataset`-driven) `getQuery()` method.
 * @param {{root: HTMLElement, path: string}} cfg
 * @returns {import('./queryTree.js').QueryNode|undefined}
 */
export function getQueryViaElement ({root, path}) {
  const el = /** @type {SearchElement|undefined} */ (
    findSearchElement(root, path)
  );
  return el?.getQuery();
}

/**
 * The `SearchTypeObject.applyQuery` every module implements identically -
 * the "Edit raw" round-trip's counterpart to `getQueryViaElement`: locate
 * the element built under `root` and delegate to its own `applyQuery(...)`
 * method.
 * @param {{
 *   root: HTMLElement, path: string,
 *   queryNode: import('./queryTree.js').QueryNode|undefined
 * }} cfg
 * @returns {void}
 */
export function applyQueryViaElement ({root, path, queryNode}) {
  const el = /** @type {SearchElement|undefined} */ (
    findSearchElement(root, path)
  );
  el?.applyQuery?.(queryNode);
}

/**
 * Type-predicate guard distinguishing a built search element (leaf or
 * container, either answers to `.getQuery()`) from a plain DOM node - used
 * by container elements (e.g. `objectSearchType.js`'s `<jsoe-search-object>`)
 * that walk `this.children` polymorphically (search plan §8) without
 * knowing which children are search elements and which are plain layout
 * (a controls `<div>`, etc.).
 * @param {Element} el
 * @returns {el is SearchElement}
 */
export function hasGetQuery (el) {
  return typeof (/** @type {{getQuery?: unknown}} */ (el)).getQuery ===
    'function';
}

/**
 * Same as `hasGetQuery`, for `applyQuery` - a container walking its own
 * children to recurse an "Edit raw" apply into each needs to know which
 * ones answer to it, same reasoning as `hasGetQuery`'s own doc.
 * @param {Element} el
 * @returns {el is SearchElement & {applyQuery: (
 *   queryNode: import('./queryTree.js').QueryNode|undefined
 * ) => void}}
 */
export function hasApplyQuery (el) {
  return typeof (/** @type {{applyQuery?: unknown}} */ (el)).applyQuery ===
    'function';
}

/**
 * Factory for the README's "no variants to allow for distinct search"
 * leaves (`undefined`/`void`, `null`, `NaN`): the only meaningful question
 * is whether the path is present at all, which only matters once the path
 * is optional or nested in a union - so all three share one tiny, single-
 * checkbox implementation, differing only in tag name/label. Unlike every
 * other leaf, this one is never left for the user to configure at all: its
 * checkbox is pre-checked and `disabled` (`buildCheckbox`'s doc), since a
 * type with only one possible value has nothing else worth offering a
 * choice between - it's simply valid, unconditionally, the moment it
 * exists, rather than needing a `required`-style rule of its own.
 * @param {{tagName: string}} cfg
 * @returns {import('./searchDispatch.js').SearchTypeObject}
 */
export function makePresenceOnlySearchType ({tagName}) {
  return {
    buildUI ({schemaObject, path, typeNamespace}) {
      const label = buildPathLabel(schemaObject, path);
      const name = `${typeNamespace}-${tagName}`;
      return [tagName, {
        dataset: {searchPath: path, searchKind: tagName},
        title: label,
        $define: {
          /** @this {HTMLElement} */
          getQuery () {
            const checked = readCheckbox(this);
            /* istanbul ignore if -- Guard: the checkbox is permanently checked and disabled */
            if (!checked) {
              return undefined;
            }
            return {
              kind: 'presence',
              path: this.dataset.searchPath ??
                /* istanbul ignore next -- Guard: buildUI always sets dataset.searchPath */
                '',
              $exists: true
            };
          },
          // The checkbox is permanently checked and `disabled` - nothing
          // for a raw query to change here either way.
          applyQuery () {
            //
          }
        }
      }, [
        ['span', {class: 'searchLabel'}, [label]],
        buildCheckbox({
          name, label: `Require ${label} present`, checked: true, disabled: true
        })
      ]];
    },
    getQuery: getQueryViaElement,
    applyQuery: applyQueryViaElement
  };
}

/**
 * The Error family's fixed known properties (`errorType.js`'s own
 * `setValue`/`getValue` hard-code this same set - `message`/`name`/
 * `fileName`/`stack` as strings, `lineNumber`/`columnNumber` as numbers -
 * since a `checked`-type schema like `error`/`errors` carries no structural
 * detail of its own to derive property names/types from, unlike `object`).
 * @type {string[]}
 */
const errorStringProps = ['message', 'name', 'fileName', 'stack'];

/** @type {string[]} */
const errorNumberProps = ['lineNumber', 'columnNumber'];

/**
 * @param {{label: string, name: string}} cfg
 * @returns {import('./searchUtils.js').JamilihArray[]}
 */
function buildErrorFamilyChildren ({label, name}) {
  /** @type {import('./searchUtils.js').JamilihArray[]} */
  const children = [['span', {class: 'searchLabel'}, [label]]];
  errorStringProps.forEach((prop) => {
    children.push(...buildOptInFieldset({
      name: `${name}-${prop}`, key: prop, label: prop,
      children: [buildLiteralRegexControls({
        name: `${name}-${prop}`, key: prop, flagOptions: regexpType.allowedFlags
      })]
    }));
  });
  errorNumberProps.forEach((prop) => {
    children.push(...buildOptInFieldset({
      name: `${name}-${prop}`, key: prop, label: prop,
      children: buildRangeInputsPair({name: `${name}-${prop}`, key: prop})
    }));
  });
  children.push(buildAtLeastOneSentinel());
  return children;
}

/**
 * @param {Element} root - a `jsoe-search-error`/`jsoe-search-errors-special`
 *   element
 * @returns {void}
 */
function syncErrorFamilyValidity (root) {
  syncAtLeastOneCheck(
    root,
    () => [...errorStringProps, ...errorNumberProps].some(
      (prop) => readOptInChecked(root, prop)
    )
  );
}

/**
 * Factory for `errorSearchType.js`/`errorsSpecialSearchType.js`, offering
 * literal/regex search of child string properties, numeric of number
 * children (README) - one `buildLiteralRegexControls`/`buildRangeInputsPair`
 * pair per known property (`key`-distinguished so they coexist in one
 * widget; see those helpers' docs), each wrapped in its own
 * `buildOptInFieldset` (so picking, say, just `message` doesn't also force
 * `name`/`fileName`/`stack`/`lineNumber`/`columnNumber` to be filled in),
 * combined via `$and`, with `buildAtLeastOneSentinel` requiring at least one
 * of the six to actually be opted into. `.cause` (a recursive, arbitrarily-
 * typed property) and `errorsSpecial`'s `AggregateError.errors` array are
 * deliberately left out of this pass - the README's bullet asks only for
 * the flat string/number children, and open-ended recursion into an
 * arbitrary `cause` chain is a materially bigger feature than "the same
 * shape, twice more".
 * @param {{tagName: string}} cfg
 * @returns {import('./searchDispatch.js').SearchTypeObject}
 */
export function makeErrorFamilySearchType ({tagName}) {
  return {
    buildUI ({schemaObject, path, typeNamespace}) {
      const label = buildPathLabel(schemaObject, path);
      const name = `${typeNamespace}-${tagName}`;
      return [tagName, {
        dataset: {searchPath: path, searchKind: tagName},
        title: label,
        $define: {
          /** @this {HTMLElement} */
          connectedCallback () {
            errorNumberProps.forEach((prop) => syncRangeValidity(this, prop));
            [...errorStringProps, ...errorNumberProps].forEach((prop) => (
              wireOptInFieldset(this, prop, () => syncErrorFamilyValidity(this))
            ));
            syncErrorFamilyValidity(this);
          },
          /** @this {HTMLElement} */
          getQuery () {
            const searchPath = this.dataset.searchPath ??
              /* istanbul ignore next -- Guard: buildUI always sets dataset.searchPath */
              '';
            const stringLeaves = errorStringProps.map((prop) => (
              readOptInChecked(this, prop)
                ? readLiteralRegexQuery(this, `${searchPath}/${prop}`, prop)
                : undefined
            ));
            const numberLeaves = errorNumberProps.map((prop) => {
              if (!readOptInChecked(this, prop)) {
                return undefined;
              }
              const {gte, lte} = readRangeInputsPair(this, prop);
              if (gte === '' && lte === '') {
                return undefined;
              }
              return makeRangeLeaf(`${searchPath}/${prop}`, 'number', {
                ...(gte === '' ? {} : {$gte: Number(gte)}),
                ...(lte === '' ? {} : {$lte: Number(lte)})
              });
            });
            return combineAnd([...stringLeaves, ...numberLeaves]);
          },
          /**
           * @this {HTMLElement}
           * @param {import('./queryTree.js').QueryNode|undefined} queryNode
           * @returns {void}
           */
          applyQuery (queryNode) {
            const searchPath = this.dataset.searchPath ??
              /* istanbul ignore next -- Guard: buildUI always sets dataset.searchPath */
              '';
            errorStringProps.forEach((prop) => {
              applyOptInLiteralRegexFacet(this, queryNode, `${searchPath}/${prop}`, prop);
            });
            errorNumberProps.forEach((prop) => {
              applyOptInRangeFacet(this, queryNode, `${searchPath}/${prop}`, prop);
            });
            syncErrorFamilyValidity(this);
          }
        }
      }, buildErrorFamilyChildren({label, name})];
    },
    getQuery: getQueryViaElement,
    applyQuery: applyQueryViaElement
  };
}

/**
 * @param {{
 *   label: string, name: string, dimensionKeys: string[],
 *   includeReadonly: boolean, includeDimensionCheck: boolean
 * }} cfg
 * @returns {import('./searchUtils.js').JamilihArray[]}
 */
function buildDomShapeChildren ({
  label, name, dimensionKeys, includeReadonly, includeDimensionCheck
}) {
  /** @type {import('./searchUtils.js').JamilihArray[]} */
  const children = [['span', {class: 'searchLabel'}, [label]]];
  dimensionKeys.forEach((dim) => {
    children.push(...buildOptInFieldset({
      name: `${name}-${dim}`, key: dim, label: dim,
      children: buildRangeInputsPair({name: `${name}-${dim}`, key: dim})
    }));
  });
  if (includeReadonly) {
    children.push(['label', [
      'Readonly: ',
      buildTriStateSelect({
        name: `${name}-readonly`, key: 'readonly',
        trueLabel: 'Readonly', falseLabel: 'Not readonly'
      })
    ]]);
  }
  if (includeDimensionCheck) {
    children.push(['label', [
      '3d: ',
      buildTriStateSelect({
        name: `${name}-dimension`, key: 'dimension',
        trueLabel: '3d', falseLabel: 'Not 3d'
      })
    ]]);
  }
  children.push(buildAtLeastOneSentinel());
  return children;
}

/**
 * @param {{
 *   root: Element, dimensionKeys: string[], includeReadonly: boolean,
 *   includeDimensionCheck: boolean
 * }} cfg
 * @returns {void}
 */
function syncDomShapeValidity ({root, dimensionKeys, includeReadonly, includeDimensionCheck}) {
  syncAtLeastOneCheck(root, () => (
    dimensionKeys.some((dim) => readOptInChecked(root, dim)) ||
    (includeReadonly && readTriStateSelect(root, 'readonly') !== undefined) ||
    (includeDimensionCheck && readTriStateSelect(root, 'dimension') !== undefined)
  ));
}

/**
 * Factory for `domrectSearchType.js`/`dompointSearchType.js`/
 * `dommatrixSearchType.js`: numeric search ranges for children; "Is/Is not
 * Readonly"; DOMMatrix: "Is/Is not 3d" (README) - one `buildRangeInputsPair`
 * per known dimension (`key`-distinguished so they coexist in one widget;
 * `dimensionKeys` covers DOMMatrix's 2D (`a`-`f`) *and* 3D (`m11`-`m44`)
 * shapes at once rather than switching the control set on an "Is/Is not 3d"
 * answer that's itself just another optional search constraint, not a
 * schema fact - `domrect`/`dompoint`/`dommatrix` are all "checked" types
 * with no structural schema to derive dimension names from in the first
 * place, same reasoning as `makeErrorFamilySearchType`), combined into one
 * `domShape` leaf (`queryTree.js`) rather than separate leaves via `$and`.
 * @param {{
 *   tagName: string,
 *   dimensionKeys: string[],
 *   includeReadonly?: boolean,
 *   includeDimensionCheck?: boolean
 * }} cfg
 * @returns {import('./searchDispatch.js').SearchTypeObject}
 */
export function makeDomShapeSearchType ({
  tagName, dimensionKeys,
  /* istanbul ignore next -- Guard: every current caller (domrect/dompoint/
    dommatrix) explicitly passes `true`; none omits it. */
  includeReadonly = false,
  includeDimensionCheck = false
}) {
  return {
    buildUI ({schemaObject, path, typeNamespace}) {
      const label = buildPathLabel(schemaObject, path);
      const name = `${typeNamespace}-${tagName}`;
      return [tagName, {
        dataset: {searchPath: path, searchKind: tagName},
        title: label,
        $define: {
          /** @this {HTMLElement} */
          connectedCallback () {
            const syncValidity = () => syncDomShapeValidity({
              root: this, dimensionKeys, includeReadonly, includeDimensionCheck
            });
            dimensionKeys.forEach((dim) => {
              syncRangeValidity(this, dim);
              wireOptInFieldset(this, dim, syncValidity);
            });
            if (includeReadonly) {
              this.querySelector('select.jsoeSearchTriState--readonly')?.addEventListener(
                'change', syncValidity
              );
            }
            if (includeDimensionCheck) {
              this.querySelector('select.jsoeSearchTriState--dimension')?.addEventListener(
                'change', syncValidity
              );
            }
            syncValidity();
          },
          /** @this {HTMLElement} */
          getQuery () {
            const searchPath = this.dataset.searchPath ??
              /* istanbul ignore next -- Guard: buildUI always sets dataset.searchPath */
              '';
            /** @type {{[dim: string]: import('./queryTree.js').QueryRangeLeaf}} */
            const dimensions = {};
            dimensionKeys.forEach((dim) => {
              if (!readOptInChecked(this, dim)) {
                return;
              }
              const {gte, lte} = readRangeInputsPair(this, dim);
              if (gte === '' && lte === '') {
                return;
              }
              dimensions[dim] = makeRangeLeaf(`${searchPath}/${dim}`, 'number', {
                ...(gte === '' ? {} : {$gte: Number(gte)}),
                ...(lte === '' ? {} : {$lte: Number(lte)})
              });
            });
            const readonlyCheck = includeReadonly
              ? readTriStateSelect(this, 'readonly')
              : /* istanbul ignore next -- Guard: every current caller passes `includeReadonly: true` */ undefined;
            const dimensionCheck = includeDimensionCheck
              ? readTriStateSelect(this, 'dimension')
              : undefined;
            if (
              readonlyCheck === undefined && dimensionCheck === undefined &&
              Object.keys(dimensions).length === 0
            ) {
              return undefined;
            }
            return makeDomShapeLeaf(searchPath, dimensions, {
              ...(readonlyCheck === undefined ? {} : {readonlyCheck}),
              ...(dimensionCheck === undefined
                ? {}
                : {dimensionCheck: dimensionCheck ? 3 : 2})
            });
          },
          /**
           * @this {HTMLElement}
           * @param {import('./queryTree.js').QueryNode|undefined} queryNode
           * @returns {void}
           */
          applyQuery (queryNode) {
            // A `domShape` leaf embeds each dimension's own `range` leaf
            // directly (`dimensions`), not via `$and` - so, unlike
            // `makeErrorFamilySearchType`'s flat properties,
            // `extractClauseForPath` (which `applyOptInRangeFacet` uses)
            // isn't needed here: read the whole leaf once and apply each
            // dimension straight from it.
            const {matched} = extractLeafOfKind(queryNode, 'domShape');
            dimensionKeys.forEach((dim) => {
              const dimLeaf = matched?.dimensions[dim];
              applyOptIn(this, dimLeaf !== undefined, dim);
              applyRangeQuery(this, dimLeaf, dim);
            });
            if (includeReadonly) {
              applyTriState(this, matched?.readonlyCheck, 'readonly');
            }
            if (includeDimensionCheck) {
              applyTriState(
                this,
                matched?.dimensionCheck === undefined
                  ? undefined
                  : matched.dimensionCheck === 3,
                'dimension'
              );
            }
            syncDomShapeValidity({root: this, dimensionKeys, includeReadonly, includeDimensionCheck});
          }
        }
      }, buildDomShapeChildren({
        label, name, dimensionKeys, includeReadonly, includeDimensionCheck
      })];
    },
    getQuery: getQueryViaElement,
    applyQuery: applyQueryViaElement
  };
}
