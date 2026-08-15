import {$e} from '../utils/templateUtils.js';

import booleanType from './booleanType.js';
import numberType from './numberType.js';
import stringType from './stringType.js';

/**
 * @type {import('../types.js').TypeObject}
 */
const literalType = {
  option: ['Literal'],
  stringRegex: /^Literal\((.*)\)$/u,
  valueMatch (x) {
    // const schema =
    //   /** @type {import('zodexy').SzLiteral<any>} */ (cfg?.schema);
    return (typeof x === 'boolean' || typeof x === 'number' ||
      typeof x === 'string'); // && (!schema || schema.value === x);
  },
  toValue (s) {
    const value = s === 'true'
      ? true
      : s === 'false'
        ? false
        : s.charAt(0) === '"'
          ? s.slice(1, -1)
          : Number(s);
    return {value};
  },
  // Todo: Fix all the following methods up to `setValue` to work with children
  getInput ({root}) {
    return /** @type {HTMLTextAreaElement} */ ($e(root, 'input,textarea'));
  },
  setValue ({root, value}) {
    const typeObject = typeof value === 'boolean'
      ? booleanType
      : typeof value === 'number'
        ? numberType
        : stringType;
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
    } = /** @type {import('zodexy').SzLiteral<(boolean|number|string)[]>} */ (
      specificSchemaObject
    );
    const literalValue = arg.value !== undefined ? arg.value : values[0];

    // Todo: BigInt, null, undefined
    const typeObject = typeof literalValue === 'boolean'
      ? booleanType
      : typeof literalValue === 'number'
        ? numberType
        : stringType;
    const specificLiteralEditUI = typeObject.editUI({
      ...arg,
      value: literalValue
    });

    return ['div', {dataset: {type: 'literal'}}, [specificLiteralEditUI]];
  }
};

export default literalType;
