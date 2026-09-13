import {buildPathLabel} from '../searchUtils.js';
import {makePassThroughLeaf} from '../queryTreeBuilders.js';
import {findSearchElement, getQueryViaElement, hasGetQuery} from '../searchElementUtils.js';
import {getSearchTypeObject} from '../searchDispatch.js';

/**
 * @typedef {import('../searchDispatch.js').SearchTypeObject} SearchTypeObject
 */

/**
 * Promise, Literal, catch: pass on children (README) - a promise wraps
 * exactly one value at the same conceptual path (no path segment to add,
 * unlike array's `*`/record's `*key`/`*value`), so this recurses into
 * `.value`'s own search widget and wraps whatever it produces in a
 * `passThrough` leaf (`queryTree.js`) purely so the tree keeps visible that
 * the leaf was reached through a promise, rather than returning the child's
 * leaf bare. ("Literal" needs no module of its own: `getSearchSchemaType`
 * already resolves a `literal` schema straight to its value's own type via
 * `getSchemaType`, e.g. a literal string dispatches to `stringSearchType.js`
 * unchanged).
 * @type {SearchTypeObject}
 */
const promiseSearchType = {
  buildUI ({schemaObject, path, typeNamespace, topRoot, types}) {
    const label = buildPathLabel(schemaObject, path);
    const promiseSchemaObject = /** @type {import('zodexy').SzPromise} */ (
      schemaObject
    );
    const childArr = getSearchTypeObject(promiseSchemaObject.value).buildUI({
      schemaObject: promiseSchemaObject.value,
      path,
      typeNamespace,
      topRoot,
      types
    });
    return ['jsoe-search-promise', {
      dataset: {searchPath: path, searchKind: 'promise'},
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
      ['span', {class: 'searchLabel'}, [`${label} (resolved value)`]],
      childArr
    ]];
  },
  getQuery: getQueryViaElement
};

export default promiseSearchType;
