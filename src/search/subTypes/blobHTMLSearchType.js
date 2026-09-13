import {buildPathLabel, findOwnControl} from '../searchUtils.js';
import {makeBlobHTMLLeaf} from '../queryTreeBuilders.js';
import {getQueryViaElement} from '../searchElementUtils.js';

/**
 * @typedef {import('../searchDispatch.js').SearchTypeObject} SearchTypeObject
 */

/**
 * Blob HTML: XPath, CSS selectors, full text search, regex search of raw
 * HTML (README) - a mode `<select>` plus one text `<input>`, the same
 * "pick a mode, give it one value" shape as `buildLiteralRegexControls`
 * (`searchUtils.js`), but not built through it: the four modes and the
 * `blobHTML` leaf kind they produce are specific to this one type, with no
 * second caller to share the helper with.
 * @type {SearchTypeObject}
 */
const blobHTMLSearchType = {
  buildUI ({schemaObject, path, typeNamespace}) {
    const label = buildPathLabel(schemaObject, path);
    const name = `${typeNamespace}-blobHTML`;
    return ['jsoe-search-blob-html', {
      dataset: {searchPath: path, searchKind: 'blobHTML'},
      title: label,
      $define: {
        /** @this {HTMLElement} */
        getQuery () {
          const searchPath = this.dataset.searchPath ?? '';
          const mode = /** @type {HTMLSelectElement|undefined} */ (
            findOwnControl(this, 'select.jsoeSearchBlobHTMLMode')
          )?.value;
          const value = /** @type {HTMLInputElement|undefined} */ (
            findOwnControl(this, 'input.jsoeSearchBlobHTMLValue')
          )?.value;
          if (!value || !mode) {
            return undefined;
          }
          return makeBlobHTMLLeaf(
            searchPath,
            /** @type {import('../queryTree.js').QueryBlobHTMLLeaf['mode']} */ (mode),
            value
          );
        }
      }
    }, [
      ['span', {class: 'searchLabel'}, [label]],
      ['label', [
        'Mode: ',
        ['select', {name: `${name}-mode`, class: 'jsoeSearchBlobHTMLMode'}, [
          ['option', {value: 'xpath'}, ['XPath']],
          ['option', {value: 'cssSelector'}, ['CSS selector']],
          ['option', {value: 'fullText'}, ['Full text search']],
          ['option', {value: 'rawHTMLRegex'}, ['Regex search of raw HTML']]
        ]]
      ]],
      ['label', [
        'Value: ',
        ['input', {type: 'text', name: `${name}-value`, class: 'jsoeSearchBlobHTMLValue'}]
      ]]
    ]];
  },
  getQuery: getQueryViaElement
};

export default blobHTMLSearchType;
