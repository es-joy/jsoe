import {$e} from '../utils/templateUtils.js';

/**
 * @type {import('../types.js').TypeObject}
 */
const domexceptionType = {
  option: ['DOMException'],
  stringRegex: /^DOMException\((.*)\)$/u,
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
  viewUI ({value}) {
    return ['div', {dataset: {type: 'domexception'}}, [
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
  editUI ({typeNamespace, value = ''}) {
    // eslint-disable-next-line @stylistic/max-len -- Long
    return ['div', {dataset: {type: 'domexception'}}, /** @type {import('jamilih').JamilihChildren} */ ([
      ['label', [
        'Name: ',
        ['input', {
          class: 'name',
          name: `${typeNamespace}-domexception-name`, value
        }]
      ]],
      ' ',
      ['select', {
        class: 'predefinedNames',
        $on: {
          /**
           * @this {HTMLSelectElement}
           */
          change () {
            /** @type {HTMLInputElement} */
            ($e(
              /** @type {HTMLLabelElement} */ (
                this.previousElementSibling
              ),
              '.name'
            )).value = this.value;
          }
        }
      }, [
        ['option', {value: ''}, [
          '(Choose an optional predefined name)'
        ]],
        ...[
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
        })
      ]],
      ['br'],
      ['label', [
        'Message: ',
        ['input', {
          class: 'message',
          name: `${typeNamespace}-domexception-message`, value
        }]
      ]]
    ])];
  }
};

export default domexceptionType;
