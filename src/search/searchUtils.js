import {schemaLabel} from '../utils/schemaMeta.js';
import {getJSONPointerParts} from '../utils/jsonPointer.js';

/**
 * @typedef {import('../types.js').JamilihArray} JamilihArray
 */

/**
 * Label for a leaf/container's own control, preferring the schema's own
 * `meta.title`/`meta.description`/`description` (via `schemaLabel`, same
 * precedence the value-editing side uses) and falling back to the JSON
 * Pointer path's final segment so every control still has a legible label
 * even when the schema carries no metadata.
 * @param {import('../formats/schema.js').ZodexSchema|undefined} schemaObject
 * @param {string} path
 * @returns {string}
 */
export function buildPathLabel (schemaObject, path) {
  const label = schemaLabel(schemaObject);
  if (label) {
    return label;
  }
  const parts = getJSONPointerParts(path);
  return parts.length ? String(parts.at(-1)) : path;
}

/**
 * A "from"/"to" pair of native inputs sharing one `type`, for the OR-range/
 * Is-Not-Range README affordance (number/bigint/buffersource; `date` uses
 * `dateType.js`'s own `buildDateInputControl` instead, since a
 * `datetime-local` input needs its own ISO-slicing). The two inputs are
 * named `${name}-gte`/`${name}-lte` so a leaf's `getQuery` can read them
 * back without any further disambiguation.
 * @param {{
 *   name: string,
 *   type?: string,
 *   min?: string|number,
 *   max?: string|number,
 *   step?: string|number
 * }} cfg
 * @returns {JamilihArray[]}
 */
export function buildRangeInputsPair ({
  name, type = 'number', min, max, step
}) {
  return [
    ['label', [
      'From: ',
      ['input', {name: `${name}-gte`, type, min, max, step}]
    ]],
    ['label', [
      'To: ',
      ['input', {name: `${name}-lte`, type, min, max, step}]
    ]]
  ];
}

/**
 * A `<select multiple>` populated from a fixed candidate list - used by
 * `enum`/`multiSelect`/`literalSet` leaf controls (README: "multiple
 * select").
 * @param {{
 *   name: string,
 *   options: (string|[value: string, title: string])[]
 * }} cfg
 * @returns {JamilihArray}
 */
export function buildMultiSelect ({name, options}) {
  return ['select', {name, multiple: true}, options.map((opt) => {
    const [value, title] = Array.isArray(opt) ? opt : [opt, opt];
    return ['option', {value}, [title]];
  })];
}

/**
 * A tri-state "has property" control for one already-chosen property name
 * (README: "Has property &lt;property pull-down&gt;", "avoid listing
 * required"). `objectSearchType.js` supplies the additive pull-down that
 * lets a user pick *which* property to add one of these for; this helper is
 * only the fixed per-property toggle it adds each time, so the "any" state
 * (no constraint entered) is distinguishable from an explicit "has"/
 * "doesn't have" - matching `SearchTypeObject.getQuery`'s
 * `undefined`-means-"no constraint" convention.
 * @param {{name: string, propertyName: string}} cfg
 * @returns {JamilihArray}
 */
export function buildHasPropertyToggle ({name, propertyName}) {
  return ['label', [
    `Has property "${propertyName}": `,
    ['select', {name}, [
      ['option', {value: ''}, ['(any)']],
      ['option', {value: 'true'}, ['Has']],
      ['option', {value: 'false'}, ['Doesn’t have']]
    ]]
  ]];
}

/**
 * A generic "(any)"/true/false `<select>`, shared by every leaf whose only
 * constraint is a plain boolean choice - `booleanSearchType.js`'s "true or
 * false" (README) and `numberSearchType.js`'s "Is/Is Not Integer" both read
 * back through this same three-way convention rather than each rolling
 * their own.
 * @param {{name: string, trueLabel: string, falseLabel: string}} cfg
 * @returns {JamilihArray}
 */
export function buildTriStateSelect ({name, trueLabel, falseLabel}) {
  return ['select', {name}, [
    ['option', {value: ''}, ['(any)']],
    ['option', {value: 'true'}, [trueLabel]],
    ['option', {value: 'false'}, [falseLabel]]
  ]];
}

/**
 * Reads back a `buildTriStateSelect`, `''` (any) mapping to `undefined`.
 * @param {HTMLElement} el
 * @param {string} name
 * @returns {boolean|undefined}
 */
export function readTriStateSelect (el, name) {
  const select = /** @type {HTMLSelectElement|null} */ (
    el.querySelector(`select[name="${CSS.escape(name)}"]`)
  );
  if (!select || select.value === '') {
    return undefined;
  }
  return select.value === 'true';
}

/**
 * A single "Require this path to be present" checkbox - the only search
 * affordance the README grants `undefined`/`void`/`null`/`NaN` (they have
 * "no variants to allow for distinct search"), since existence only becomes
 * a meaningful question once the path is optional or nested in a union.
 * @param {{name: string}} cfg
 * @returns {JamilihArray}
 */
