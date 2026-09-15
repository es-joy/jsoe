import {
  buildPathLabel, buildLiteralRegexControls, readLiteralRegexQuery, applyLiteralRegexQuery
} from '../searchUtils.js';
import {getQueryViaElement, applyQueryViaElement} from '../searchElementUtils.js';
import regexpType from '../../fundamentalTypes/regexpType.js';

/**
 * @typedef {import('../searchDispatch.js').SearchTypeObject} SearchTypeObject
 */

/**
 * Symbol (description): OR literal or regex search/Does Not contain search
 * (README) - the same query semantics as `stringSearchType.js`'s, against
 * the symbol's description rather than a string value, so it gets its own
 * dedicated module/tag (matching the value-editing side's one-file-per-
 * fundamental-type convention) while sharing that module's actual control
 * building/reading via `searchUtils.js`.
 * @type {SearchTypeObject}
 */
const symbolSearchType = {
  buildUI ({schemaObject, path, typeNamespace}) {
    const label = buildPathLabel(schemaObject, path);
    const name = `${typeNamespace}-symbol`;
    return ['jsoe-search-symbol', {
      dataset: {searchPath: path, searchKind: 'symbol'},
      title: label,
      $define: {
        /** @this {HTMLElement} */
        getQuery () {
          return readLiteralRegexQuery(this, this.dataset.searchPath ?? '');
        },
        /**
         * @this {HTMLElement}
         * @param {import('../queryTree.js').QueryNode|undefined} queryNode
         * @returns {void}
         */
        applyQuery (queryNode) {
          const leaf = queryNode && '$and' in queryNode ? queryNode.$and[0] : queryNode;
          applyLiteralRegexQuery(
            this,
            /**
             * @type {import('../queryTree.js').QueryLiteralSetLeaf|
             *import('../queryTree.js').QueryRegexLeaf|
              import('../queryTree.js').QueryNotContainsLeaf|undefined} */ (leaf)
          );
        }
      }
    }, [
      ['span', {class: 'searchLabel'}, [`${label} (description)`]],
      buildLiteralRegexControls({name, flagOptions: regexpType.allowedFlags})
    ]];
  },
  getQuery: getQueryViaElement,
  applyQuery: applyQueryViaElement
};

export default symbolSearchType;
