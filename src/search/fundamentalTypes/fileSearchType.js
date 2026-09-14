import {
  buildPathLabel, buildLiteralRegexControls, readLiteralRegexQuery,
  buildOptInFieldset, readOptInChecked, wireOptInFieldset,
  buildAtLeastOneSentinel, syncAtLeastOneCheck
} from '../searchUtils.js';
import {combineAnd} from '../queryTreeBuilders.js';
import {getQueryViaElement} from '../searchElementUtils.js';

/**
 * @typedef {import('../searchDispatch.js').SearchTypeObject} SearchTypeObject
 */

/**
 * @param {Element} root - a `jsoe-search-file` element
 * @returns {void}
 */
function syncFileValidity (root) {
  syncAtLeastOneCheck(
    root, () => readOptInChecked(root, 'name') || readOptInChecked(root, 'type')
  );
}

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
 * `$and`. Each facet is independently opt-in (`buildOptInFieldset`, so
 * checking against just the name, or just the content type, is as easy as
 * checking against both), but leaving *both* unopted-in is itself invalid
 * (`buildAtLeastOneSentinel`) - the same "key or value, not necessarily
 * both" shape `mapSearchType.js`/`recordSearchType.js` use. `SzFile`'s own
 * `min`/`max` (byte size) is left for a later pass - the README's literal/
 * regex bullet doesn't ask for a size range here, and README explicitly
 * reserves that shape of control ("OR Range/Is Not Range") for
 * `buffersource` instead. `filelistSearchType.js` recurses its element
 * schema through this same module, so a `FileList`'s per-file search gets
 * both facets for free.
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
        connectedCallback () {
          wireOptInFieldset(this, 'name', () => syncFileValidity(this));
          wireOptInFieldset(this, 'type', () => syncFileValidity(this));
          syncFileValidity(this);
        },
        /** @this {HTMLElement} */
        getQuery () {
          const searchPath = this.dataset.searchPath ?? '';
          const nameLeaf = readOptInChecked(this, 'name')
            ? readLiteralRegexQuery(this, `${searchPath}/name`, 'name')
            : undefined;
          const typeLeaf = readOptInChecked(this, 'type')
            ? readLiteralRegexQuery(this, `${searchPath}/type`, 'type')
            : undefined;
          return combineAnd([nameLeaf, typeLeaf]);
        }
      }
    }, [
      ['span', {class: 'searchLabel'}, [label]],
      ...buildOptInFieldset({
        name: `${name}-name`, key: 'name', label: 'Name',
        children: [buildLiteralRegexControls({name: `${name}-name`, key: 'name'})]
      }),
      ...buildOptInFieldset({
        name: `${name}-type`, key: 'type', label: 'Content type',
        children: [buildLiteralRegexControls({name: `${name}-type`, key: 'type'})]
      }),
      buildAtLeastOneSentinel()
    ]];
  },
  getQuery: getQueryViaElement
};

export default fileSearchType;
