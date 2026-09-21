import {
  buildPathLabel, findOwnControl, isExemptedByAncestorHasProperty, extractLeafOfKind
} from '../searchUtils.js';
import {makeBlobHTMLLeaf} from '../queryTreeBuilders.js';
import {getQueryViaElement, applyQueryViaElement} from '../searchElementUtils.js';
import regexpType from '../../fundamentalTypes/regexpType.js';

/**
 * @typedef {import('../searchDispatch.js').SearchTypeObject} SearchTypeObject
 */

/**
 * Live syntax-checks a blobHTML Value against its currently-chosen Mode -
 * a CSS selector and an XPath expression are each tried against a detached,
 * inert target (a fragment for the selector, the live `document` itself,
 * required by `Element.prototype.evaluate`'s own contract, for the XPath -
 * neither actually has to *match* anything, only parse without throwing),
 * and a regex is tried via the same `new RegExp(value, flags)` constructor
 * `readLiteralRegexQuery` relies on elsewhere - a "Full text search" value
 * is a plain phrase with no format to violate, so it always passes.
 * @param {string} mode
 * @param {string} value
 * @param {string} flags
 * @returns {string}
 */
function computeBlobHTMLValueMessage (mode, value, flags) {
  if (!value) {
    return '';
  }
  try {
    switch (mode) {
    case 'cssSelector':
      document.createDocumentFragment().querySelector(value);
      break;
    case 'xpath':
      document.evaluate(value, document, null, XPathResult.ANY_TYPE, null);
      break;
    case 'rawHTMLRegex':
      // eslint-disable-next-line no-new -- Testing
      new RegExp(value, flags);
      break;
    default:
      break;
    }
    return '';
  } catch {
    switch (mode) {
    case 'cssSelector':
      return 'Enter a valid CSS selector.';
    case 'xpath':
      return 'Enter a valid XPath expression.';
    case 'rawHTMLRegex':
      return 'Enter a valid regular expression.';
    /* istanbul ignore next -- Guard: an unknown mode's try-block never throws */
    default:
      return '';
    }
  }
}

/**
 * Re-runs `computeBlobHTMLValueMessage` against whichever of the input/
 * textarea pair the current Mode makes active, clearing the other one's
 * custom validity (a hidden-but-still-`required` control would otherwise
 * keep blocking the form, the same reasoning `buildUI`'s own doc gives for
 * toggling `required` alongside `hidden`) - call on every `input` on either
 * value control, `change` on the Mode `<select>`, and `change` on the Flags
 * multi-select (changing flags can itself flip a regex between valid and
 * invalid, e.g. the `u`/`v` flags' stricter escape rules).
 * @param {Element|null} container
 * @returns {void}
 */
