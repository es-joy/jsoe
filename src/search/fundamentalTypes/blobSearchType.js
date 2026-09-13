import {buildPathLabel, buildLiteralRegexControls, readLiteralRegexQuery} from '../searchUtils.js';
import {getQueryViaElement} from '../searchElementUtils.js';

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
          return readLiteralRegexQuery(this, this.dataset.searchPath ?? '');
        }
      }
    }, [
      ['span', {class: 'searchLabel'}, [`${label} (MIME type)`]],
      buildLiteralRegexControls({name})
    ]];
  },
  getQuery: getQueryViaElement
};

export default blobSearchType;
