import {$e} from '../utils/templateUtils.js';

/**
 * @type {import('../types.js').TypeObject}
 */
const nanType = {
  option: ['NaN'],
  stringRegex: /^NaN$/u,
  toValue: () => ({value: Number.NaN}),
  getValue: () => Number.NaN,
  viewUI () {
    return ['i', {dataset: {type: 'nan'}}, ['NaN']];
  },
  /* istanbul ignore next -- No dupe keys, array refs, or validation */
  getInput ({root}) {
    return /** @type {HTMLInputElement} */ ($e(root, 'input'));
  },
  editUI ({typeNamespace}) {
    return ['div', {dataset: {type: 'nan'}}, [
      ['label', [
        'NaN',
        ['input', {
          type: 'checkbox',
          name: `${typeNamespace}-nan`,
          checked: true
        }]
      ]]
    ]];
  }
};

export default nanType;
