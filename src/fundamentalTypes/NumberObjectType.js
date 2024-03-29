import {$e} from '../utils/templateUtils.js';
import numberType from './numberType.js';

/**
 * @type {import('../types.js').TypeObject}
 */
const NumberObjectType = {
  option: ['NumberObject'],
  stringRegex: /^Number\((.*)\)$/u,
  toValue (s) {
    // eslint-disable-next-line no-new-wrappers, unicorn/new-for-builtins
    return {value: new Number(s)};
  },
  validate ({root}) {
    return /** @type {Required<import('../types.js').TypeObject>} */ (
      numberType
    ).validate({root});
  },
  getInput ({root}) {
    return /** @type {HTMLInputElement} */ ($e(root, 'input'));
  },
  getValue ({root}) {
    return /** @type {import('../types.js').ToValue} */ (
      this.toValue
    )(this.getInput({root}).value).value;
  },
  setValue ({root, value}) {
    this.getInput({root}).value = String(value);
  },
  viewUI ({value}) {
    return ['i', {dataset: {type: 'NumberObject'}}, [`Number(${value})`]];
  },
  editUI ({typeNamespace, value}) {
    return ['div', {dataset: {type: 'NumberObject'}}, [
      ['input', {
        name: `${typeNamespace}-NumberObject`,
        type: 'number',
        value,
        step: 'any'
      }]
    ]];
  }
};

export default NumberObjectType;
