import {$e} from '../utils/templateUtils.js';

/**
 * @type {import('../types.js').TypeObject}
 */
const numberType = {
  option: ['Number'],
  stringRegex: new RegExp(
    '^' + // No leading content.
      '[-+]?' + // Optional sign.
      // Optionally 0-30 decimal digits of mantissa.
      String.raw`(?:\d{0,30}\.)?` +
      // 1-30 decimal digits of integer or fraction.
      String.raw`\d{1,30}` +
      // Optional exponent 0-29 for scientific notation.
      String.raw`(?:[Ee][-+]?[1-2]?\d)?` +
      '$', // No trailing content.
    'u'
  ),
  valueMatch (x) {
    return typeof x === 'number' &&
      // Avoid special numbers:
      !Number.isNaN(x) &&
      x !== Infinity && x !== -Infinity &&
      !Object.is(x, -0);
  },
  toValue (s) {
    return {value: Number(s)};
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
      message: 'Not a valid (finite) number',
      valid: Boolean(val && (/^-?(\d+|\d*\.\d+)$/u).test(val))
    };
  },
  getValue ({root}) {
    return Number(this.getInput({root}).value);
  },
  /* schema
  viewSchemaUI () {
    // Todo?
  },
  */
  viewUI ({value, specificSchemaObject}) {
    return ['i', {
      dataset: {type: 'number'},
      title: specificSchemaObject?.description ?? '(a number)'
    }, [
      String(value)
    ]];
  },
  editUI ({typeNamespace, specificSchemaObject, value}) {
    const isLiteral = specificSchemaObject?.type === 'literal';
    const numberSchemaObject = /** @type {import('zodex').SzNumber} */ (
      specificSchemaObject
    );
    // Seems to need a multiplier of around these sizes to have a noticeable
    //   effect on the inputs; shouldn't need any though
    const epsilon = 150 * Number.EPSILON;
    const maxEpsilon = 300 * Number.EPSILON;

    const isInteger = () => {
      return 'format' in numberSchemaObject && numberSchemaObject.format && [
        'int32', 'uint32', 'safeint'
      ].includes(numberSchemaObject.format);
    };

    const min = numberSchemaObject?.min ??
      ('format' in numberSchemaObject && numberSchemaObject.format
        ? {
          int32: -2147483648,
          uint32: 0,
          safeint: Number.MIN_SAFE_INTEGER,
          float32: 1.1754943508222875e-38,
          float64: Number.MIN_VALUE
        }[numberSchemaObject.format]
        : undefined);

    const max = numberSchemaObject?.max ??
      ('format' in numberSchemaObject && numberSchemaObject.format
        ? {
          int32: 2147483647,
          uint32: 4294967295,
          safeint: Number.MAX_SAFE_INTEGER,
          float32: 3.4028234663852886e+38,
          float64: Number.MAX_VALUE
        }[numberSchemaObject.format]
        : undefined);

    return ['div', {
      dataset: {type: 'number'},
      title: specificSchemaObject?.description ?? 'Number'
    }, [
      ['input', {
        // disabled: isLiteral,
        name: `${typeNamespace}-number`,
        // Numeric type can't impose `pattern`
        type: isLiteral ? 'text' : 'number',
        min: min
          ? numberSchemaObject?.minInclusive
            ? min
            : min + (
              (isInteger() ? 1 : epsilon)
            )
          : undefined,
        max: max
          ? numberSchemaObject?.maxInclusive
            ? max
            : max -
              (isInteger() ? 1 : maxEpsilon)
          : undefined,
        step: numberSchemaObject?.multipleOf ??
          (isInteger() ? '1' : 'any'),
        pattern: isLiteral && specificSchemaObject?.values
          ? specificSchemaObject.values.filter((/** @type {number} */ val) => {
            return typeof val === 'number';
          }).join('|')
          : undefined,
        value: (value ?? specificSchemaObject?.defaultValue ?? '')
      }]
    ]];
  }
};

export default numberType;
