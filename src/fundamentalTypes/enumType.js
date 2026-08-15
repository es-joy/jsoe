import {$e} from '../utils/templateUtils.js';

/**
 * @type {import('../types.js').TypeObject}
 */
const enumType = {
  option: ['Enum'],
  stringRegex: /^Enum\((.*)\)$/u,
  valueMatch (x) {
    return typeof x === 'string' || typeof x === 'number';
  },
  toValue (s) {
    return {value: s.slice(1, -1)};
  },
  getInput ({root}) {
    return /** @type {HTMLSelectElement} */ ($e(root, 'select'));
  },
  setValue ({root, value}) {
    this.getInput({root}).value = String(value);
  },
  getValue ({root}) {
    const input = /** @type {HTMLSelectElement} */ (this.getInput({root}));
    const selectedOption = input.selectedOptions[0];
    return selectedOption.dataset.valueType === 'number'
      ? Number(selectedOption.value)
      : selectedOption.value;
  },
  viewUI ({value, specificSchemaObject}) {
    return ['span', {
      dataset: {type: 'enum'},
      title: specificSchemaObject?.description ?? '(an enum)'
    }, [
      value
    ]];
  },
  editUI ({typeNamespace, specificSchemaObject, value = ''}) {
    const schemaEnumValues = Object.values(
      /** @type {import('zodexy').SzEnum} */ (specificSchemaObject).values
    );
    const selectedValue = value === ''
      ? specificSchemaObject?.defaultValue
      : value;
    return ['div', {
      dataset: {type: 'enum'},
      title: specificSchemaObject?.description ?? 'Enum'
    }, [
      ['select', {
        name: `${typeNamespace}-enum`
      }, schemaEnumValues.map((val) => {
        return ['option', {
          dataset: {valueType: typeof val},
          selected: selectedValue === val
        }, [String(val)]];
      })]
    ]];
  }
};

export default enumType;
