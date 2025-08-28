import {toStringTag} from '../vendor-imports.js';
import {$e} from '../utils/templateUtils.js';
import numberType from './numberType.js';

/**
 * @type {import('../types.js').TypeObject}
 */
const NumberObjectType = {
  option: ['NumberObject'],
  stringRegex: /^Number\((.*)\)$/u,
  valueMatch (x) {
    return toStringTag(x) === 'Number' && typeof x === 'object';
  },
  toValue (s) {
    // eslint-disable-next-line no-new-wrappers, unicorn/new-for-builtins -- Deliberate creation here
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
  viewUI ({value, specificSchemaObject}) {
    return ['i', {
      dataset: {type: 'NumberObject'},
      title: specificSchemaObject?.description ?? '(a Number Object)'
    }, [
      specificSchemaObject ? `${value}` : `Number(${value})`
    ]];
  },
  editUI ({typeNamespace, specificSchemaObject, value}) {
    return ['div', {
      dataset: {type: 'NumberObject'},
      title: specificSchemaObject?.description ?? 'Number object'
    }, [
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
