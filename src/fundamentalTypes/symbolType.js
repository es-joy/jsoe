import {$e} from '../utils/templateUtils.js';
import {schemaLabel} from '../utils/schemaMeta.js';

/**
 * @type {import('../types.js').TypeObject & {ct: number}}
 */
const symbolType = {
  option: ['Symbol'],
  stringRegex: /^(?<symbolClassType>Symbol|Symbol.for)\((?<innerContent>[^)]*)\)$/u,
  ct: 0,
  valueMatch (x) {
    return typeof x === 'symbol';
  },
  toValue (s, rootInfo) {
    const {groups: {
      symbolClassType
    /* istanbul ignore next -- Should always be found */
    } = {}} = /** @type {RegExpMatchArray} */ (
      /** @type {import('../types.js').RootInfo} */ (rootInfo).match
    );
    const symbolClass = symbolClassType === 'Symbol'
      ? Symbol
      : Symbol.for.bind(Symbol);

    return {value: symbolClass(s)};
  },
  getInput ({root}) {
    return /** @type {HTMLInputElement} */ ($e(root, 'input.symbolInput'));
  },
  setValue ({root, value}) {
    if (Symbol.keyFor(value)) {
      /** @type {HTMLInputElement} */ (
        $e(root, 'input[value="Symbol.for"]')
      ).checked = true;
    } else {
      /** @type {HTMLInputElement} */ (
        $e(root, 'input[value="Symbol"]')
      ).checked = true;
    }
    this.getInput({root}).value = String(value).slice(7, -1);
  },
  getValue ({root}) {
    const method = /** @type {HTMLInputElement} */ (
      $e(root, 'input[value="Symbol"]')
    ).checked
      ? Symbol
      : Symbol.for.bind(Symbol);
    return method(this.getInput({root}).value);
  },
  viewUI ({value, specificSchemaObject}) {
    return ['span', {
      dataset: {type: 'symbol'},
      title: schemaLabel(specificSchemaObject) ?? '(a Symbol)'
    }, [
      Symbol.keyFor(value) === undefined ? '' : ['b', ['Global: ']],
      String(value).slice(7, -1)
    ]];
  },
  editUI ({typeNamespace, specificSchemaObject, value = ''}) {
    this.ct++;
    return ['div', {
      dataset: {type: 'symbol'},
      title: schemaLabel(specificSchemaObject) ?? '(a Symbol)'
    }, [
      ['label', [
        'Symbol()',
        ['input', {
          type: 'radio', name: `${typeNamespace}-symbol${this.ct}`,
          value: 'Symbol', checked: !value || !Symbol.keyFor(value)
        }]
      ]],
      ['label', [
        'Symbol.for()',
        ['input', {
          type: 'radio', name: `${typeNamespace}-symbol${this.ct}`,
          value: 'Symbol.for',
          checked: value && Symbol.keyFor(value) !== undefined
        }]
      ]],
      ['br'],
      ['input', {
        className: 'symbolInput',
        name: `${typeNamespace}-symbol`,
        value: String(value).slice(7, -1)
      }]
    ]];
  }
};

export default symbolType;
