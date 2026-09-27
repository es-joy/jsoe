import {
  buildPathLabel, findOwnControl, buildOptInFieldset, readOptInChecked, wireOptInFieldset,
  applyOptIn, buildCombinatorSelect, readCombinator, applyCombinator, combinatorOfQuery,
  buildAtLeastOneSentinel, syncAtLeastOneCheck, unwrapAndClauses
} from '../searchUtils.js';
import {combineAnd, combineOr, makeBlobHTMLLeaf} from '../queryTreeBuilders.js';
import {getQueryViaElement, applyQueryViaElement} from '../searchElementUtils.js';
import regexpType from '../../fundamentalTypes/regexpType.js';

/**
 * @typedef {import('../searchDispatch.js').SearchTypeObject} SearchTypeObject
 * @typedef {import('../queryTree.js').QueryBlobHTMLLeaf} QueryBlobHTMLLeaf
 */

const blobHTMLModes = ['cssSelector', 'xpath', 'fullText', 'rawHTMLRegex'];

/**
 * Live syntax-checks a blobHTML facet's own Value against its own mode - a
 * CSS selector and an XPath expression are each tried against a detached,
 * inert target (a fragment for the selector, the live `document` itself,
 * required by `Element.prototype.evaluate`'s own contract, for the XPath -
 * neither actually has to *match* anything, only parse without throwing),
 * and a regex is tried via the same `new RegExp(value, flags)` constructor
 * `readLiteralRegexQuery` relies on elsewhere. "Full text search" has no
 * format to violate, so it never calls this at all.
 * @param {'cssSelector'|'xpath'|'rawHTMLRegex'} mode
 * @param {string} value
 * @param {string} flags
 * @returns {string}
 */
function computeBlobHTMLValueMessage (mode, value, flags) {
  if (!value) {
    return '';
  }
  try {
    if (mode === 'cssSelector') {
      document.createDocumentFragment().querySelector(value);
    } else if (mode === 'xpath') {
      document.evaluate(value, document, null, XPathResult.ANY_TYPE, null);
    } else {
      // eslint-disable-next-line no-new -- Testing
      new RegExp(value, flags);
    }
    return '';
  } catch {
    if (mode === 'cssSelector') {
      return 'Enter a valid CSS selector.';
    }
    return mode === 'xpath'
      ? 'Enter a valid XPath expression.'
      : 'Enter a valid regular expression.';
  }
}

/**
 * Re-runs `computeBlobHTMLValueMessage` for the "CSS selector" facet's own
 * Value, on its own `input`.
 * @param {Element|null} root
 * @returns {void}
 */
function syncCssSelectorValidity (root) {
  /* istanbul ignore if -- Guard: always called from a descendant's own handler */
  if (!root) {
    return;
  }
  const valueEl = /** @type {HTMLInputElement|undefined} */ (
    findOwnControl(root, 'input.jsoeSearchBlobHTMLValue--cssSelector')
  );
  /* istanbul ignore if -- Guard: buildUI always creates this input */
  if (!valueEl) {
    return;
  }
  valueEl.setCustomValidity(computeBlobHTMLValueMessage('cssSelector', valueEl.value, ''));
}

/**
 * Re-runs `computeBlobHTMLValueMessage` for the "XPath" facet's own Value,
 * on its own `input`.
 * @param {Element|null} root
 * @returns {void}
 */
function syncXPathValidity (root) {
  /* istanbul ignore if -- Guard: always called from a descendant's own handler */
  if (!root) {
    return;
  }
  const valueEl = /** @type {HTMLInputElement|undefined} */ (
    findOwnControl(root, 'input.jsoeSearchBlobHTMLValue--xpath')
  );
  /* istanbul ignore if -- Guard: buildUI always creates this input */
  if (!valueEl) {
    return;
  }
  valueEl.setCustomValidity(computeBlobHTMLValueMessage('xpath', valueEl.value, ''));
}

/**
 * Re-runs `computeBlobHTMLValueMessage` for the "Regex search of raw HTML"
 * facet alone - called on `input` on its own Value, and on `change` on its
 * own Flags multi-select (changing flags can itself flip a regex between
 * valid and invalid, e.g. the `u`/`v` flags' stricter escape rules).
 * @param {Element|null} root
 * @returns {void}
 */
function syncRawHTMLRegexValidity (root) {
  /* istanbul ignore if -- Guard: always called from a descendant's own handler */
  if (!root) {
    return;
  }
  const valueEl = /** @type {HTMLInputElement|undefined} */ (
    findOwnControl(root, 'input.jsoeSearchBlobHTMLValue--rawHTMLRegex')
  );
  /* istanbul ignore if -- Guard: buildUI always creates this input */
  if (!valueEl) {
    return;
  }
  const flagsEl = /** @type {HTMLSelectElement|undefined} */ (
    findOwnControl(root, 'select.jsoeSearchBlobHTMLFlags--rawHTMLRegex')
  );
  const flags = [...(flagsEl?.selectedOptions ??
    /* istanbul ignore next -- Guard: buildUI always creates this select */
    [])].map((opt) => opt.value).join('');
  valueEl.setCustomValidity(computeBlobHTMLValueMessage('rawHTMLRegex', valueEl.value, flags));
}

