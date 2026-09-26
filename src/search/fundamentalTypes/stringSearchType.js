import {
  buildPathLabel, buildLiteralRegexControls, readLiteralRegexQuery, applyLiteralRegexQuery
} from '../searchUtils.js';
import {getQueryViaElement, applyQueryViaElement} from '../searchElementUtils.js';
import regexpType from '../../fundamentalTypes/regexpType.js';

/**
 * @typedef {import('../searchDispatch.js').SearchTypeObject} SearchTypeObject
 */

/**
 * OR literal or regex search/Does Not contain search (README; also covers
 * `StringObject` and `templateLiteral`, aliased to this same module in
 * `searchDispatch.js` since the query semantics are identical), plus - only
 * while "Matches regex" is the chosen mode - a Flags multi-select
 * (`buildLiteralRegexControls`'s `flagOptions`, `regexpType.js`'s own
 * `allowedFlags` list reused as-is, matching `regexpSearchType.js`'s flags
 * for the actual regexp's own flags): unlike `regexpSearchType.js`, whose
 * "source" is already a real regexp with its own flags regardless of
 * search mode, here the regex is only ever the search's *own* device for
 * matching the string, so flags only make sense while that regex is
 * actually in play.
 * @type {SearchTypeObject}
 */
const stringSearchType = {
  buildUI ({schemaObject, path, typeNamespace}) {
    const label = buildPathLabel(schemaObject, path);
    const name = `${typeNamespace}-string`;
    return ['jsoe-search-string', {
      dataset: {searchPath: path, searchKind: 'string'},
      title: label,
      $define: {
        /** @this {HTMLElement} */
        getQuery () {
          return readLiteralRegexQuery(this, this.dataset.searchPath ??
            /* istanbul ignore next -- Guard: buildUI always sets dataset.searchPath */
            '');
        },
        /**
         * `getQuery` returns a bare leaf here (no other facet to combine it
         * with via `$and`), so `queryNode` normally already is one -
         * unwrapping a trivial one-element `$and` too just tolerates a
         * hand-edited raw query that wraps it anyway.
         * @this {HTMLElement}
         * @param {import('../queryTree.js').QueryNode|undefined} queryNode
         * @returns {void}
         */
        applyQuery (queryNode) {
          const leaf = queryNode && '$and' in queryNode
            ? /* istanbul ignore next -- Guard: hand-edited-raw-query-only */ queryNode.$and[0]
            : queryNode;
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
      ['span', {class: 'searchLabel'}, [label]],
      buildLiteralRegexControls({name, flagOptions: regexpType.allowedFlags})
    ]];
  },
  getQuery: getQueryViaElement,
  applyQuery: applyQueryViaElement
};

export default stringSearchType;
