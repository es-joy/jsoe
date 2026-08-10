import {$e} from '../utils/templateUtils.js';

/**
 * @type {import('../types.js').SuperTypeObject}
 */
const SpecialNumberSuperType = {
  option: ['Special Number', {title: '`NaN`, `Infinity`, `-Infinity`, `-0`'}],
  childTypes: ['infinity', 'negativeInfinity', 'nan', 'negativeZero'],
  stringRegex: /^(?:NaN|-?Infinity|-0)$/u,
  toValue (s) {
    return {
      value: s === '-0'
        ? -0
        : s === 'NaN'
          ? NaN
          : s === 'Infinity'
            ? Infinity
            : -Infinity
    };
  },
  getSelect ({root}) {
    return /** @type {HTMLSelectElement} */ ($e(root, 'select'));
  },
  /* istanbul ignore next -- No dupe keys, array refs, or validation */
  getInput ({root}) {
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
  viewUI ({value}) {
    return ['i', {dataset: {type: 'SpecialNumber'}}, [
      Object.is(value, -0) ? '-0' : String(value)
    ]];
  },
  editUI ({typeNamespace, value = NaN}) {
    return ['div', {dataset: {type: 'SpecialNumber'}}, [
      ['label', [
        'Special number: ',
        ['select', {
          name: `${typeNamespace}-SpecialNumber`
        }, [
          ['option', {
            value: 'NaN', selected: Number.isNaN(value)
          }, ['NaN']],
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

export default SpecialNumberSuperType;
