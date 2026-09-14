import {buildPathLabel, findOwnControl} from '../searchUtils.js';
import {makeBlobHTMLLeaf} from '../queryTreeBuilders.js';
import {getQueryViaElement} from '../searchElementUtils.js';

/**
 * @typedef {import('../searchDispatch.js').SearchTypeObject} SearchTypeObject
 */

/**
 * Blob HTML: XPath, CSS selectors, full text search, regex search of raw
 * HTML (README) - a mode `<select>` plus one value control, the same
 * "pick a mode, give it one value" shape as `buildLiteralRegexControls`
 * (`searchUtils.js`), but not built through it: the four modes and the
 * `blobHTML` leaf kind they produce are specific to this one type, with no
 * second caller to share the helper with. The value control is a single-line
 * `<input>` for XPath/CSS-selector/regex, but swaps to a `<textarea>` for
 * "Full text search" mode alone, since a search phrase in a body of text is
 * the one mode actually expected to run to more than one line - both share
 * the same class, so the mode `<select>`'s `change` handler (and `getQuery`)
 * only need the tag name to tell them apart.
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
          const value = /** @type {HTMLInputElement|HTMLTextAreaElement|undefined} */ (
            mode === 'fullText'
              ? findOwnControl(this, 'textarea.jsoeSearchBlobHTMLValue')
              : findOwnControl(this, 'input.jsoeSearchBlobHTMLValue')
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
        ['select', {
          name: `${name}-mode`,
          class: 'jsoeSearchBlobHTMLMode',
          $on: {
            change () {
              const container = this.closest('jsoe-search-blob-html');
              const input = /** @type {HTMLElement|null|undefined} */ (
                container?.querySelector('input.jsoeSearchBlobHTMLValue')
              );
              const textarea = /** @type {HTMLElement|null|undefined} */ (
                container?.querySelector('textarea.jsoeSearchBlobHTMLValue')
              );
              const isFullText = /** @type {HTMLSelectElement} */ (this).value ===
                'fullText';
              if (input) {
                input.hidden = isFullText;
              }
              if (textarea) {
                textarea.hidden = !isFullText;
              }
            }
          }
        }, [
          ['option', {value: 'xpath'}, ['XPath']],
          ['option', {value: 'cssSelector'}, ['CSS selector']],
          ['option', {value: 'fullText'}, ['Full text search']],
          ['option', {value: 'rawHTMLRegex'}, ['Regex search of raw HTML']]
        ]]
      ]],
      ['label', [
        'Value: ',
        ['input', {type: 'text', name: `${name}-value`, class: 'jsoeSearchBlobHTMLValue'}],
        ['textarea', {
          name: `${name}-value`, class: 'jsoeSearchBlobHTMLValue', hidden: true
        }]
      ]]
    ]];
  },
  getQuery: getQueryViaElement
};

export default blobHTMLSearchType;
