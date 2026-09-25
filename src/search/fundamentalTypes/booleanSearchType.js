import {
  buildPathLabel, buildTriStateSelect, readTriStateSelect, applyTriState, extractLeafOfKind
} from '../searchUtils.js';
import {makeBooleanEqualsLeaf} from '../queryTreeBuilders.js';
import {getQueryViaElement, applyQueryViaElement} from '../searchElementUtils.js';

/**
 * @typedef {import('../searchDispatch.js').SearchTypeObject} SearchTypeObject
 */

/**
 * True or false (README).
 * @type {SearchTypeObject}
 */
const booleanSearchType = {
  buildUI ({schemaObject, path, typeNamespace}) {
    const label = buildPathLabel(schemaObject, path);
    const name = `${typeNamespace}-boolean`;
    return ['jsoe-search-boolean', {
      dataset: {searchPath: path, searchKind: 'boolean'},
      title: label,
      $define: {
        /** @this {HTMLElement} */
        getQuery () {
          const value = readTriStateSelect(this);
          return value === undefined
            ? undefined
            : makeBooleanEqualsLeaf(
              this.dataset.searchPath ??
                /* istanbul ignore next -- Guard: buildUI always sets dataset.searchPath */
                '',
              value
            );
        },
        /**
         * @this {HTMLElement}
         * @param {import('../queryTree.js').QueryNode|undefined} queryNode
         * @returns {void}
         */
        applyQuery (queryNode) {
          const {matched} = extractLeafOfKind(queryNode, 'booleanEquals');
          applyTriState(this, matched?.value);
        }
      }
    }, [
      ['span', {class: 'searchLabel'}, [label]],
      ['label', [
        `${label}: `,
        buildTriStateSelect({name, trueLabel: 'True', falseLabel: 'False', required: true})
      ]]
    ]];
  },
  getQuery: getQueryViaElement,
  applyQuery: applyQueryViaElement
};

export default booleanSearchType;
