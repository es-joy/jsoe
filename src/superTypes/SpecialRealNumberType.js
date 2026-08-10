import {$e} from '../utils/templateUtils.js';

/**
 * @type {import('../types.js').SuperTypeObject}
 */
const SpecialRealNumberSuperType = {
  option: ['Special Real Number', {title: '`Infinity`, `-Infinity`, `-0`'}],
  childTypes: ['infinity', 'negativeInfinity', 'negativeZero'],
  stringRegex: /^(?:-?Infinity|-0)$/u,
  valueMatch (x) {
    return Object.is(x, -0) || x === Infinity ||
      x === -Infinity;
  },
  toValue (s) {
    return {
      value: s === '-0'
        ? -0
        : s === 'Infinity'
          ? Infinity
          : -Infinity
    };
  },
  getSelect ({root}) {
    return /** @type {HTMLSelectElement} */ ($e(root, 'select'));
  },
  getValue ({root}) {
    return /** @type {import('../types.js').ToValue} */ (this.toValue)(
      /** @type {Required<import('../types.js').TypeObject>} */ (
        this
      ).getSelect({root}).value
    ).value;
  },
  setValue ({root, value}) {
    /** @type {Required<import('../types.js').TypeObject>} */ (
      this
    ).getSelect({root}).value = Object.is(value, -0) ? '-0' : String(value);
  },
  viewUI ({value, specificSchemaObject}) {
    const isNegativeZero = Object.is(value, -0);
    return ['i', {
      dataset: {type: 'SpecialRealNumber'},
      title: specificSchemaObject?.description ?? (isNegativeZero
        ? '(negative zero)'
        : `(${String(value)})`)
    }, [
      isNegativeZero
        ? '-0'
        : String(value)
    ]];
  },
  /* istanbul ignore next -- No dupe keys, array refs, or validation */
  getInput ({root}) {
    return /** @type {HTMLSelectElement} */ ($e(root, 'select'));
  },
  editUI ({
    typeNamespace, specificSchemaObject, value = Infinity
  }) {
    return ['div', {
      dataset: {type: 'SpecialRealNumber'},
      title: specificSchemaObject?.description ?? 'Special Real Number'
    }, [
      ['label', [
        ['select', {name: `${typeNamespace}-SpecialRealNumber`}, [
          ['option', {
            value: 'Infinity', selected: value === Infinity
          }, ['Infinity']],
          ['option', {
            value: '-Infinity', selected: value === -Infinity
          }, ['-Infinity']],
          ['option', {
            value: '-0', selected: Object.is(value, -0)
          }, ['-0']]
        ]]
      ]]
    ]];
  }
};

export default SpecialRealNumberSuperType;
