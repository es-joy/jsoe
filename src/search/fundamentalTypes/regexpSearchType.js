import {
  buildPathLabel, buildLiteralRegexControls, readLiteralRegexQuery, applyLiteralRegexQuery,
  wireLiteralRegexControls, readOptInChecked,
  buildMultiSelect, readMultiSelect, applyMultiSelect, extractLeafOfKind,
  buildCombinatorSelect, readCombinator, applyCombinator, combinatorOfQuery
} from '../searchUtils.js';
import {combineAnd, combineOr, makeMultiSelectLeaf} from '../queryTreeBuilders.js';
import {getQueryViaElement, applyQueryViaElement} from '../searchElementUtils.js';
import regexpType from '../../fundamentalTypes/regexpType.js';

/**
 * @typedef {import('../searchDispatch.js').SearchTypeObject} SearchTypeObject
 */

/**
 * Regexp (source): OR literal or regex search/Does Not contain search, plus
 * a multiple-select search of flags (README). `regexpType.js`'s own
 * `allowedFlags` list is imported as-is for the flags control (search plan
 * §4 - already a plain exported property, no extraction needed). Flags are
 * a property of the regexp itself, not of how its source is being matched,
 * but the Flags control is only shown (and only contributes to the query)
 * while the source's own Regex facet is opted into - searching a source
 * literal/substring while also constraining flags is a much rarer
 * combination, and hiding Flags the rest of the time keeps the common case
 * uncluttered.
 *
 * Two independent combinators live on this one widget, needing distinct
 * keys to avoid colliding (both would otherwise default to `''`): the
 * source facet's own internal literal/regex/notContains combinator
 * (`buildLiteralRegexControls`'s own default key) and this widget's own
 * source-vs-flags combinator (key `'sourceFlags'`, below).
 * @type {SearchTypeObject}
 */
const regexpSearchType = {
  buildUI ({schemaObject, path, typeNamespace}) {
    const label = buildPathLabel(schemaObject, path);
    const name = `${typeNamespace}-regexp`;
    return ['jsoe-search-regexp', {
      dataset: {searchPath: path, searchKind: 'regexp'},
      title: label,
      $define: {
        /** @this {HTMLElement} */
        connectedCallback () {
          /**
           * @this {HTMLInputElement}
           * @returns {void}
           */
          function syncFlagsVisibility () {
            const flagsLabel = this.closest('jsoe-search-regexp')?.querySelector(
              '.searchRegexpFlags'
            );
            if (flagsLabel) {
              /** @type {HTMLElement} */ (flagsLabel).hidden = !this.checked;
            }
          }
          wireLiteralRegexControls(this, '', syncFlagsVisibility);
        },
        /** @this {HTMLElement} */
        getQuery () {
          const searchPath = this.dataset.searchPath ??
            /* istanbul ignore next -- Guard: buildUI always sets dataset.searchPath */
            '';
          const sourceLeaf = readLiteralRegexQuery(this, searchPath);
          const selectedFlags = readOptInChecked(this, 'Regex') ? readMultiSelect(this) : [];
          const flagsLeaf = selectedFlags.length
            ? makeMultiSelectLeaf(searchPath, {$in: selectedFlags})
            : undefined;
          const combine = readCombinator(this, 'sourceFlags') === 'or' ? combineOr : combineAnd;
          return combine([sourceLeaf, flagsLeaf]);
        },
        /**
         * @this {HTMLElement}
         * @param {import('../queryTree.js').QueryNode|undefined} queryNode
         * @returns {void}
         */
        applyQuery (queryNode) {
          applyCombinator(this, combinatorOfQuery(queryNode), 'sourceFlags');
          const {matched: flagsLeaf, rest: sourceQuery} = extractLeafOfKind(queryNode, 'multiSelect');
          // Sets the source facets first (dispatching each opt-in checkbox's
          // own `change`, which also toggles the Flags multi-select's own
          // `hidden` state via this widget's `syncFlagsVisibility`), then
          // Flags.
          applyLiteralRegexQuery(this, sourceQuery);
          applyMultiSelect(this, flagsLeaf?.$in ?? []);
        }
      }
    }, [
      ['span', {class: 'searchLabel'}, [`${label} (source)`]],
      ['label', [
        'Combine: ', buildCombinatorSelect({name: `${name}-combinator`, key: 'sourceFlags'})
      ]],
      buildLiteralRegexControls({name}),
      ['label', {class: 'searchRegexpFlags', hidden: true}, [
        'Flags: ',
        buildMultiSelect({name: `${name}-flags`, options: regexpType.allowedFlags})
      ]]
    ]];
  },
  getQuery: getQueryViaElement,
  applyQuery: applyQueryViaElement
};

export default regexpSearchType;