export function buildPresenceCheckbox ({name}) {
  return ['label', [
    'Require present: ',
    ['input', {type: 'checkbox', name}]
  ]];
}

/**
 * Reads back a `buildPresenceCheckbox`.
 * @param {HTMLElement} el
 * @param {string} name
 * @returns {boolean}
 */
export function readPresenceCheckbox (el, name) {
  return Boolean(/** @type {HTMLInputElement|null} */ (
    el.querySelector(`input[name="${CSS.escape(name)}"]`)
  )?.checked);
}

/**
 * The mode selector for the README's "string, StringObject, Blob, File,
 * regexp (source), symbol (description): OR literal or regex search/Does
 * Not contain search" - one shared control (and reader, below) that
 * `stringSearchType.js`, `symbolSearchType.js`, and `regexpSearchType.js`
 * (for its source) each build their own custom element around, since the
 * query semantics are identical and only the label/target facet differs.
 * @param {{name: string}} cfg
 * @returns {JamilihArray}
 */
export function buildLiteralRegexControls ({name}) {
  return ['span', [
    ['label', [
      'Mode: ',
      ['select', {name: `${name}-mode`}, [
        ['option', {value: 'literal'}, ['One of (comma-separated)']],
        ['option', {value: 'regex'}, ['Matches regex']],
        ['option', {value: 'notContains'}, ['Does not contain']]
      ]]
    ]],
    ['label', [
      'Value: ',
      ['input', {type: 'text', name: `${name}-value`}]
    ]]
  ]];
}

/**
 * Reads back `buildLiteralRegexControls` into the corresponding
 * `literalSet`/`regex`/`notContains` leaf.
 * @param {HTMLElement} el
 * @param {{name: string, path: string}} cfg
 * @returns {import('./queryTree.js').QueryLiteralSetLeaf|
 *   import('./queryTree.js').QueryRegexLeaf|
 *   import('./queryTree.js').QueryNotContainsLeaf|undefined}
 */
export function readLiteralRegexQuery (el, {name, path}) {
  const mode = /** @type {HTMLSelectElement|null} */ (
    el.querySelector(`select[name="${CSS.escape(name)}-mode"]`)
  )?.value;
  const value = /** @type {HTMLInputElement|null} */ (
    el.querySelector(`input[name="${CSS.escape(name)}-value"]`)
  )?.value;
  if (!value) {
    return undefined;
  }
  if (mode === 'regex') {
    return {kind: 'regex', path, $regex: value};
  }
  if (mode === 'notContains') {
    return {kind: 'notContains', path, value};
  }
  return {
    kind: 'literalSet',
    path,
    $in: value.split(',').map((v) => v.trim()).filter(Boolean)
  };
}

/**
 * Has length/size of &lt;number&gt; (README; array/set/tuple-with-rest/
 * filelist), + "Is/Is not sparse" for arrays only. Returns `[]` (no
 * control) when the schema pins an exact length/size, since searching on a
 * constant is uninteresting - the schema's `min`/`max` otherwise become the
 * input's HTML `min`/`max` attributes.
 * @param {{
 *   name: string,
 *   min?: number,
 *   max?: number,
 *   includeSparse?: boolean
 * }} cfg
 * @returns {JamilihArray[]}
 */
export function buildLengthSizeControls ({name, min, max, includeSparse}) {
  const fixed = min !== undefined && min === max;
  /** @type {JamilihArray[]} */
  const controls = [];
  if (!fixed) {
    controls.push(['label', [
      'Has length/size of: ',
      ['input', {type: 'number', name: `${name}-size`, min, max, step: 1}]
    ]]);
  }
  if (includeSparse) {
    controls.push(['label', [
      'Sparse: ',
      buildTriStateSelect({
        name: `${name}-sparse`, trueLabel: 'Sparse', falseLabel: 'Not sparse'
      })
    ]]);
  }
  return controls;
}

/**
 * Reads back `buildLengthSizeControls` into one `lengthSize` leaf, or
 * `undefined` if neither the size nor the sparse control was set.
 * @param {HTMLElement} el
 * @param {{name: string, path: string}} cfg
 * @returns {import('./queryTree.js').QueryLengthSizeLeaf|undefined}
 */
export function readLengthSizeQuery (el, {name, path}) {
  const sizeStr = /** @type {HTMLInputElement|null} */ (
    el.querySelector(`input[name="${CSS.escape(name)}-size"]`)
  )?.value;
  const sparseCheck = readTriStateSelect(el, `${name}-sparse`);
  if (!sizeStr && sparseCheck === undefined) {
    return undefined;
  }
  return {
    kind: 'lengthSize',
    path,
    ...(sizeStr ? {$size: Number(sizeStr)} : {}),
    ...(sparseCheck === undefined ? {} : {sparseCheck})
  };
}
