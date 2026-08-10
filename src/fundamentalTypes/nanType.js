import {$e} from '../utils/templateUtils.js';

/**
 * @type {import('../types.js').TypeObject}
 */
const nanType = {
  option: ['NaN'],
  stringRegex: /^NaN$/u,
  valueMatch (x) {
    return Number.isNaN(x);
  },
  toValue: () => ({value: NaN}),
  getValue: () => NaN,
  /* istanbul ignore next -- No dupe keys, array refs, or validation */
  getInput ({root}) {
    return /** @type {HTMLInputElement} */ ($e(root, 'input'));
  },
  viewUI ({specificSchemaObject}) {
    return ['i', {
      dataset: {type: 'nan'},
      title: specificSchemaObject?.description ?? '(a `NaN`)'
    }, ['NaN']];
  },
  editUI ({typeNamespace, specificSchemaObject}) {
    return ['div', {
      dataset: {type: 'nan'},
      title: specificSchemaObject?.description ?? 'NaN'
    }, [
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
