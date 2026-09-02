import {$e} from '../utils/templateUtils.js';
import {schemaLabel} from '../utils/schemaMeta.js';

/**
 * @type {import('../types.js').TypeObject}
 */
const undefinedType = {
  stringRegex: /^undefined$/u,
  option: ['Explicit undefined'], // Explicit undefined only
  valueMatch (x) {
    return x === undefined;
  },
  toValue (/* _s */) {
    return {value: undefined};
  },
  getValue () {
    return /** @type {import('../types.js').ToValue} */ (
      this.toValue
    )('').value;
  },
  viewUI ({specificSchemaObject}) {
    return ['i', {
      dataset: {type: 'undef'},
      title: schemaLabel(specificSchemaObject) ?? '(an `undefined`)'
    }, ['undefined']];
  },
  /* istanbul ignore next -- No dupe keys, array refs, or validation */
  getInput ({root}) {
    return /** @type {HTMLInputElement} */ ($e(root, 'input'));
  },
  editUI ({typeNamespace, specificSchemaObject}) {
    return ['div', {
      dataset: {type: 'undef'},
      title: schemaLabel(specificSchemaObject) ?? 'Undefined'
    }, [
      ['label', [
        'Undefined',
        ['input', {
          type: 'checkbox',
          name: `${typeNamespace}-undef`,
          disabled: true,
          checked: true
        }]
      ]]
    ]];
  }
};

export default undefinedType;
