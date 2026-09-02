import {toStringTag} from '../vendor-imports.js';
import {$e} from '../utils/templateUtils.js';
import {schemaLabel} from '../utils/schemaMeta.js';

/**
 * @type {import('../types.js').TypeObject}
 */
const noneditableType = {
  // Ideally, we would remove the option,
  //   but edit forms currently need a pull-down option
  option: ['Non-editable'],
  valueMatch () {
    return true;
  },
  getInput ({root}) {
    return /** @type {HTMLButtonElement} */ ($e(root, 'button'));
  },
  setValue ({root, value}) {
    /** @type {HTMLButtonElement & {$value: any}} */ (
      this.getInput({root})
    ).$value = value;
    /** @type {HTMLSpanElement} */ (
      $e(root, '.stringTag')
    ).textContent = value === undefined
      ? '(None)'
      : toStringTag(value);
  },
  getValue ({root}) {
    return /** @type {HTMLButtonElement & {$value: any}} */ (
      this.getInput({root})
    ).$value;
  },
  validate ({root}) {
    const val = /** @type {HTMLButtonElement & {$value: any}} */ (
      this.getInput({root})
    ).$value;
    return {
      message: 'The non-editable type is only for passing on ' +
        'pre-existing content that is unknown or currently unsupported',
      valid: val !== undefined
    };
  },
  viewUI ({value, specificSchemaObject}) {
    const stringTag = toStringTag(value);
    return ['div', {dataset: {type: 'resurrectable'}}, [
      ['b', {
        class: 'emphasis',
        title: schemaLabel(specificSchemaObject)
          ? `(a non-editable ${stringTag})`
          : undefined
      }, [
        schemaLabel(specificSchemaObject) ?? 'Non-editable'
      ]],
      ['span', {
        title: 'There is no current support for editing this element\'s ' +
          'type, but its contents will be passed on transparently.'
      }, ['?']],
      ['b', ['String tag: ']],
      stringTag
    ]];
  },
  editUI ({typeNamespace, specificSchemaObject, value}) {
    return ['div', {
      dataset: {type: 'resurrectable'},
      title: schemaLabel(specificSchemaObject) ?? 'Non-editable'
    }, [
      ['a', {
        // eslint-disable-next-line no-script-url -- Safe
        href: 'javascript:void(0)',
        $on: {
          click (e) {
            e.preventDefault();
          }
        },
        title: 'There is no current support for editing this element\'s ' +
          'type, but its contents will be passed on transparently.'
      }, ['?']],
      ' ',
      ['button', {
        $on: {
          click (e) {
            e.preventDefault();
            console.log(/** @type {HTMLButtonElement & {$value: any}} */ (
              this
            ).$value);
          }
        },
        name: `${typeNamespace}-resurrectable`,
        $custom: {
          $value: value
        }
      }, [
        'Non-editable'
      ]],
      ['br'],
      ['b', ['String tag: ']],
      ['span', {class: 'stringTag'}, [value ? toStringTag(value) : '(None)']]
    ]];
  }
};

export default noneditableType;
