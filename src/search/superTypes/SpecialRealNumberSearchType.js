import {buildPathLabel, buildMultiSelect, readMultiSelect} from '../searchUtils.js';
import {makeMultiSelectLeaf} from '../queryTreeBuilders.js';
import {getQueryViaElement} from '../searchElementUtils.js';

/**
 * @typedef {import('../searchDispatch.js').SearchTypeObject} SearchTypeObject
 */

/**
 * Special number: multiple select of "Infinity", "-Infinity" (README;
 * `NaN` is covered separately by `nanSearchType.js`'s presence-only
 * control, since it's its own zodex schema type - `SpecialRealNumberType.js`
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
            ? makeMultiSelectLeaf(this.dataset.searchPath ?? '', {$in: selected})
            : undefined;
        }
      }
    }, [
      ['span', {class: 'searchLabel'}, [label]],
      buildMultiSelect({
        name, options: ['Infinity', '-Infinity', '-0']
      })
    ]];
  },
  getQuery: getQueryViaElement
};

export default SpecialRealNumberSearchType;
