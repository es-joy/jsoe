import {buildDateInputControl} from '../../fundamentalTypes/dateType.js';
import {buildPathLabel, buildTriStateSelect, readTriStateSelect} from '../searchUtils.js';
import {makeRangeLeaf, makeValidDateCheckLeaf, combineAnd} from '../queryTreeBuilders.js';
import {getQueryViaElement} from '../searchElementUtils.js';

/**
 * @typedef {import('../searchDispatch.js').SearchTypeObject} SearchTypeObject
 */

/**
 * Reads the two `datetime-local` inputs directly off the element rather
 * than off any closed-over reference, since a custom element's mixin
 * methods (`$define`, search plan §8) are installed once on the shared
 * prototype the first time the tag is defined - every instance must read
 * its own state off `this`, never off a build-time closure variable.
 * @param {Element} el
 * @returns {{gte: string, lte: string}}
 */
function readInputs (el) {
  const [gteInput, lteInput] = /** @type {HTMLInputElement[]} */ (
    [...el.querySelectorAll('input[type="datetime-local"]')]
  );
  return {gte: gteInput.value, lte: lteInput.value};
}

/**
 * Cross-validates the pair the same way `searchUtils.js`'s
 * `buildRangeInputsPair` does for its own (numeric) range pairs: leaving
 * both ends blank is invalid (an added range row needs *some* bound, same
 * "no absent values" reasoning as `buildLiteralRegexControls`'s Value
 * input - not an issue while the "Invalid date" tri-state disables this
 * whole fieldset, since a disabled field is excluded from constraint
 * validation entirely), and if both ends are filled with "To" before
 * "From", that's invalid too. `datetime-local` values (`YYYY-MM-DDTHH:mm`)
 * compare correctly as plain strings, so no `Date` parsing is needed here.
 * @this {HTMLElement}
 * @returns {void}
 */
function validateRange () {
  const root = this.closest('jsoe-search-date');
  if (!root) {
    return;
  }
  const {gte, lte} = readInputs(root);
  const [gteInput, lteInput] = /** @type {HTMLInputElement[]} */ (
    [...root.querySelectorAll('input[type="datetime-local"]')]
  );
  const bothEmpty = gte === '' && lte === '';
  const outOfOrder = gte !== '' && lte !== '' && lte < gte;
  const emptyMessage = 'Enter at least one bound (From or To).';
  gteInput.setCustomValidity(bothEmpty ? emptyMessage : '');
  let lteMessage = '';
  if (bothEmpty) {
    lteMessage = emptyMessage;
  } else if (outOfOrder) {
    lteMessage = 'End of range must not be before the start of the range.';
  }
  lteInput.setCustomValidity(lteMessage);
}

/**
 * OR date range/Is Not Range, Is/Is not a valid date (README) -
 * `dateType.js`'s own `buildDateInputControl` is reused twice (range start/
 * end) so the min/max wiring and ISO-slicing stay in one place. Choosing
 * "Invalid date" disables the range fieldset (an "Invalid Date" has no
 * orderable time value to compare - same as `dateType.js`'s own
 * `notANum`/`ValidDate`/`InvalidDate` handling treating it as a distinct
 * state from an ordinary `Date`), producing a `validDateCheck` leaf
 * (`queryTreeBuilders.js`) instead of/alongside the range leaf.
 * @type {SearchTypeObject}
 */
const dateSearchType = {
  buildUI ({schemaObject, path, typeNamespace}) {
    const label = buildPathLabel(schemaObject, path);
    const dateSchemaObject = /** @type {import('zodexy').SzDate} */ (
      schemaObject
    );
    const name = `${typeNamespace}-date`;
    return ['jsoe-search-date', {
      dataset: {searchPath: path, searchKind: 'date'},
      title: label,
      $define: {
        /** @this {HTMLElement} */
        getQuery () {
          const searchPath = this.dataset.searchPath ?? '';
          const validCheck = readTriStateSelect(this, 'valid');
          const validLeaf = validCheck === undefined
            ? undefined
            : makeValidDateCheckLeaf(searchPath, validCheck);
          const {gte, lte} = readInputs(this);
          const rangeLeaf = validCheck === false || (!gte && !lte)
            ? undefined
            : makeRangeLeaf(searchPath, 'date', {
              ...(gte ? {$gte: new Date(gte).toISOString()} : {}),
              ...(lte ? {$lte: new Date(lte).toISOString()} : {})
            });
          return combineAnd([validLeaf, rangeLeaf]);
        }
      }
    }, [
      ['span', {class: 'searchLabel'}, [label]],
      ['label', [
        'Valid: ',
        buildTriStateSelect({
          name: `${name}-valid`, key: 'valid', trueLabel: 'Valid date',
          falseLabel: 'Invalid date',
          /** @this {HTMLElement} */
          onChange () {
            const fieldset = this.closest('jsoe-search-date')?.querySelector(
              'fieldset.searchDateRangeFieldset'
            );
            if (fieldset) {
              /** @type {HTMLFieldSetElement} */ (fieldset).disabled =
                /** @type {HTMLSelectElement} */ (this).value === 'false';
            }
          }
        })
      ]],
      ['fieldset', {class: 'searchDateRangeFieldset'}, [
        ['label', [
          'From: ',
          buildDateInputControl({
            name: `${name}-gte`, dateSchemaObject, onValidate: validateRange
          })
        ]],
        ['label', [
          'To: ',
          buildDateInputControl({
            name: `${name}-lte`, dateSchemaObject, onValidate: validateRange
          })
        ]]
      ]]
    ]];
  },
  getQuery: getQueryViaElement
};

export default dateSearchType;
