import {buildPathLabel, buildLiteralRegexControls, readLiteralRegexQuery, buildMultiSelect} from '../searchUtils.js';
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
 * §4 - already a plain exported property, no extraction needed).
 * @type {SearchTypeObject}
 */
const regexpSearchType = {
  buildUI ({schemaObject, path, typeNamespace}) {
    const label = buildPathLabel(schemaObject, path);
    const name = `${typeNamespace}-regexp`;
    const flagsName = `${name}-flags`;
    return ['jsoe-search-regexp', {
      dataset: {searchPath: path, searchKind: 'regexp'},
      title: label,
      $define: {
        /** @this {HTMLElement} */
        getQuery () {
          const searchPath = this.dataset.searchPath ?? '';
          const sourceLeaf = readLiteralRegexQuery(this, {name, path: searchPath});
          const select = /** @type {HTMLSelectElement|null} */ (
            this.querySelector(`select[name="${CSS.escape(flagsName)}"]`)
          );
          const selectedFlags = [...(select?.selectedOptions ?? [])].map(
            (opt) => opt.value
          );
          const flagsLeaf = selectedFlags.length
            ? makeMultiSelectLeaf(searchPath, {$in: selectedFlags})
            : undefined;
          return combineAnd([sourceLeaf, flagsLeaf]);
        }
      }
    }, [
      ['span', {class: 'searchLabel'}, [`${label} (source)`]],
      buildLiteralRegexControls({name}),
      ['label', [
        'Flags: ',
        buildMultiSelect({name: flagsName, options: regexpType.allowedFlags})
      ]]
    ]];
  },
  getQuery: getQueryViaElement
};

export default regexpSearchType;
