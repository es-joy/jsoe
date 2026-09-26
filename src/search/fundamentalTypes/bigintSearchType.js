import {
  buildPathLabel, buildRangeInputsPair, readRangeInputsPair, syncRangeValidity,
  applyRangeQuery, extractLeafOfKind
} from '../searchUtils.js';
import {makeRangeLeaf} from '../queryTreeBuilders.js';
import {getQueryViaElement, applyQueryViaElement} from '../searchElementUtils.js';
import {getSchemaType} from '../../formats/schema.js';

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
      dataset: {searchPath: path, searchKind: getSchemaType(schemaObject)},
      title: label,
      $define: {
        /** @this {HTMLElement} */
        connectedCallback () {
          syncRangeValidity(this);
        },
        /** @this {HTMLElement} */
        getQuery () {
          const {gte: gteStr, lte: lteStr} = readRangeInputsPair(this);
          const $gte = parseBigIntBound(gteStr);
          const $lte = parseBigIntBound(lteStr);
          if ($gte === undefined && $lte === undefined) {
            return undefined;
          }
          const searchPath = this.dataset.searchPath ??
            /* istanbul ignore next -- Guard: buildUI always sets dataset.searchPath */
            '';
          return makeRangeLeaf(searchPath, 'bigint', {
            ...($gte === undefined ? {} : {$gte}),
            ...($lte === undefined ? {} : {$lte})
          });
        },
        /**
         * @this {HTMLElement}
         * @param {import('../queryTree.js').QueryNode|undefined} queryNode
         * @returns {void}
         */
        applyQuery (queryNode) {
          const {matched} = extractLeafOfKind(queryNode, 'range');
          applyRangeQuery(this, matched);
        }
      }
    }, [
      ['span', {class: 'searchLabel'}, [label]],
      ...buildRangeInputsPair({name, type: 'text'})
    ]];
  },
  getQuery: getQueryViaElement,
  applyQuery: applyQueryViaElement
};

export default bigintSearchType;