function syncBlobHTMLValueValidity (container) {
  /* istanbul ignore if -- Guard: always called from a descendant's own handler */
  if (!container) {
    return;
  }
  const mode = /** @type {HTMLSelectElement|undefined} */ (
    findOwnControl(container, 'select.jsoeSearchBlobHTMLMode')
  )?.value ?? '';
  const input = /** @type {HTMLInputElement|undefined} */ (
    findOwnControl(container, 'input.jsoeSearchBlobHTMLValue')
  );
  const textarea = /** @type {HTMLTextAreaElement|undefined} */ (
    findOwnControl(container, 'textarea.jsoeSearchBlobHTMLValue')
  );
  const flagsSelect = /** @type {HTMLSelectElement|undefined} */ (
    findOwnControl(container, 'select.jsoeSearchBlobHTMLFlags')
  );
  const flags = mode === 'rawHTMLRegex'
    ? [...(flagsSelect?.selectedOptions ?? [])].map((opt) => opt.value).join('')
    : '';
  const active = mode === 'fullText' ? textarea : input;
  if (input && input !== active) {
    input.setCustomValidity('');
  }
  if (textarea && textarea !== active) {
    textarea.setCustomValidity('');
  }
  if (active) {
    active.setCustomValidity(computeBlobHTMLValueMessage(mode, active.value, flags));
  }
}

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
 * has no way to see or fill it. "CSS selector" is listed ahead of "XPath"
 * (and is the default mode) as the option most jsoe users will recognize.
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
 *
 * "Regex search of raw HTML" gets its own Flags multi-select (the same
 * `regexpType.js` `allowedFlags` list `stringSearchType.js`'s literal/regex
 * control passes as `buildLiteralRegexControls`'s `flagOptions`), shown only
 * while that mode is chosen, folded into the `blobHTML` leaf's own
 * `$options` (mirroring `QueryRegexLeaf`'s field of the same name) - and,
 * via `syncBlobHTMLValueValidity`, included when syntax-checking the Value
 * itself, since the chosen flags can affect whether a given pattern is
 * actually valid.
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
          const flags = mode === 'rawHTMLRegex'
            ? [...(/** @type {HTMLSelectElement|undefined} */ (
              findOwnControl(this, 'select.jsoeSearchBlobHTMLFlags')
            )?.selectedOptions ?? [])].map((opt) => opt.value).join('')
            : '';
          return makeBlobHTMLLeaf(
            searchPath,
            /** @type {import('../queryTree.js').QueryBlobHTMLLeaf['mode']} */ (mode),
            value,
            flags || undefined
          );
        },
        /**
         * @this {HTMLElement}
         * @param {import('../queryTree.js').QueryNode|undefined} queryNode
         * @returns {void}
         */
        applyQuery (queryNode) {
          const {matched} = extractLeafOfKind(queryNode, 'blobHTML');
          const modeEl = /** @type {HTMLSelectElement|undefined} */ (
            findOwnControl(this, 'select.jsoeSearchBlobHTMLMode')
          );
          /* istanbul ignore if -- Guard: buildUI always creates this select */
          if (!modeEl) {
            return;
          }
          const mode = matched?.mode ?? 'cssSelector';
          modeEl.value = mode;
          // Dispatching `change` runs the Mode `<select>`'s own handler
          // first, which shows/hides the correct Value control and the
          // Flags label before either is touched below.
          modeEl.dispatchEvent(new Event('change'));
          const activeEl = /** @type {HTMLInputElement|HTMLTextAreaElement|undefined} */ (
            findOwnControl(
              this, `${mode === 'fullText' ? 'textarea' : 'input'}.jsoeSearchBlobHTMLValue`
            )
          );
          if (activeEl) {
            activeEl.value = matched?.value ?? '';
            activeEl.dispatchEvent(new Event('input'));
          }
          const flagsEl = /** @type {HTMLSelectElement|undefined} */ (
            findOwnControl(this, 'select.jsoeSearchBlobHTMLFlags')
          );
          /* istanbul ignore if -- Guard: buildUI always creates this select */
          if (!flagsEl) {
            return;
          }

          const flagChars = new Set((matched?.$options ?? '').split(''));
          [...flagsEl.options].forEach((opt) => {
            opt.selected = flagChars.has(opt.value);
          });
          flagsEl.dispatchEvent(new Event('change'));
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
              const flagsLabel = /** @type {HTMLElement|null|undefined} */ (
                container?.querySelector('.jsoeSearchBlobHTMLFlagsLabel')
              );
              const mode = /** @type {HTMLSelectElement} */ (this).value;
              const isFullText = mode === 'fullText';
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
              if (flagsLabel) {
                flagsLabel.hidden = mode !== 'rawHTMLRegex';
              }
              syncBlobHTMLValueValidity(container);
            }
          }
        }, [
          ['option', {value: 'cssSelector'}, ['CSS selector']],
          ['option', {value: 'xpath'}, ['XPath']],
          ['option', {value: 'fullText'}, ['Full text search']],
          ['option', {value: 'rawHTMLRegex'}, ['Regex search of raw HTML']]
        ]]
      ]],
      ['label', [
        'Value: ',
        ['input', {
          type: 'text', name: `${name}-value`, class: 'jsoeSearchBlobHTMLValue',
          required: true,
          $on: {
            input () {
              syncBlobHTMLValueValidity(this.closest('jsoe-search-blob-html'));
            }
          }
        }],
        ['textarea', {
          name: `${name}-value`, class: 'jsoeSearchBlobHTMLValue', hidden: true,
          $on: {
            input () {
              syncBlobHTMLValueValidity(this.closest('jsoe-search-blob-html'));
            }
          }
        }]
      ]],
      ['label', {class: 'jsoeSearchBlobHTMLFlagsLabel', hidden: true}, [
        'Flags: ',
        ['select', {
          name: `${name}-flags`, multiple: true, class: 'jsoeSearchBlobHTMLFlags',
          $on: {
            change () {
              syncBlobHTMLValueValidity(this.closest('jsoe-search-blob-html'));
            }
          }
        }, regexpType.allowedFlags.map((flag) => ['option', {value: flag}, [flag]])]
      ]]
    ]];
  },
  getQuery: getQueryViaElement,
  applyQuery: applyQueryViaElement
};

export default blobHTMLSearchType;
