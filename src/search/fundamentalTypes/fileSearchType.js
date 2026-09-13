import {buildPathLabel, buildLiteralRegexControls, readLiteralRegexQuery} from '../searchUtils.js';
import {getQueryViaElement} from '../searchElementUtils.js';

/**
 * @typedef {import('../searchDispatch.js').SearchTypeObject} SearchTypeObject
 */

/**
 * File: OR literal or regex search/Does Not contain search (README, grouped
 * with string/StringObject/Blob/regexp-source/symbol-description) - against
 * the File's `.name`, a value-level facet the schema itself carries no
 * constraint for (`SzFile` only has `min`/`max`/`mime`), the same way
 * `symbolSearchType.js` targets `.description` rather than anything the
 * schema declares. `SzFile`'s own `min`/`max` (byte size) is left for a
 * later pass - the README's literal/regex bullet doesn't ask for a size
 * range here, and README explicitly reserves that shape of control
 * ("OR Range/Is Not Range") for `buffersource` instead.
 * @type {SearchTypeObject}
 */
const fileSearchType = {
  buildUI ({schemaObject, path, typeNamespace}) {
    const label = buildPathLabel(schemaObject, path);
    const name = `${typeNamespace}-file`;
    return ['jsoe-search-file', {
      dataset: {searchPath: path, searchKind: 'file'},
      title: label,
      $define: {
        /** @this {HTMLElement} */
        getQuery () {
          return readLiteralRegexQuery(this, this.dataset.searchPath ?? '');
        }
      }
    }, [
      ['span', {class: 'searchLabel'}, [`${label} (name)`]],
      buildLiteralRegexControls({name})
    ]];
  },
  getQuery: getQueryViaElement
};

export default fileSearchType;
