import {buildPathLabel, buildRangeInputsPair, readRangeInputsPair} from '../searchUtils.js';
import {makeRangeLeaf} from '../queryTreeBuilders.js';
import {getQueryViaElement} from '../searchElementUtils.js';

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
        getQuery () {
          const {gte, lte} = readRangeInputsPair(this);
          if (gte === '' && lte === '') {
            return undefined;
          }
          return makeRangeLeaf(this.dataset.searchPath ?? '', 'buffersource', {
            ...(gte === '' ? {} : {$gte: Number(gte)}),
            ...(lte === '' ? {} : {$lte: Number(lte)})
          });
        }
      }
    }, [
      ['span', {class: 'searchLabel'}, [`${label} (byte length)`]],
      ...buildRangeInputsPair({name, min: 0})
    ]];
  },
  getQuery: getQueryViaElement
};

export default buffersourceSearchType;
