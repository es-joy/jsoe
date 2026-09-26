import {
  buildPathLabel, buildMultiSelect, readMultiSelect, applyMultiSelect, extractLeafOfKind
} from '../searchUtils.js';
import {makeMultiSelectLeaf} from '../queryTreeBuilders.js';
import {getQueryViaElement, applyQueryViaElement} from '../searchElementUtils.js';

/**
 * @typedef {import('../searchDispatch.js').SearchTypeObject} SearchTypeObject
 */

/**
 * Special number: multiple select of "Infinity", "-Infinity" (README;
 * `NaN` is covered separately by `nanSearchType.js`'s presence-only
 * control, since it's its own zodexy schema type - `SpecialRealNumberType.js`
 * itself covers exactly `Infinity`/`-Infinity`/`-0`, not `NaN`).
 * @type {SearchTypeObject}
 */
const SpecialRealNumberSearchType = {
  buildUI ({schemaObject, path, typeNamespace}) {
    const label = buildPathLabel(schemaObject, path);
    const name = `${typeNamespace}-SpecialRealNumber`;
    return ['jsoe-search-special-real-number', {
      dataset: {searchPath: path, searchKind: 'SpecialRealNumber'},
      title: label,
      $define: {
        /** @this {HTMLElement} */
        getQuery () {
          const selected = readMultiSelect(this);
          return selected.length
            ? makeMultiSelectLeaf(this.dataset.searchPath ??
            /* istanbul ignore next -- Guard: buildUI always sets dataset.searchPath */
            '', {$in: selected})
            : undefined;
        },
        /**
         * @this {HTMLElement}
         * @param {import('../queryTree.js').QueryNode|undefined} queryNode
         * @returns {void}
         */
        applyQuery (queryNode) {
          const {matched} = extractLeafOfKind(queryNode, 'multiSelect');
          applyMultiSelect(this, matched?.$in ?? []);
        }
      }
    }, [
      ['span', {class: 'searchLabel'}, [label]],
      buildMultiSelect({
        name, options: ['Infinity', '-Infinity', '-0'], required: true
      })
    ]];
  },
  getQuery: getQueryViaElement,
  applyQuery: applyQueryViaElement
};

export default SpecialRealNumberSearchType;
