import {jml, toStringTag} from '../vendor-imports.js';
import {$e} from '../utils/templateUtils.js';
import {schemaLabel} from '../utils/schemaMeta.js';

/**
 * @type {import('../types.js').TypeObject & {allowedFlags: string[]}}
 */
const regexpType = {
  option: ['RegExp'],
  stringRegex (nonGrouping) {
    const parenth = nonGrouping ? '(?:' : '(';
    return new RegExp(`^/${parenth}.*)/${parenth}[${
      this.allowedFlags.join('')
    }]{0,${
      this.allowedFlags.length
    }})$`, 'u');
  },
  valueMatch (x) {
    return toStringTag(x) === 'RegExp';
  },
  toValue (s) {
    /* istanbul ignore if */
    if (typeof this.stringRegex !== 'function') {
      throw new TypeError('Guard for TS');
    }
    const [, str, flags] = /** @type {RegExpMatchArray} */ (s.match(
      /** @type {import('../types.js').StringMatcher} */
      (/** @type {Required<import('../types.js').TypeObject>} */ (
        this
      ).stringRegex)()
    ));
    return {value: new RegExp(str, flags)};
  },
  getInput ({root}) {
    return /** @type {HTMLInputElement} */ ($e(root, 'input'));
  },
  setValue ({root, value}) {
    this.getInput({root}).value = value.source;
    /** @type {HTMLSelectElement & {$set: (flags: string[]) => void}} */
    (/** @type {Required<import('../types.js').TypeObject>} */ (
      this
    ).getSelect({root})).$set([...value.flags]);
  },
  getSelect ({root}) {
    return /** @type {HTMLSelectElement} */ ($e(root, 'select'));
  },
  validate ({root}) {
    try {
      this.getValue({root});
      return {valid: true};
    } catch (err) {
      return {
        valid: false,
        message: /** @type {Error} */ (err).message
      };
    }
  },
  getValue ({root}) {
    return new RegExp(
      this.getInput({root}).value, // .replace(/\\/g, '\\\\'),
      [...(/** @type {Required<import('../types.js').TypeObject>} */ (
        this
      )).getSelect({root}).selectedOptions].reduce((s, opt) => {
        return s + opt.value;
      }, '')
    );
  },
  allowedFlags: ['g', 'i', 'm', 'u', 'y', 's', 'v'],
  viewUI ({value, specificSchemaObject}) {
    return ['i', {
      dataset: {type: 'regexp'},
      title: schemaLabel(specificSchemaObject) ?? '(a `RegExp`)'
    }, [
      String(value)
    ]];
  },
  editUI ({
    typeNamespace, specificSchemaObject, types, value = {source: '', flags: ''}
  }) {
    // Todo (low): Add RegExp syntax highlighter
    const select = jml('select', {
      multiple: true, size: 5, $custom: {
        /**
         * @callback $Set
         * @param {string[]} valArr
         * @returns {void}
         */

        /** @type {$Set} */
        $set (valArr) { // A useful reusable method for multiple selects
          [...this.options].forEach((opt) => {
            opt.selected = valArr.includes(opt.value);
          });
        }
      }
    }, this.allowedFlags.map((flag) => {
      return ['option', {
        selected: value.flags.includes(flag)
      }, [flag]];
    }));
    const root = jml('div', {
      dataset: {type: 'regexp'},
      title: schemaLabel(specificSchemaObject) ?? 'RegExp'
    }, [
      ['label', [
        'Source ',
        ['input', {
          name: `${typeNamespace}-regexp`, type: 'text',
          value: value.source,
          $on: {
            input () {
              types.validate({type: 'regexp', root});
            },
            change () {
              types.validate({type: 'regexp', root});
            }
          }
        }]
      ]],
      ['br'],
      ['label', [
        'Flags ',
        select
      ]]
    ]);
    // Could be disallowed flags; we might instead try in
    //   advance which will work
    select.addEventListener('change', () => {
      types.validate({type: 'regexp', root});
    });
    return [root];
  }
};

export default regexpType;
