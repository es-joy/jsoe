import {buildPathLabel, buildLengthSizeControls, readLengthSizeQuery} from '../searchUtils.js';
import {combineAnd} from '../queryTreeBuilders.js';
import {findSearchElement, getQueryViaElement, hasGetQuery} from '../searchElementUtils.js';
import {buildSearchWidget} from '../searchDispatch.js';

/**
 * @typedef {import('../searchDispatch.js').SearchTypeObject} SearchTypeObject
 */

/**
 * Has length/size of &lt;number&gt;; Is/Is not sparse (README), plus - by
 * recursing into the element schema's own search widget (search plan §6
 * build order) - "the array contains at least one element matching Y",
 * expressed via a `*` path segment (`queryTree.js`) so no dedicated wrapper
 * leaf kind is needed: the two constraints simply combine with `$and`.
 * @type {SearchTypeObject}
 */
const arraySearchType = {
  buildUI ({schemaObject, path, typeNamespace, topRoot, types, originalJSON}) {
    const label = buildPathLabel(schemaObject, path);
    const name = `${typeNamespace}-array`;
    const arraySchemaObject = /** @type {import('zodexy').SzArray} */ (
      schemaObject
    );
    const elementPath = `${path}/*`;
    const elementArr = buildSearchWidget({
      schemaObject: arraySchemaObject.element,
      path: elementPath,
      typeNamespace,
      topRoot,
      types,
      originalJSON
    });
    return ['jsoe-search-array', {
      dataset: {searchPath: path, searchKind: 'array'},
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
        min: arraySchemaObject.minLength,
        max: arraySchemaObject.maxLength,
        includeSparse: true
      }),
      ['div', {class: 'searchArrayElement'}, [
        ['span', ['Element matches: ']],
        elementArr
      ]]
    ]];
  },
  getQuery: getQueryViaElement
};

export default arraySearchType;
