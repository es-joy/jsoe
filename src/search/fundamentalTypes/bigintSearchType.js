import {buildPathLabel, buildRangeInputsPair, readRangeInputsPair} from '../searchUtils.js';
import {makeRangeLeaf} from '../queryTreeBuilders.js';
import {getQueryViaElement} from '../searchElementUtils.js';

/**
 * @typedef {import('../searchDispatch.js').SearchTypeObject} SearchTypeObject
 */

/**
 * @param {string} str
 * @returns {string|undefined}
 */
function parseBigIntBound (str) {
  if (!str) {
    return undefined;
  }
  try {
    // Kept as a decimal string (not a runtime `BigInt`) so the tree stays
    //   JSON-serializable, mirroring `dateSearchType.js`'s ISO-string bounds.
    return String(BigInt(str));
  } catch {
    return undefined;
  }
}

/**
 * OR Ranges/Is Not Range (README) - text inputs rather than
 * `<input type="number">`, since a native number input silently loses
 * precision beyond `Number.MAX_SAFE_INTEGER`.
 * @type {SearchTypeObject}
 */
const bigintSearchType = {
  buildUI ({schemaObject, path, typeNamespace}) {
    const label = buildPathLabel(schemaObject, path);
    const name = `${typeNamespace}-bigint`;
    return ['jsoe-search-bigint', {
      dataset: {searchPath: path, searchKind: 'bigint'},
      title: label,
      $define: {
        /** @this {HTMLElement} */
        getQuery () {
          const {gte: gteStr, lte: lteStr} = readRangeInputsPair(this);
          const $gte = parseBigIntBound(gteStr);
          const $lte = parseBigIntBound(lteStr);
          if ($gte === undefined && $lte === undefined) {
            return undefined;
          }
          return makeRangeLeaf(this.dataset.searchPath ?? '', 'bigint', {
            ...($gte === undefined ? {} : {$gte}),
            ...($lte === undefined ? {} : {$lte})
          });
        }
      }
    }, [
      ['span', {class: 'searchLabel'}, [label]],
      ...buildRangeInputsPair({name, type: 'text'})
    ]];
  },
  getQuery: getQueryViaElement
};

export default bigintSearchType;
