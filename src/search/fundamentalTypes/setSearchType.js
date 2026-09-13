import {buildPathLabel, buildLengthSizeControls, readLengthSizeQuery} from '../searchUtils.js';
import {combineAnd} from '../queryTreeBuilders.js';
import {findSearchElement, getQueryViaElement, hasGetQuery} from '../searchElementUtils.js';
import {getSearchTypeObject} from '../searchDispatch.js';

/**
 * @typedef {import('../searchDispatch.js').SearchTypeObject} SearchTypeObject
 */

/**
 * Has length/size of &lt;number&gt; (README) - no sparse toggle: unlike
 * `array`, a `Set` cannot have holes. Also recurses into the value schema's
 * own search widget (as `arraySearchType.js` does for its element), via the
 * same `*` path-segment convention (`queryTree.js`).
 * @type {SearchTypeObject}
 */
const setSearchType = {
  buildUI ({schemaObject, path, typeNamespace, topRoot, types}) {
    const label = buildPathLabel(schemaObject, path);
    const name = `${typeNamespace}-set`;
    const setSchemaObject = /** @type {import('zodexy').SzSet} */ (
      schemaObject
    );
    const elementPath = `${path}/*`;
    const elementArr = getSearchTypeObject(setSchemaObject.value).buildUI({
      schemaObject: setSchemaObject.value,
      path: elementPath,
      typeNamespace,
      topRoot,
      types
    });
    return ['jsoe-search-set', {
      dataset: {searchPath: path, searchKind: 'set'},
      title: label,
      $define: {
        /** @this {HTMLElement} */
        getQuery () {
          const searchPath = this.dataset.searchPath ?? '';
          const lengthLeaf = readLengthSizeQuery(this, searchPath);
          const elementEl = findSearchElement(this, `${searchPath}/*`);
          const elementLeaf = elementEl && hasGetQuery(elementEl)
            ? elementEl.getQuery()
            : undefined;
          return combineAnd([lengthLeaf, elementLeaf]);
        }
      }
    }, [
      ['span', {class: 'searchLabel'}, [label]],
      ...buildLengthSizeControls({
        name,
        min: setSchemaObject.minSize,
        max: setSchemaObject.maxSize,
        includeSparse: false
      }),
      ['div', {class: 'searchSetElement'}, [
        ['span', ['Element matches: ']],
        elementArr
      ]]
    ]];
  },
  getQuery: getQueryViaElement
};

export default setSearchType;
