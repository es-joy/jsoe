import {
  buildPathLabel, buildCheckbox, readCheckbox, findOwnControl, extractLeafOfKind
} from '../searchUtils.js';
import {makeMultiSelectLeaf} from '../queryTreeBuilders.js';
import {getQueryViaElement, applyQueryViaElement} from '../searchElementUtils.js';

/**
 * @typedef {import('../searchDispatch.js').SearchTypeObject} SearchTypeObject
 */

/**
 * A literal value option's own display label - the value itself (matching
 * `deriveXorBranchLabel`'s (`src/typeChoices.js`) own `literal` case),
 * truncated to a fixed length, since it's the actual value the user is
 * picking to search for, not a category standing in for it. A `string`
 * value is quoted and a `bigint` value suffixed with `n` (real JS literal
 * syntax for each) so a mixed-type literal's options stay visually
 * distinguishable at a glance (e.g. the string `"2"` next to the number
 * `2`), rather than every JS type printing identically via a bare
 * `String(value)`.
 * @type {number}
 */
const MAX_LITERAL_VALUE_LABEL_LENGTH = 40;

/**
 * @param {unknown} value
 * @returns {string}
 */
function labelForLiteralValue (value) {
  const str = typeof value === 'string'
    ? JSON.stringify(value)
    : typeof value === 'bigint'
      ? `${value}n`
      : String(value);
  return str.length > MAX_LITERAL_VALUE_LABEL_LENGTH
    ? `${str.slice(0, MAX_LITERAL_VALUE_LABEL_LENGTH)}…`
    : str;
}

/**
 * A literal's own values are plain JS primitives (`string`/`number`/
 * `boolean`/`bigint`/`null`/`undefined`), not all of which round-trip
 * through `JSON.stringify`/`JSON.parse` (`bigint` throws; a bare
 * `JSON.stringify(undefined)` is the `undefined` value itself, not a
 * string) - so each option instead carries its own JS type tag alongside a
 * plain string form, decoded explicitly here rather than via JSON.
 * `bigint` is kept as a decimal string on read-back (matching
 * `bigintSearchType.js`'s own JSON-serializable convention), not a real
 * `BigInt` (which itself isn't JSON-serializable for the query tree as a
 * whole).
 * @param {unknown} value
 * @returns {{type: string, str: string}}
 */
function encodeLiteralValue (value) {
  return value === null
    ? {type: 'null', str: ''}
    : value === undefined
      ? {type: 'undefined', str: ''}
      : {type: typeof value, str: String(value)};
}

/**
 * The inverse of `encodeLiteralValue`.
 * @param {string} type
 * @param {string} str
 * @returns {unknown}
 */
function decodeLiteralValue (type, str) {
  switch (type) {
  case 'null':
    return null;
  case 'undefined':
    return undefined;
  case 'number':
    return Number(str);
  case 'boolean':
    return str === 'true';
  // 'string'/'bigint' (see `encodeLiteralValue`'s own doc)
  default:
    return str;
  }
}

/**
 * Literal (README): every value a literal schema can ever hold is already
 * fully known from the schema itself. A single-value literal is presence-
 * only - like `undefined`/`null`/`NaN` (`makePresenceOnlySearchType`'s own
 * doc) - since there is nothing left to search against once the one
 * possible value is known to be present. A multi-value literal (e.g.
 * `z.literal(['red', 'green'])`, or one whose values span more than one JS
 * type, e.g. `z.literal(['a', 1])`) instead offers a multi-select of every
 * possible value (one option per value, not per JS type, so the user can
 * search for a *particular* literal - or several, `$in`-combined), each
 * labelled by the value itself (`labelForLiteralValue`), truncated, never a
 * type name or a bare index.
 *
 * Both shapes share the same tag (`jsoe-search-literal`) and `$define`
 * methods (installed once, on the shared custom-element prototype, the
 * first time the tag is defined - never per instance), so `getQuery`/
 * `applyQuery` detect which shape a given instance built by checking for
 * the multi-select's own `<select>` at call time, rather than closing over
 * which shape `buildUI` chose for that one instance.
 * @type {SearchTypeObject}
 */
const literalSearchType = {
  buildUI ({schemaObject, path, typeNamespace}) {
    const label = buildPathLabel(schemaObject, path);
    const name = `${typeNamespace}-literal`;
    const {values} = /** @type {import('zodexy').SzLiteral<any>} */ (
      schemaObject
    );

    return ['jsoe-search-literal', {
      dataset: {searchPath: path, searchKind: 'literal'},
      title: label,
      $define: {
        /** @this {HTMLElement} */
        getQuery () {
          const searchPath = this.dataset.searchPath ??
            /* istanbul ignore next -- Guard: buildUI always sets dataset.searchPath */
            '';
          const select = /** @type {HTMLSelectElement|undefined} */ (
            findOwnControl(this, 'select.jsoeSearchLiteralValues')
          );
          if (select) {
            const selected = [...select.selectedOptions].map((opt) => (
              decodeLiteralValue(
                opt.dataset.valueType ??
                  /* istanbul ignore next -- Guard: buildUI always sets dataset.valueType on every option */
                  '',
                opt.dataset.valueStr ??
                  /* istanbul ignore next -- Guard: buildUI always sets dataset.valueStr on every option */
                  ''
              )
            ));
            return selected.length
              ? makeMultiSelectLeaf(searchPath, {$in: selected})
              : undefined;
          }
          const checked = readCheckbox(this);
          /* istanbul ignore if -- Guard: the checkbox is permanently checked and disabled */
          // eslint-disable-next-line unicorn/prefer-ternary -- Guard clause clearer than a nested ternary
          if (!checked) {
            return undefined;
          }
          return {kind: 'presence', path: searchPath, $exists: true};
        },
        /**
         * @this {HTMLElement}
         * @param {import('../queryTree.js').QueryNode|undefined} queryNode
         * @returns {void}
         */
        applyQuery (queryNode) {
          const select = /** @type {HTMLSelectElement|undefined} */ (
            findOwnControl(this, 'select.jsoeSearchLiteralValues')
          );
          // The presence-only shape's checkbox is permanently checked and
          //   `disabled` - nothing for a raw query to change there either
          //   way (same as `makePresenceOnlySearchType`'s own `applyQuery`).
          if (!select) {
            return;
          }
          const {matched} = extractLeafOfKind(queryNode, 'multiSelect');
          const wanted = matched?.$in ?? [];
          [...select.options].forEach((opt) => {
            const decoded = decodeLiteralValue(
              opt.dataset.valueType ??
                /* istanbul ignore next -- Guard: buildUI always sets dataset.valueType on every option */
                '',
              opt.dataset.valueStr ??
                /* istanbul ignore next -- Guard: buildUI always sets dataset.valueStr on every option */
                ''
            );
            opt.selected = wanted.includes(decoded);
          });
        }
      }
    }, [
      ['span', {class: 'searchLabel'}, [label]],
      values.length <= 1
        ? buildCheckbox({
          name, label: `Require ${label} present`, checked: true, disabled: true
        })
        : ['select', {
          name, multiple: true, required: true, class: 'jsoeSearchLiteralValues'
        }, [
          ...values.map((/** @type {unknown} */ value, idx) => {
            const {type, str} = encodeLiteralValue(value);
            return ['option', {
              value: String(idx), dataset: {valueType: type, valueStr: str}
            }, [labelForLiteralValue(value)]];
          })
        ]]
    ]];
  },
  getQuery: getQueryViaElement,
  applyQuery: applyQueryViaElement
};

export default literalSearchType;
