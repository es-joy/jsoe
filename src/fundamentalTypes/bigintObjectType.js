import {hasConstructorOf} from '../vendor-imports.js';
import {$e} from '../utils/templateUtils.js';
import {schemaLabel} from '../utils/schemaMeta.js';

/**
 * @type {import('../types.js').TypeObject}
 */
const bigintObjectType = {
  option: ['BigInt Object'],
  stringRegex: new RegExp(
    '^BigIntObject' +
      '-?' + // Optional negative sign.
      // How many digits?
      String.raw`\d+` +
      'n' +
      '$', // No trailing content.
    'u'
  ),
  valueMatch (x) {
    return typeof x === 'object' && hasConstructorOf(x, BigInt);
  },
  toValue (s) {
    return {value: new Object(BigInt(s.slice(12, -1)))};
  },
  getInput ({root}) {
    return /** @type {HTMLInputElement} */ ($e(root, 'input'));
  },
  setValue ({root, value}) {
    this.getInput({root}).value = String(value);
  },
  validate ({root}) {
    const val = this.getInput({root}).value;
    return {
      message: 'Not a valid BigInt',
      valid: Boolean(val && (/^-?(\d+)$/u).test(val))
    };
  },
  getValue ({root}) {
    return new Object(BigInt(this.getInput({root}).value));
  },
  /* schema:
  viewSchemaUI () {
    // Todo?
  },
  */
  viewUI ({value, specificSchemaObject}) {
    return ['i', {
      dataset: {type: 'bigintObject'},
      title: schemaLabel(specificSchemaObject) ?? '(a BigInt Object)'
    }, [`${String(value)}n`]];
  },
  editUI ({typeNamespace, specificSchemaObject, value = ''}) {
    return ['div', {
      dataset: {type: 'bigintObject'},
      title: schemaLabel(specificSchemaObject) ?? 'BigInt object'
    }, [
      ['input', {
        name: `${typeNamespace}-bigintObject`, type: 'number', step: '1',
        value
      }]
    ]];
  }
};

export default bigintObjectType;
