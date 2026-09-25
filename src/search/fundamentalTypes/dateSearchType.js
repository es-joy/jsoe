import {buildDateInputControl} from '../../fundamentalTypes/dateType.js';
import {
  buildPathLabel, buildTriStateSelect, readTriStateSelect, isExemptedByAncestorHasProperty,
  applyTriState, extractLeafOfKind
} from '../searchUtils.js';
import {makeRangeLeaf, makeValidDateCheckLeaf, combineAnd} from '../queryTreeBuilders.js';
import {getQueryViaElement, applyQueryViaElement} from '../searchElementUtils.js';

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
 * input) - but only while the "Valid: (any)" tri-state is still unset.
 * Once "Valid date" or "Invalid date" is explicitly chosen, that alone is
 * already a complete constraint, so the range goes back to being fully
 * optional (an empty range combined with "Valid date" still means
 * something: "matches any valid date"); "Invalid date" additionally
 * disables the whole fieldset (an "Invalid Date" has no orderable time
 * value to compare), which independently exempts it from constraint
 * validation regardless. If both ends are filled with "To" before "From",
 * that's invalid either way. `datetime-local` values (`YYYY-MM-DDTHH:mm`)
 * compare correctly as plain strings, so no `Date` parsing is needed here.
 * Also called (with `this` as the `<jsoe-search-date>` root itself, which
 * `this.closest('jsoe-search-date')` still resolves to - `closest` checks
 * the element itself first) from the widget's own `connectedCallback` below
 * and from the "Valid" tri-state's own `change` handler (the "at least one
 * bound" requirement itself flips based on that selection, not just the
 * range values) - the same reason `searchUtils.js`'s `syncRangeValidity`
 * gives for `connectedCallback`: the `input`/`change` events wired below
 * only fire from the user's first interaction, so a freshly-built pair
 * would otherwise stay "valid" until then. Also relaxed, independently of
 * its own local "Valid" tri-state, while `isExemptedByAncestorHasProperty`
 * says an enclosing `objectSearchType.js` has-property row's own "Has"/
 * "Doesn't have" already provides a complete constraint (e.g. this is a
 * `date`-typed property's own widget).
 * @this {Element}
 * @returns {void}
 */
function validateRange () {
  const root = this.closest('jsoe-search-date');
  /* istanbul ignore if -- Guard: always within a jsoe-search-date at call time */
  if (!root) {
    return;
  }
  const {gte, lte} = readInputs(root);
  const [gteInput, lteInput] = /** @type {HTMLInputElement[]} */ (
    [...root.querySelectorAll('input[type="datetime-local"]')]
  );
  const requiresBound = readTriStateSelect(root, 'valid') === undefined &&
    !isExemptedByAncestorHasProperty(root);
  const bothEmpty = requiresBound && gte === '' && lte === '';
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
 * The inverse of `readInputs` - `undefined` clears a bound, mirroring
 * `dateType.js`'s own ISO-slicing convention (`toISOString().slice(0, -8)`)
 * used to seed a `datetime-local` input's value from a real `Date`.
 * @param {Element} el
 * @param {string|undefined} gte
 * @param {string|undefined} lte
 * @returns {void}
 */
function applyInputs (el, gte, lte) {
  const [gteInput, lteInput] = /** @type {HTMLInputElement[]} */ (
    [...el.querySelectorAll('input[type="datetime-local"]')]
  );
  gteInput.value = gte === undefined ? '' : new Date(gte).toISOString().slice(0, -8);
  lteInput.value = lte === undefined ? '' : new Date(lte).toISOString().slice(0, -8);
  gteInput.dispatchEvent(new Event('input'));
  lteInput.dispatchEvent(new Event('input'));
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
        connectedCallback () {
          validateRange.call(this);
        },
        /** @this {HTMLElement} */
        getQuery () {
          const searchPath = this.dataset.searchPath ??
            /* istanbul ignore next -- Guard: buildUI always sets dataset.searchPath */
            '';
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
        },
        /**
         * @this {HTMLElement}
         * @param {import('../queryTree.js').QueryNode|undefined} queryNode
         * @returns {void}
         */
        applyQuery (queryNode) {
          const {matched: validLeaf} = extractLeafOfKind(queryNode, 'validDateCheck');
          // Dispatches `change`, which runs the tri-state's own `onChange`
          // (toggling the range fieldset's `disabled` state and re-running
          // `validateRange`) before the range inputs below are set.
          applyTriState(this, validLeaf?.isValid, 'valid');
          const {matched: rangeLeaf} = extractLeafOfKind(queryNode, 'range');
          applyInputs(
            this,
            /** @type {string|undefined} */ (rangeLeaf?.$gte),
            /** @type {string|undefined} */ (rangeLeaf?.$lte)
          );
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
            const root = this.closest('jsoe-search-date');
            const fieldset = root?.querySelector('fieldset.searchDateRangeFieldset');
            if (fieldset) {
              /** @type {HTMLFieldSetElement} */ (fieldset).disabled =
                /** @type {HTMLSelectElement} */ (this).value === 'false';
            }
            if (root) {
              validateRange.call(root);
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
  getQuery: getQueryViaElement,
  applyQuery: applyQueryViaElement
};

export default dateSearchType;
