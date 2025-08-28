import {jml, toStringTag} from '../vendor-imports.js';
import {$e} from '../utils/templateUtils.js';

/**
 * @typedef {(
 *   legitimateInvalid?: boolean|undefined
 * ) => void} SetValidity
 */

/**
 * @type {import('../types.js').TypeObject & {
 *   dateRegex: RegExp,
 *   isInvalid: (cfg: {root: HTMLDivElement}) => boolean,
 *   isValueInvalid: (
 *     value: import('../formats.js').StructuredCloneValue
 *   ) => boolean
 *   valid?: true
 * }}
 */
const dateType = {
  option: ['Date'],
  // ISO Date string
  dateRegex: /^(?:\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d)$/u, // ([+-][0-2]\d:[0-5]\d|Z)
  // /^(?:\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}\.\d{3}Z)?|(?:\+|-)\d{6}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)$/u,
  stringRegex () {
    const regex = this.dateRegex;
    if (!this.valid) {
      const {source} = regex;
      return new RegExp('^' + '(?:InvalidDate)|' + source.slice(1), 'u');
    }
    return new RegExp(regex, 'u');
  },
  valueMatch (x) {
    return toStringTag(x) === 'Date';
  },
  toValue (s) {
    return {value: new Date(s)};
  },
  getInput ({root}) {
    return /** @type {HTMLInputElement} */ (
      $e(root, 'input[type="datetime-local"]')
    );
  },
  setValue ({root, value}) {
    const notANum = value && Number.isNaN(value.getTime());
    if (notANum) {
      /** @type {HTMLElement & {$setValidity: SetValidity}} */ (
        $e(root, '.invalidDate')
      ).$setValidity(true);
      return;
    }

    const dateStr = new Date(Date.parse(value)).toISOString();
    /* istanbul ignore next -- See below */
    /* istanbul ignore next -- 6 digits year not reliable through `Date.parse` */
    this.getInput({root}).value = dateStr.length === 24
      ? dateStr.slice(0, -8)
      /* istanbul ignore next -- 6 digits year not reliable through `Date.parse` */
      : dateStr.slice(3, 13); // Will cut off ten/hundred thousand years
  },
  validate ({root}) {
    if (this.isInvalid({root})) {
      return {
        valid: true
      };
    }
    const val = this.getInput({root}).value;
    if (!val) {
      return {
        valid: false,
        message: 'Must not be empty`'
      };
    }

    return {
      valid: new RegExp(this.dateRegex, 'u').test(val),
      message: 'Must match a valid date'
    }; // Input shouldn't allow anyways
  },
  isInvalid ({root}) {
    return !this.valid && /** @type {HTMLInputElement} */ (
      $e(root, '.invalidDate')
    ).checked;
  },
  getValue ({root}) {
    if (this.isInvalid({root})) {
      return /** @type {import('../types.js').ToValue} */ (
        this.toValue
      )('NaN').value;
    }
    return /** @type {import('../types.js').ToValue} */ (
      this.toValue
    )(this.getInput({root}).value).value;
  },
  isValueInvalid (value) {
    return value && Number.isNaN(value.getTime());
  },
  viewUI ({value, specificSchemaObject}) {
    return !this.valid && this.isValueInvalid(value)
      ? ['i', {
        dataset: {type: 'date'}, class: 'InvalidDate',
        title: specificSchemaObject?.description ?? '(an InvalidDate)'
      }, ['InvalidDate']]
      : ['i', {
        dataset: {type: 'date'}, class: 'ValidDate',
        title: specificSchemaObject?.description ?? '(a `Date`)'
      }, [
        value.toISOString().slice(0, -8)
      ]];
  },
  // Change to default to `new Date()` when can't be `NaN`
  //   value (keys)?
  editUI ({typeNamespace, specificSchemaObject, types, value}) {
    const dateSchemaObject = /** @type {import('zodex').SzDate} */ (
      specificSchemaObject
    );
    const val = value ?? (specificSchemaObject?.defaultValue
      ? new Date(specificSchemaObject?.defaultValue)
      : '');
    const notANum = this.isValueInvalid(val);
    const invalid = this.valid
      ? ''
      : jml('div', [
        ['label', [
          'Invalid date',
          ['input', {
            type: 'checkbox',
            class: 'invalidDate',
            checked: notANum,
            name: `${typeNamespace}-invalidDate`,
            $custom: {
              /**
               * @type {SetValidity}
               */
              $setValidity (legitimateInvalid) {
                // console.log('legitimateInvalid', legitimateInvalid);
                if (legitimateInvalid === true) {
                  /**
                   * @type {HTMLInputElement & {
                   *   $setValidity: SetValidity
                   * }}
                   */ (
                    this
                  ).checked = true;
                }
                const label = /** @type {HTMLLabelElement} */ (
                  /** @type {HTMLDivElement} */ (
                    invalid
                  ).previousElementSibling
                );
                label.hidden = Boolean(legitimateInvalid);
                const root = /** @type {HTMLDivElement} */ (
                  label.parentElement
                );
                types.validate({type: 'date', root});
              }
            },
            $on: {
              click (/* e */) {
                /** @type {HTMLInputElement & {$setValidity: SetValidity}} */ (
                  this
                ).$setValidity(/** @type {HTMLInputElement} */ (
                  this
                ).checked);
              }
            }
          }]
        ]]
      ]);
    return ['div', {
      dataset: {type: this.valid ? 'ValidDate' : 'date'},
      title: specificSchemaObject?.description ?? 'Date'
    }, [
      ['label', {
        hidden: notANum
      }, [
        'Date: ',
        ['input', {
          name: `${typeNamespace}-date`,
          type: 'datetime-local',
          // Required yyyy-MM-dd format
          value: !val || notANum
            ? ''
            : val.toISOString().slice(0, -8),
          min: dateSchemaObject?.min
            ? new Date(dateSchemaObject.min).toISOString().slice(0, -8)
            : undefined,
          max: dateSchemaObject?.max
            ? new Date(dateSchemaObject.max).toISOString().slice(0, -8)
            : undefined
        }]
      ]],
      invalid
    ]];
  }
};

export default dateType;