/**
 * Reads one blobHTML facet's own opt-in/Value(/Flags) controls into a leaf,
 * or `undefined` while unchecked or left blank (mirroring
 * `readLiteralRegexQuery`'s own facets: an opted-in-but-empty facet silently
 * contributes nothing, same as elsewhere).
 * @param {Element} root
 * @param {string} path
 * @param {QueryBlobHTMLLeaf['mode']} mode
 * @returns {QueryBlobHTMLLeaf|undefined}
 */
function readBlobHTMLFacet (root, path, mode) {
  if (!readOptInChecked(root, mode)) {
    return undefined;
  }
  const value = /** @type {HTMLInputElement|HTMLTextAreaElement|undefined} */ (
    findOwnControl(
      root, `${mode === 'fullText' ? 'textarea' : 'input'}.jsoeSearchBlobHTMLValue--${mode}`
    )
  )?.value;
  if (!value) {
    return undefined;
  }
  if (mode !== 'rawHTMLRegex') {
    return makeBlobHTMLLeaf(path, mode, value);
  }
  const flagsSelect = /** @type {HTMLSelectElement|undefined} */ (
    findOwnControl(root, 'select.jsoeSearchBlobHTMLFlags--rawHTMLRegex')
  );
  const flags = [...(flagsSelect?.selectedOptions ??
    /* istanbul ignore next -- Guard: buildUI always creates this select */
    [])].map((opt) => opt.value).join('');
  return makeBlobHTMLLeaf(path, mode, value, flags || undefined);
}

/**
 * The inverse of `readBlobHTMLFacet` - restores one facet's own opt-in/
 * Value(/Flags) controls from `clauses` (`unwrapAndClauses`'s own output),
 * bespoke rather than `extractLeafOfKind`/`extractClauseForPath` since all
 * four modes share both `kind: 'blobHTML'` and the same `path`,
 * disambiguated only by each leaf's own `mode`.
 * @param {Element} root
 * @param {import('../queryTree.js').QueryNode[]} clauses
 * @param {string} path
 * @param {QueryBlobHTMLLeaf['mode']} mode
 * @returns {void}
 */
