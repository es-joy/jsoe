import {$e} from '../utils/templateUtils.js';

/**
 * @type {import('../types.js').TypeObject}
 */
const bigintType = {
  option: ['BigInt'],
  stringRegex: new RegExp(
    '^' + // No leading content.
      '-?' + // Optional negative sign.
      // How many digits?
      String.raw`\d+` +
      'n' +
      '$', // No trailing content.
    'u'
  ),
  valueMatch (x) {
    return typeof x === 'bigint';
  },
  toValue (s) {
    return {value: BigInt(s.slice(0, -1))};
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
    return BigInt(this.getInput({root}).value);
  },
  /* schema:
  viewSchemaUI () {
    // Todo?
  },
  */
  viewUI ({value, specificSchemaObject}) {
    return ['i', {
      dataset: {type: 'bigint'},
      title: specificSchemaObject?.description ?? '(a BigInt)'
    }, [
      `${String(value)}n`
    ]];
  },
  editUI ({typeNamespace, specificSchemaObject, value}) {
    const bigintSchemaObject = /** @type {import('zodexy').SzBigInt} */ (
      specificSchemaObject
    );
    return ['div', {
      dataset: {type: 'bigint'},
      title: specificSchemaObject?.description ?? 'BigInt'
    }, [
      ['input', {
        name: `${typeNamespace}-bigint`, type: 'number',
        value: value ?? specificSchemaObject?.defaultValue ?? '',
        min: bigintSchemaObject?.min
          ? bigintSchemaObject?.minInclusive
            ? bigintSchemaObject?.min
            : String(BigInt(bigintSchemaObject?.min) + 1n)
          : undefined,
        max: bigintSchemaObject?.max
          ? bigintSchemaObject?.maxInclusive
            ? bigintSchemaObject?.max
            : String(BigInt(bigintSchemaObject?.max) - 1n)
          : undefined,
        step: bigintSchemaObject?.multipleOf ?? '1'
      }]
    ]];
  }
};

export default bigintType;
