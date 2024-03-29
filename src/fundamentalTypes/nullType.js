import {$e} from '../utils/templateUtils.js';

/**
 * @type {import('../types.js').TypeObject}
 */
const nullType = {
  option: ['Null'],
  stringRegex: /^null$/u,
  toValue: () => ({value: null}),
  getValue: () => null,
  viewUI () {
    return ['i', {dataset: {type: 'null'}}, ['null']];
  },
  /* istanbul ignore next -- No dupe keys, array refs, or validation */
  getInput ({root}) {
    return /** @type {HTMLInputElement} */ ($e(root, 'input'));
  },
  editUI ({typeNamespace}) {
    return ['div', {dataset: {type: 'null'}}, [
      ['label', [
        'Null',
        ['input', {
          type: 'checkbox',
          name: `${typeNamespace}-null`,
          checked: true
        }]
      ]]
    ]];
  }
};

export default nullType;
