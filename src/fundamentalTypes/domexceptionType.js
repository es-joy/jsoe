import {toStringTag} from '../vendor-imports.js';
import {$e} from '../utils/templateUtils.js';
import {schemaLabel} from '../utils/schemaMeta.js';

let domExceptionNameId = 0;

/**
 * @type {import('../types.js').TypeObject}
 */
const domexceptionType = {
  option: ['DOMException'],
  stringRegex: /^DOMException\((.*)\)$/u,
  valueMatch (x) {
    return toStringTag(x) === 'DOMException';
  },
  toValue (s) {
    const {message, name} = JSON.parse(s);
    return {value: new DOMException(message, name)};
  },
  getInput ({root}) {
    return /** @type {HTMLInputElement} */ ($e(root, 'input'));
  },
  setValue ({root, value}) {
    /** @type {HTMLInputElement} */ (
      $e(root, '.message')
    ).value = value.message;
    /** @type {HTMLInputElement} */ (
      $e(root, '.name')
    ).value = value.name;
  },
  getValue ({root}) {
    const message = /** @type {HTMLInputElement} */ (
      $e(root, '.message')
    ).value;
    const name = /** @type {HTMLInputElement} */ (
      $e(root, '.name')
    ).value;
    return new DOMException(message, name);
  },
  viewUI ({value, specificSchemaObject}) {
    return ['div', {
      dataset: {type: 'domexception'},
      title: schemaLabel(specificSchemaObject) ?? '(a `DOMException`)'
    }, [
      ['b', ['Message ']],
      value.message,
      ['br'],
      ['b', ['Name ']],
      value.name,
      ['br'],
      ['b', ['Code ']],
      value.code
    ]];
  },
  editUI ({typeNamespace, specificSchemaObject, value = ''}) {
    domExceptionNameId++;
    return ['div', {
      dataset: {type: 'domexception'},
      title: schemaLabel(specificSchemaObject) ?? 'DOMException'
    }, [
      ['label', [
        'Name: ',
        ['input', {
          class: 'name',
          list: `domExceptionNames-${domExceptionNameId}`,
          name: `${typeNamespace}-domexception-name`,
          value: value?.name ?? '',
          size: 30,
          placeholder: '(Optional predefined name)'
        }]
      ]],
      ['datalist', {
        id: `domExceptionNames-${domExceptionNameId}`,
        class: 'predefinedNames'
      }, [
        'IndexSizeError',
        'HierarchyRequestError',
        'WrongDocumentError',
        'InvalidCharacterError',
        'NoModificationAllowedError',
        'NotFoundError',
        'NotSupportedError',
        'InvalidStateError',
        'InUseAttributeError',
        'SyntaxError',
        'InvalidModificationError',
        'NamespaceError',
        'InvalidAccessError',
        'TypeMismatchError',
        'SecurityError',
        'NetworkError',
        'AbortError',
        'URLMismatchError',
        'QuotaExceededError',
        'TimeoutError',
        'InvalidNodeTypeError',
        'DataCloneError',
        'EncodingError',
        'NotReadableError',
        'UnknownError',
        'ConstraintError',
        'DataError',
        'TransactionInactiveError',
        'ReadOnlyErrorVersionError',
        'OperationError',
        'NotAllowedError'
      ].map((name) => {
        return ['option', [name]];
      })],
      ['br'],
      ['label', [
        'Message: ',
        ['input', {
          class: 'message',
          name: `${typeNamespace}-domexception-message`,
          value: value?.message ?? ''
        }]
      ]]
    ]];
  }
};

export default domexceptionType;
