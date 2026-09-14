import {
  buildPathLabel, buildLiteralRegexControls, readLiteralRegexQuery,
  buildMultiSelect, readMultiSelect, findOwnControl
} from '../searchUtils.js';
import {makeMultiSelectLeaf, combineAnd} from '../queryTreeBuilders.js';
import {getQueryViaElement} from '../searchElementUtils.js';
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
 * while the source's own Mode is "Matches regex" - searching a source
 * literal/substring while also constraining flags is a much rarer
 * combination, and hiding Flags the rest of the time keeps the common case
 * uncluttered.
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
        getQuery () {
          const searchPath = this.dataset.searchPath ?? '';
          const sourceLeaf = readLiteralRegexQuery(this, searchPath);
          const mode = /** @type {HTMLSelectElement|undefined} */ (
            findOwnControl(this, 'select.jsoeSearchMode--')
          )?.value;
          const selectedFlags = mode === 'regex' ? readMultiSelect(this) : [];
          const flagsLeaf = selectedFlags.length
            ? makeMultiSelectLeaf(searchPath, {$in: selectedFlags})
            : undefined;
          return combineAnd([sourceLeaf, flagsLeaf]);
        }
      }
    }, [
      ['span', {class: 'searchLabel'}, [`${label} (source)`]],
      buildLiteralRegexControls({
        name,
        /** @this {HTMLElement} */
        onModeChange () {
          const flagsLabel = this.closest('jsoe-search-regexp')?.querySelector(
            '.searchRegexpFlags'
          );
          if (flagsLabel) {
            /** @type {HTMLElement} */ (flagsLabel).hidden =
              /** @type {HTMLSelectElement} */ (this).value !== 'regex';
          }
        }
      }),
      ['label', {class: 'searchRegexpFlags', hidden: true}, [
        'Flags: ',
        buildMultiSelect({name: `${name}-flags`, options: regexpType.allowedFlags})
      ]]
    ]];
  },
  getQuery: getQueryViaElement
};

export default regexpSearchType;
