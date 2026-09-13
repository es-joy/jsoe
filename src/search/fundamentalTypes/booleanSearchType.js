import {buildPathLabel, buildTriStateSelect, readTriStateSelect} from '../searchUtils.js';
import {makeBooleanEqualsLeaf} from '../queryTreeBuilders.js';
import {getQueryViaElement} from '../searchElementUtils.js';

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
          const value = readTriStateSelect(this, name);
          return value === undefined
            ? undefined
            : makeBooleanEqualsLeaf(this.dataset.searchPath ?? '', value);
        }
      }
    }, [
      ['span', {class: 'searchLabel'}, [label]],
      ['label', [
        `${label}: `,
        buildTriStateSelect({name, trueLabel: 'True', falseLabel: 'False'})
      ]]
    ]];
  },
  getQuery: getQueryViaElement
};

export default booleanSearchType;
