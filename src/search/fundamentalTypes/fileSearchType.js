import {buildPathLabel, buildLiteralRegexControls, readLiteralRegexQuery} from '../searchUtils.js';
import {combineAnd} from '../queryTreeBuilders.js';
import {getQueryViaElement} from '../searchElementUtils.js';

/**
 * @typedef {import('../searchDispatch.js').SearchTypeObject} SearchTypeObject
 */

/**
 * File: OR literal or regex search/Does Not contain search (README, grouped
 * with string/StringObject/Blob/regexp-source/symbol-description) - against
 * both the File's `.name` and its `.type` (content/MIME type, the same
 * facet `blobSearchType.js` targets for `Blob`), each a value-level facet
 * the schema itself carries no constraint for (`SzFile` only has
 * `min`/`max`/`mime`, and `mime` is a fixed *allow-list* for validation, not
 * a per-instance value to search against). `name`/`type` sub-paths
 * distinguish the two facets (`${path}/name`, `${path}/type`, matching the
 * real `File` property each reads back), the same convention
 * `errorSearchType.js` uses for its own multiple flat facets, combined via
 * `$and`. `SzFile`'s own `min`/`max` (byte size) is left for a later pass -
 * the README's literal/regex bullet doesn't ask for a size range here, and
 * README explicitly reserves that shape of control ("OR Range/Is Not
 * Range") for `buffersource` instead. `filelistSearchType.js` recurses its
 * element schema through this same module, so a `FileList`'s per-file
 * search gets both facets for free.
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
          const searchPath = this.dataset.searchPath ?? '';
          const nameLeaf = readLiteralRegexQuery(this, `${searchPath}/name`, 'name');
          const typeLeaf = readLiteralRegexQuery(this, `${searchPath}/type`, 'type');
          return combineAnd([nameLeaf, typeLeaf]);
        }
      }
    }, [
      ['span', {class: 'searchLabel'}, [label]],
      ['div', {class: 'searchFileName'}, [
        ['span', ['Name: ']],
        buildLiteralRegexControls({name: `${name}-name`, key: 'name'})
      ]],
      ['div', {class: 'searchFileType'}, [
        ['span', ['Content type: ']],
        buildLiteralRegexControls({name: `${name}-type`, key: 'type'})
      ]]
    ]];
  },
  getQuery: getQueryViaElement
};

export default fileSearchType;
