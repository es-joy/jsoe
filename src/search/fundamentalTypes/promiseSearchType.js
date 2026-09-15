import {buildPathLabel, extractLeafOfKind} from '../searchUtils.js';
import {makePassThroughLeaf} from '../queryTreeBuilders.js';
import {
  findSearchElement, getQueryViaElement, hasGetQuery,
  applyQueryViaElement, hasApplyQuery
} from '../searchElementUtils.js';
import {buildSearchWidget} from '../searchDispatch.js';

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
  buildUI ({schemaObject, path, typeNamespace, topRoot, types, originalJSON}) {
    const label = buildPathLabel(schemaObject, path);
    const promiseSchemaObject = /** @type {import('zodexy').SzPromise} */ (
      schemaObject
    );
    const childArr = buildSearchWidget({
      schemaObject: promiseSchemaObject.value,
      path,
      typeNamespace,
      topRoot,
      types,
      originalJSON
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
        },
        /**
         * @this {HTMLElement}
         * @param {import('../queryTree.js').QueryNode|undefined} queryNode
         * @returns {void}
         */
        applyQuery (queryNode) {
          const {matched} = extractLeafOfKind(queryNode, 'passThrough');
          const searchPath = this.dataset.searchPath ?? '';
          const childEl = findSearchElement(this, searchPath);
          if (childEl && hasApplyQuery(childEl)) {
            childEl.applyQuery(matched?.query);
          }
        }
      }
    }, [
      ['span', {class: 'searchLabel'}, [`${label} (resolved value)`]],
      childArr
    ]];
  },
  getQuery: getQueryViaElement,
  applyQuery: applyQueryViaElement
};

export default promiseSearchType;
