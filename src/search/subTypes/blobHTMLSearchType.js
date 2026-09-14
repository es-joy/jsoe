import {
  buildPathLabel, findOwnControl, isExemptedByAncestorHasProperty
} from '../searchUtils.js';
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
 * only need the tag name to tell them apart. Only the currently-visible one
 * of the pair is ever `required` (toggled alongside `hidden` by the mode
 * `change` handler): a `required` field that's merely hidden, rather than
 * also un-required, still blocks the form's validity even though the user
 * has no way to see or fill it.
 *
 * The `change` handler also checks `isExemptedByAncestorHasProperty` before
 * (re-)asserting `required` on the now-visible control: nested as an
 * optional object property's own child widget, an enclosing "Has property"
 * already provides a complete constraint on its own (the same relief
 * `setDescendantsRequired` gives other `required`-attribute controls), but
 * that relief is a one-time toggle applied *before* `revalidateDescendants`
 * re-dispatches a synthetic `change` on this very `<select>` - without this
 * check, that synthetic event would immediately reassert `required` on
 * whichever control the current mode makes visible, undoing the exemption
 * `setDescendantsRequired` had just granted.
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
            findOwnControl(
              this,
              `${mode === 'fullText' ? 'textarea' : 'input'}.jsoeSearchBlobHTMLValue`
            )
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
              const input = /** @type {HTMLInputElement|null|undefined} */ (
                container?.querySelector('input.jsoeSearchBlobHTMLValue')
              );
              const textarea = /** @type {HTMLTextAreaElement|null|undefined} */ (
                container?.querySelector('textarea.jsoeSearchBlobHTMLValue')
              );
              const isFullText = /** @type {HTMLSelectElement} */ (this).value ===
                'fullText';
              const exempted = container !== null &&
                isExemptedByAncestorHasProperty(container);
              if (input) {
                input.hidden = isFullText;
                input.required = !isFullText && !exempted;
              }
              if (textarea) {
                textarea.hidden = !isFullText;
                textarea.required = isFullText && !exempted;
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
        ['input', {
          type: 'text', name: `${name}-value`, class: 'jsoeSearchBlobHTMLValue',
          required: true
        }],
        ['textarea', {
          name: `${name}-value`, class: 'jsoeSearchBlobHTMLValue', hidden: true
        }]
      ]]
    ]];
  },
  getQuery: getQueryViaElement
};

export default blobHTMLSearchType;
