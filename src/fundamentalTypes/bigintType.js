import {$e} from '../utils/templateUtils.js';
import {schemaLabel} from '../utils/schemaMeta.js';

/**
 * @typedef {HTMLInputElement & {
 *   $minBigInt?: string,
 *   $maxBigInt?: string
 * }} BigIntInput
 */

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
    return /** @type {HTMLInputElement|HTMLSelectElement} */ (
      $e(root, 'input,select')
    );
  },
  setValue ({root, value}) {
    this.getInput({root}).value = String(value);
  },
  validate ({root}) {
    const input = /** @type {BigIntInput} */ (this.getInput({root}));
    const {value} = input;
    const validSyntax = Boolean(value && (/^-?(\d+)$/u).test(value));
    if (!validSyntax) {
      return {message: 'Not a valid BigInt', valid: false};
    }
    const bigint = BigInt(value);
    if (input.$minBigInt !== undefined && bigint < BigInt(input.$minBigInt)) {
      return {message: `BigInt must be at least ${input.$minBigInt}`, valid: false};
    }
    if (input.$maxBigInt !== undefined && bigint > BigInt(input.$maxBigInt)) {
      return {message: `BigInt must be at most ${input.$maxBigInt}`, valid: false};
    }
    return {
      message: '',
      valid: true
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
      title: schemaLabel(specificSchemaObject) ?? '(a BigInt)'
    }, [
      `${String(value)}n`
    ]];
  },
  editUI ({typeNamespace, specificSchemaObject, value}) {
    if (specificSchemaObject?.type === 'literal') {
      const selectedValue = value ?? specificSchemaObject.defaultValue;
      return ['div', {
        dataset: {type: 'bigint'},
        title: schemaLabel(specificSchemaObject) ?? 'BigInt'
      }, [
        ['select', {
          name: `${typeNamespace}-bigint`
        }, specificSchemaObject.values.filter((/** @type {unknown} */ val) => {
          return typeof val === 'bigint';
        }).map((/** @type {bigint} */ val) => {
          return ['option', {
            selected: val === selectedValue
          }, [String(val)]];
        })]
      ]];
    }
    const bigintSchemaObject = /** @type {import('zodexy').SzBigInt} */ (
      specificSchemaObject
    );
    const formatBounds = bigintSchemaObject?.format
      ? {
        int64: {
          min: '-9223372036854775808',
          max: '9223372036854775807'
        },
        uint64: {
          min: '0',
          max: '18446744073709551615'
        }
      }[bigintSchemaObject.format]
      : undefined;
    const schemaMin = bigintSchemaObject?.min;
    const schemaMax = bigintSchemaObject?.max;
    const min = schemaMin ?? formatBounds?.min;
    const max = schemaMax ?? formatBounds?.max;
    const inputMin = min !== undefined
      ? schemaMin === undefined || bigintSchemaObject?.minInclusive
        ? min
        : String(BigInt(min) + 1n)
      : undefined;
    const inputMax = max !== undefined
      ? schemaMax === undefined || bigintSchemaObject?.maxInclusive
        ? max
        : String(BigInt(max) - 1n)
      : undefined;

    return ['div', {
      dataset: {type: 'bigint'},
      title: schemaLabel(specificSchemaObject) ?? 'BigInt'
    }, [
      ['input', {
        name: `${typeNamespace}-bigint`, type: 'number',
        $custom: {
          $minBigInt: inputMin,
          $maxBigInt: inputMax
        },
        value: value ?? specificSchemaObject?.defaultValue ?? '',
        min: inputMin,
        max: inputMax,
        step: bigintSchemaObject?.multipleOf ?? '1'
      }]
    ]];
  }
};

export default bigintType;
