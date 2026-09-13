import {buildPathLabel} from '../searchUtils.js';
import {makePassThroughLeaf} from '../queryTreeBuilders.js';
import {findSearchElement, getQueryViaElement, hasGetQuery} from '../searchElementUtils.js';
import {getSearchTypeObject} from '../searchDispatch.js';

/**
 * @typedef {import('../searchDispatch.js').SearchTypeObject} SearchTypeObject
 */

/**
 * Promise, Literal, catch: pass on children (README) - same shape as
 * `promiseSearchType.js`'s pass-through (recurse into `.innerType` at the
 * same path, wrap in a `passThrough` leaf), except `getSchemaType`
 * (`src/formats/schema.js`) has no case for `catch` at all - unlike
 * `promise`/`function`, which `zodexToStructuredCloningTypeMap` already
 * maps - so `getSearchSchemaType` adds `catch` as its own extra case purely
 * for the search side, the same way it already does for `tuple`/`record`/
 * the union family.
 * @type {SearchTypeObject}
 */
const catchSearchType = {
  buildUI ({schemaObject, path, typeNamespace, topRoot, types}) {
    const label = buildPathLabel(schemaObject, path);
    const catchSchemaObject = /** @type {import('zodexy').SzCatch} */ (
      schemaObject
    );
    const childArr = getSearchTypeObject(catchSchemaObject.innerType).buildUI({
      schemaObject: catchSchemaObject.innerType,
      path,
      typeNamespace,
      topRoot,
      types
    });
    return ['jsoe-search-catch', {
      dataset: {searchPath: path, searchKind: 'catch'},
      title: label,
      $define: {
        /** @this {HTMLElement} */
        getQuery () {
          const searchPath = this.dataset.searchPath ?? '';
          const childEl = findSearchElement(this, searchPath);
          const childQuery = childEl && hasGetQuery(childEl)
            ? childEl.getQuery()
            : undefined;
          return childQuery === undefined
            ? undefined
            : makePassThroughLeaf(searchPath, childQuery);
        }
      }
    }, [
      ['span', {class: 'searchLabel'}, [label]],
      childArr
    ]];
  },
  getQuery: getQueryViaElement
};

export default catchSearchType;