function applyBlobHTMLFacet (root, clauses, path, mode) {
  const matched = /** @type {QueryBlobHTMLLeaf|undefined} */ (
    clauses.find((clause) => 'kind' in clause && clause.kind === 'blobHTML' &&
      clause.path === path && clause.mode === mode)
  );
  applyOptIn(root, matched !== undefined, mode);
  const valueEl = /** @type {HTMLInputElement|HTMLTextAreaElement|undefined} */ (
    findOwnControl(
      root, `${mode === 'fullText' ? 'textarea' : 'input'}.jsoeSearchBlobHTMLValue--${mode}`
    )
  );
  if (valueEl) {
    valueEl.value = matched?.value ?? '';
    valueEl.dispatchEvent(new Event('input'));
  }
  if (mode !== 'rawHTMLRegex') {
    return;
  }
  const flagsEl = /** @type {HTMLSelectElement|undefined} */ (
    findOwnControl(root, 'select.jsoeSearchBlobHTMLFlags--rawHTMLRegex')
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

/**
 * Blob HTML: XPath, CSS selectors, full text search, regex search of raw
 * HTML (README) - four independent `buildOptInFieldset`-wrapped facets
 * (the same "each facet opts itself in" shape as `buildLiteralRegexControls`,
 * `searchUtils.js`, but not built through it: the four modes and the
 * `blobHTML` leaf kind they produce are specific to this one type, with no
 * second caller to share that helper with), sharing one
 * `buildCombinatorSelect` and one `buildAtLeastOneSentinel`. "CSS selector"
 * is listed first as the facet most jsoe users will recognize. The "Full
 * text search" facet's own Value is a `<textarea>` rather than an `<input>`,
 * since a search phrase in a body of text is the one mode actually expected
 * to run to more than one line; both share the same class-name suffix
 * (`--fullText`/etc.), so `readBlobHTMLFacet`/`applyBlobHTMLFacet` only need
 * the mode to tell them apart.
 *
 * Each facet's own opt-in checkbox (`buildOptInFieldset`) now provides all
 * of the enable/disable and "must configure at least one" behavior the old
 * single Mode `<select>` handled imperatively (hidden/required-toggling,
 * `isExemptedByAncestorHasProperty`-checked before reasserting `required`) -
 * none of that is needed anymore, since a disabled `<fieldset>`'s controls
 * are already exempt from constraint validation, and `buildAtLeastOneSentinel`/
 * `syncAtLeastOneCheck` already fold in the same `isExemptedByAncestorHasProperty`
 * relief for the "at least one facet" rule.
 *
 * "Regex search of raw HTML" gets its own Flags multi-select (the same
 * `regexpType.js` `allowedFlags` list `stringSearchType.js`'s literal/regex
 * control passes as `buildLiteralRegexControls`'s `flagOptions`), folded
 * into the `blobHTML` leaf's own `$options` (mirroring `QueryRegexLeaf`'s
 * field of the same name) - and, via `syncRawHTMLRegexValidity`, included
 * when syntax-checking that facet's own Value, since the chosen flags can
 * affect whether a given pattern is actually valid.
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
        connectedCallback () {
          const sync = () => syncAtLeastOneCheck(
            this, () => blobHTMLModes.some((mode) => readOptInChecked(this, mode))
          );
          blobHTMLModes.forEach((mode) => wireOptInFieldset(this, mode, sync));
          sync();
        },
        /** @this {HTMLElement} */
        getQuery () {
          const searchPath = this.dataset.searchPath ??
            /* istanbul ignore next -- Guard: buildUI always sets dataset.searchPath */
            '';
          const leaves = blobHTMLModes.map(
            (mode) => readBlobHTMLFacet(
              this, searchPath, /** @type {QueryBlobHTMLLeaf['mode']} */ (mode)
            )
          );
          const combine = readCombinator(this) === 'or' ? combineOr : combineAnd;
          return combine(leaves);
        },
        /**
         * @this {HTMLElement}
         * @param {import('../queryTree.js').QueryNode|undefined} queryNode
         * @returns {void}
         */
        applyQuery (queryNode) {
          applyCombinator(this, combinatorOfQuery(queryNode));
          const searchPath = this.dataset.searchPath ??
            /* istanbul ignore next -- Guard: buildUI always sets dataset.searchPath */
            '';
          const clauses = unwrapAndClauses(queryNode);
          blobHTMLModes.forEach((mode) => applyBlobHTMLFacet(
            this, clauses, searchPath, /** @type {QueryBlobHTMLLeaf['mode']} */ (mode)
          ));
        }
      }
    }, [
      ['span', {class: 'searchLabel'}, [label]],
      ['label', ['Combine: ', buildCombinatorSelect({name: `${name}-combinator`})]],
      ...buildOptInFieldset({
        name: `${name}-cssSelector`, key: 'cssSelector', label: 'CSS selector',
        children: [['label', [
          'Value: ',
          ['input', {
            type: 'text', name: `${name}-cssSelector-value`,
            class: 'jsoeSearchBlobHTMLValue--cssSelector',
            $on: {
              /** @this {HTMLElement} */
              input () {
                syncCssSelectorValidity(this.closest('jsoe-search-blob-html'));
              }
            }
          }]
        ]]]
      }),
      ...buildOptInFieldset({
        name: `${name}-xpath`, key: 'xpath', label: 'XPath',
        children: [['label', [
          'Value: ',
          ['input', {
            type: 'text', name: `${name}-xpath-value`, class: 'jsoeSearchBlobHTMLValue--xpath',
            $on: {
              /** @this {HTMLElement} */
              input () {
                syncXPathValidity(this.closest('jsoe-search-blob-html'));
              }
            }
          }]
        ]]]
      }),
      ...buildOptInFieldset({
        name: `${name}-fullText`, key: 'fullText', label: 'Full text search',
        children: [['label', [
          'Value: ',
          ['textarea', {name: `${name}-fullText-value`, class: 'jsoeSearchBlobHTMLValue--fullText'}]
        ]]]
      }),
      ...buildOptInFieldset({
        name: `${name}-rawHTMLRegex`, key: 'rawHTMLRegex', label: 'Regex search of raw HTML',
        children: [
          ['label', [
            'Value: ',
            ['input', {
              type: 'text', name: `${name}-rawHTMLRegex-value`,
              class: 'jsoeSearchBlobHTMLValue--rawHTMLRegex',
              $on: {
                /** @this {HTMLElement} */
                input () {
                  syncRawHTMLRegexValidity(this.closest('jsoe-search-blob-html'));
                }
              }
            }]
          ]],
          ['label', [
            'Flags: ',
            ['select', {
              name: `${name}-rawHTMLRegex-flags`, multiple: true,
              class: 'jsoeSearchBlobHTMLFlags--rawHTMLRegex',
              $on: {
                /** @this {HTMLElement} */
                change () {
                  syncRawHTMLRegexValidity(this.closest('jsoe-search-blob-html'));
                }
              }
            }, regexpType.allowedFlags.map((flag) => ['option', {value: flag}, [flag]])]
          ]]
        ]
      }),
      buildAtLeastOneSentinel()
    ]];
  },
  getQuery: getQueryViaElement,
  applyQuery: applyQueryViaElement
};

export default blobHTMLSearchType;
