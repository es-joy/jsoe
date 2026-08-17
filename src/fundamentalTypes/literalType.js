import {$e} from '../utils/templateUtils.js';

import bigintType from './bigintType.js';
import booleanType from './booleanType.js';
import nullType from './nullType.js';
import numberType from './numberType.js';
import stringType from './stringType.js';
import undefinedType from './undefinedType.js';

/**
 * @typedef {bigint|boolean|null|number|string|undefined} LiteralValue
 */

/**
 * @param {unknown} value
 * @returns {import('../types.js').TypeObject}
 */
function getLiteralTypeObject (value) {
  if (value === null) {
    return nullType;
  }
  if (value === undefined) {
    return undefinedType;
  }
  switch (typeof value) {
  case 'bigint':
    return bigintType;
  case 'boolean':
    return booleanType;
  case 'number':
    return numberType;
  default:
    return stringType;
  }
}

/**
 * @type {import('../types.js').TypeObject}
 */
const literalType = {
  option: ['Literal'],
  stringRegex: /^Literal\((.*)\)$/u,
  valueMatch (x) {
    // const schema =
    //   /** @type {import('zodexy').SzLiteral<any>} */ (cfg?.schema);
    return (x === null || x === undefined || typeof x === 'bigint' ||
      typeof x === 'boolean' || typeof x === 'number' ||
      typeof x === 'string'); // && (!schema || schema.value === x);
  },
  toValue (s) {
    let value;
    switch (s) {
    case 'true':
      value = true;
      break;
    case 'false':
      value = false;
      break;
    case 'null':
      value = null;
      break;
    case 'undefined':
      value = undefined;
      break;
    default:
      value = s.charAt(0) === '"'
        ? s.slice(1, -1)
        : s.endsWith('n')
          ? BigInt(s.slice(0, -1))
          : Number(s);
    }
    return {value};
  },
  // Todo: Fix all the following methods up to `setValue` to work with children
  getInput ({root}) {
    return /** @type {HTMLTextAreaElement} */ ($e(root, 'input,textarea'));
  },
  setValue ({root, value}) {
    const typeObject = getLiteralTypeObject(value);
    typeObject.setValue?.({root, value});
  },
  getValue ({root, stateObj}) {
    const innerTypeHolder = $e(root, '[data-type]');
    const typeObject = stateObj?.types?.getTypeObject?.(
      /** @type {import('../types.js').AvailableType} */ (
        innerTypeHolder?.dataset.type
      )
    );
    return /** @type {import('../types.js').TypeObject} */ (
      typeObject
    )?.getValue({root, stateObj});
  },
  viewUI ({value, specificSchemaObject}) {
    return ['span', {
      dataset: {type: 'literal'},
      title: specificSchemaObject?.description ?? `(a literal ${typeof value})`
    }, [String(value)]];
  },
  editUI (arg) {
    const {specificSchemaObject} = arg;
    const {
      values
    } = /** @type {import('zodexy').SzLiteral<LiteralValue[]>} */ (
      specificSchemaObject
    );
    const literalValue = Object.hasOwn(arg, 'value') ? arg.value : values[0];

    const typeObject = getLiteralTypeObject(literalValue);
    const specificLiteralEditUI = typeObject.editUI({
      ...arg,
      value: literalValue
    });

    return ['div', {dataset: {type: 'literal'}}, [specificLiteralEditUI]];
  }
};

export default literalType;
