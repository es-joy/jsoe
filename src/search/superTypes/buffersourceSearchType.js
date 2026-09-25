import {
  buildPathLabel, buildRangeInputsPair, readRangeInputsPair, syncRangeValidity,
  applyRangeQuery, extractLeafOfKind
} from '../searchUtils.js';
import {makeRangeLeaf} from '../queryTreeBuilders.js';
import {getQueryViaElement, applyQueryViaElement} from '../searchElementUtils.js';

/**
 * @typedef {import('../searchDispatch.js').SearchTypeObject} SearchTypeObject
 */

/**
 * BufferSource: OR Range/Is Not Range (README) - a byte-length range, per
 * the build order's own note that `buffersource` (like `function`) is
 * "fuzzy" enough in the README to ship as a minimal, honest stub rather
 * than over-build past what the spec defines. `buffersource` is one of
 * jsoe's "checked" types (`{type: 'any', checks: [{name: 'buffersource'}]}`)
 * with no schema-level byte-length bounds to read `min`/`max` HTML
 * attributes from, unlike `array`'s `minLength`/`maxLength`.
 * @type {SearchTypeObject}
 */
const buffersourceSearchType = {
  buildUI ({schemaObject, path, typeNamespace}) {
    const label = buildPathLabel(schemaObject, path);
    const name = `${typeNamespace}-buffersource`;
    return ['jsoe-search-buffersource', {
      dataset: {searchPath: path, searchKind: 'buffersource'},
      title: label,
      $define: {
        /** @this {HTMLElement} */
        connectedCallback () {
          syncRangeValidity(this);
        },
        /** @this {HTMLElement} */
        getQuery () {
          const {gte, lte} = readRangeInputsPair(this);
          if (gte === '' && lte === '') {
            return undefined;
          }
          return makeRangeLeaf(this.dataset.searchPath ??
            /* istanbul ignore next -- Guard: buildUI always sets dataset.searchPath */
            '', 'buffersource', {
            ...(gte === '' ? {} : {$gte: Number(gte)}),
            ...(lte === '' ? {} : {$lte: Number(lte)})
          });
        },
        /**
         * @this {HTMLElement}
         * @param {import('../queryTree.js').QueryNode|undefined} queryNode
         * @returns {void}
         */
        applyQuery (queryNode) {
          const {matched} = extractLeafOfKind(queryNode, 'range');
          applyRangeQuery(this, matched);
        }
      }
    }, [
      ['span', {class: 'searchLabel'}, [`${label} (byte length)`]],
      ...buildRangeInputsPair({name, min: 0})
    ]];
  },
  getQuery: getQueryViaElement,
  applyQuery: applyQueryViaElement
};

export default buffersourceSearchType;
