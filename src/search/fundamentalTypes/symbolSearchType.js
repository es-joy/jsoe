import {buildPathLabel, buildLiteralRegexControls, readLiteralRegexQuery} from '../searchUtils.js';
import {getQueryViaElement} from '../searchElementUtils.js';
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
        }
      }
    }, [
      ['span', {class: 'searchLabel'}, [`${label} (description)`]],
      buildLiteralRegexControls({name, flagOptions: regexpType.allowedFlags})
    ]];
  },
  getQuery: getQueryViaElement
};

export default symbolSearchType;
