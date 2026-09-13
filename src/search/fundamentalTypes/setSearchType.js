import {buildPathLabel, buildLengthSizeControls, readLengthSizeQuery} from '../searchUtils.js';
import {getQueryViaElement} from '../searchElementUtils.js';

/**
 * @typedef {import('../searchDispatch.js').SearchTypeObject} SearchTypeObject
 */

/**
 * Has length/size of &lt;number&gt; (README) - no sparse toggle: unlike
 * `array`, a `Set` cannot have holes.
 * @type {SearchTypeObject}
 */
const setSearchType = {
  buildUI ({schemaObject, path, typeNamespace}) {
    const label = buildPathLabel(schemaObject, path);
    const name = `${typeNamespace}-set`;
    const setSchemaObject = /** @type {import('zodexy').SzSet} */ (
      schemaObject
    );
    return ['jsoe-search-set', {
      dataset: {searchPath: path, searchKind: 'set'},
      title: label,
      $define: {
        /** @this {HTMLElement} */
        getQuery () {
          return readLengthSizeQuery(this, {
            name, path: this.dataset.searchPath ?? ''
          });
        }
      }
    }, [
      ['span', {class: 'searchLabel'}, [label]],
      ...buildLengthSizeControls({
        name,
        min: setSchemaObject.minSize,
        max: setSchemaObject.maxSize,
        includeSparse: false
      })
    ]];
  },
  getQuery: getQueryViaElement
};

export default setSearchType;
