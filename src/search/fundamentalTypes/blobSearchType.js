import {
  buildPathLabel, buildLiteralRegexControls, readLiteralRegexQuery, applyLiteralRegexQuery
} from '../searchUtils.js';
import {getQueryViaElement, applyQueryViaElement} from '../searchElementUtils.js';
import regexpType from '../../fundamentalTypes/regexpType.js';

/**
 * @typedef {import('../searchDispatch.js').SearchTypeObject} SearchTypeObject
 */

/**
 * Blob: OR literal or regex search/Does Not contain search (README, grouped
 * with string/StringObject/File/regexp-source/symbol-description) - against
 * the Blob's `.type` (MIME string), a value-level facet the schema itself
 * carries no constraint for (`blob` is one of jsoe's "checked" types,
 * `{type: 'any', checks: [{name: 'blob'}]}`, with no further structural
 * fields to read), the same way `symbolSearchType.js` targets
 * `.description`. Matching *content* rather than the MIME type belongs to
 * `blobHTMLSearchType.js` (XPath/CSS-selector/full-text/raw-HTML-regex,
 * README) for the Blob-as-HTML case specifically, not this generic module.
 * @type {SearchTypeObject}
 */
const blobSearchType = {
  buildUI ({schemaObject, path, typeNamespace}) {
    const label = buildPathLabel(schemaObject, path);
    const name = `${typeNamespace}-blob`;
    return ['jsoe-search-blob', {
      dataset: {searchPath: path, searchKind: 'blob'},
      title: label,
      $define: {
        /** @this {HTMLElement} */
        getQuery () {
          return readLiteralRegexQuery(this, this.dataset.searchPath ??
            /* istanbul ignore next -- Guard: buildUI always sets dataset.searchPath */
            '');
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
      ['span', {class: 'searchLabel'}, [`${label} (MIME type)`]],
      buildLiteralRegexControls({name, flagOptions: regexpType.allowedFlags})
    ]];
  },
  getQuery: getQueryViaElement,
  applyQuery: applyQueryViaElement
};

export default blobSearchType;
