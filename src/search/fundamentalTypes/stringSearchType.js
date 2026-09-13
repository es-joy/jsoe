import {buildPathLabel, buildLiteralRegexControls, readLiteralRegexQuery} from '../searchUtils.js';
import {getQueryViaElement} from '../searchElementUtils.js';

/**
 * @typedef {import('../searchDispatch.js').SearchTypeObject} SearchTypeObject
 */

/**
 * OR literal or regex search/Does Not contain search (README; also covers
 * `StringObject` and `templateLiteral`, aliased to this same module in
 * `searchDispatch.js` since the query semantics are identical).
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
          return readLiteralRegexQuery(this, this.dataset.searchPath ?? '');
        }
      }
    }, [
      ['span', {class: 'searchLabel'}, [label]],
      buildLiteralRegexControls({name})
    ]];
  },
  getQuery: getQueryViaElement
};

export default stringSearchType;
