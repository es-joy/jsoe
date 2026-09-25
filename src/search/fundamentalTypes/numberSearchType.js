import {
  buildPathLabel, buildRangeInputsPair, readRangeInputsPair, buildTriStateSelect,
  readTriStateSelect, syncRangeValidity, applyRangeQuery, applyTriState, extractLeafOfKind
} from '../searchUtils.js';
import {makeRangeLeaf, makeIntegerCheckLeaf, combineAnd} from '../queryTreeBuilders.js';
import {getQueryViaElement, applyQueryViaElement} from '../searchElementUtils.js';

/**
 * @typedef {import('../searchDispatch.js').SearchTypeObject} SearchTypeObject
 */

/**
 * OR Ranges/Is Not Range, Is/Is Not Integer (README).
 * @type {SearchTypeObject}
 */
const numberSearchType = {
  buildUI ({schemaObject, path, typeNamespace}) {
    const label = buildPathLabel(schemaObject, path);
    const name = `${typeNamespace}-number`;
    return ['jsoe-search-number', {
      dataset: {searchPath: path, searchKind: 'number'},
      title: label,
      $define: {
        /** @this {HTMLElement} */
        connectedCallback () {
          syncRangeValidity(this);
        },
        /** @this {HTMLElement} */
        getQuery () {
          const searchPath = this.dataset.searchPath ??
            /* istanbul ignore next -- Guard: buildUI always sets dataset.searchPath */
            '';
          const {gte, lte} = readRangeInputsPair(this);
          const rangeLeaf = gte === '' && lte === ''
            ? undefined
            : makeRangeLeaf(searchPath, 'number', {
              ...(gte === '' ? {} : {$gte: Number(gte)}),
              ...(lte === '' ? {} : {$lte: Number(lte)})
            });
          const isInteger = readTriStateSelect(this);
          const integerLeaf = isInteger === undefined
            ? undefined
            : makeIntegerCheckLeaf(searchPath, isInteger);
          return combineAnd([rangeLeaf, integerLeaf]);
        },
        /**
         * @this {HTMLElement}
         * @param {import('../queryTree.js').QueryNode|undefined} queryNode
         * @returns {void}
         */
        applyQuery (queryNode) {
          const {matched: rangeLeaf} = extractLeafOfKind(queryNode, 'range');
          applyRangeQuery(this, rangeLeaf);
          const {matched: integerLeaf} = extractLeafOfKind(queryNode, 'integerCheck');
          applyTriState(this, integerLeaf?.isInteger);
        }
      }
    }, [
      ['span', {class: 'searchLabel'}, [label]],
      ...buildRangeInputsPair({name}),
      ['label', [
        'Integer: ',
        buildTriStateSelect({
          name: `${name}-integer`, trueLabel: 'Integer', falseLabel: 'Not integer'
        })
      ]]
    ]];
  },
  getQuery: getQueryViaElement,
  applyQuery: applyQueryViaElement
};

export default numberSearchType;
