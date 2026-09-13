import {buildDateInputControl} from '../../fundamentalTypes/dateType.js';
import {buildPathLabel} from '../searchUtils.js';
import {makeRangeLeaf} from '../queryTreeBuilders.js';
import {getQueryViaElement} from '../searchElementUtils.js';

/**
 * @typedef {import('../searchDispatch.js').SearchTypeObject} SearchTypeObject
 */

/**
 * Reads the two `datetime-local` inputs directly off the element rather
 * than off any closed-over reference, since a custom element's mixin
 * methods (`$define`, search plan §8) are installed once on the shared
 * prototype the first time the tag is defined - every instance must read
 * its own state off `this`, never off a build-time closure variable.
 * @param {HTMLElement} el
 * @returns {{gte: string, lte: string}}
 */
function readInputs (el) {
  const [gteInput, lteInput] = /** @type {HTMLInputElement[]} */ (
    [...el.querySelectorAll('input[type="datetime-local"]')]
  );
  return {gte: gteInput.value, lte: lteInput.value};
}

/**
 * OR date range/Is Not Range (README). `dateType.js`'s own
 * `buildDateInputControl` is reused twice (range start/end) so the min/max
 * wiring and ISO-slicing stay in one place.
 * @type {SearchTypeObject}
 */
const dateSearchType = {
  buildUI ({schemaObject, path, typeNamespace}) {
    const label = buildPathLabel(schemaObject, path);
    const dateSchemaObject = /** @type {import('zodexy').SzDate} */ (
      schemaObject
    );
    return ['jsoe-search-date', {
      dataset: {searchPath: path, searchKind: 'date'},
      title: label,
      $define: {
        /** @this {HTMLElement} */
        getQuery () {
          const {gte, lte} = readInputs(this);
          if (!gte && !lte) {
            return undefined;
          }
          return makeRangeLeaf(
            this.dataset.searchPath ?? '',
            'date',
            {
              ...(gte ? {$gte: new Date(gte).toISOString()} : {}),
              ...(lte ? {$lte: new Date(lte).toISOString()} : {})
            }
          );
        }
      }
    }, [
      ['span', {class: 'searchLabel'}, [label]],
      ['label', [
        'From: ',
        buildDateInputControl({name: `${typeNamespace}-date-gte`, dateSchemaObject})
      ]],
      ['label', [
        'To: ',
        buildDateInputControl({name: `${typeNamespace}-date-lte`, dateSchemaObject})
      ]]
    ]];
  },
  getQuery: getQueryViaElement
};

export default dateSearchType;
