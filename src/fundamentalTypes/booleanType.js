import {$e} from '../utils/templateUtils.js';

/**
 * @type {import('../types.js').TypeObject & {ct: number}}
 */
const booleanType = {
  option: ['Boolean', {value: 'boolean'}],
  stringRegex: /^(?:true|false)$/u,
  toValue: (s) => ({value: s === 'true'}),
  getValue ({root}) {
    return /** @type {HTMLInputElement} */ (this.getInput({root})).checked;
  },
  viewUI ({value}) {
    return ['i', {dataset: {type: 'boolean'}}, [value ? 'true' : 'false']];
  },
  ct: 0,
  /* istanbul ignore next -- No dupe keys, array refs, or validation */
  getInput ({root}) {
    return /** @type {HTMLInputElement} */ ($e(root, 'input[value=true]'));
  },
  editUI ({typeNamespace, value}) {
    this.ct++;
    return ['div', {dataset: {type: 'boolean'}}, [
      ['label', [
        'True',
        ['input', {
          type: 'radio', name: `${typeNamespace}-boolean${this.ct}`,
          value: 'true', checked: typeof value === 'boolean' ? value : true
        }]
      ]],
      ['label', [
        'False',
        ['input', {
          type: 'radio', name: `${typeNamespace}-boolean${this.ct}`,
          value: 'false', checked: typeof value === 'boolean' ? value : false
        }]
      ]]
    ]];
  }
};

export default booleanType;
