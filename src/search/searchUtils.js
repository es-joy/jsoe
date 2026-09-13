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
 * Finds a control belonging directly to `root`'s own widget - as opposed to
 * one belonging to a search widget recursively nested inside it (e.g.
 * `arraySearchType.js`'s own "size" input vs. a nested array-of-arrays'
 * element widget's own "size" input, both reachable from `root` via a plain
 * `querySelectorAll`). A match only counts if the nearest ancestor of the
 * match carrying `data-search-path` is `root` itself; every search element
 * carries that attribute (`searchElementUtils.js`'s `findSearchElement`), so
 * this reliably stops at the first nested search element's boundary.
 *
 * This is also why every `build*`/`read*` pair below reads its class-based
 * selector back through this helper rather than a raw
 * `root.querySelector(...)`: a fixed class name is safe to reuse across
 * every instance of a given control on the page precisely because lookups
 * are always scoped this way, and - unlike a `name` built from a
 * `typeNamespace` closed over inside a `$define` mixin, which is installed
 * once on the shared custom-element prototype the first time a tag is
 * defined - nothing here depends on a per-instance closure at all.
 * @param {HTMLElement} root
 * @param {string} selector
 * @returns {HTMLElement|undefined}
 */
export function findOwnControl (root, selector) {
  return /** @type {HTMLElement[]} */ (
    [...root.querySelectorAll(selector)]
  ).find((el) => el.closest('[data-search-path]') === root);
}

/**
 * A "from"/"to" pair of native inputs sharing one `type`, for the OR-range/
 * Is-Not-Range README affordance (number/bigint/buffersource; `date` uses
 * `dateType.js`'s own `buildDateInputControl` instead, since a
 * `datetime-local` input needs its own ISO-slicing).
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
      ['input', {name: `${name}-gte`, class: 'jsoeSearchRangeGte', type, min, max, step}]
    ]],
    ['label', [
      'To: ',
      ['input', {name: `${name}-lte`, class: 'jsoeSearchRangeLte', type, min, max, step}]
    ]]
  ];
}

/**
 * Reads back a `buildRangeInputsPair`.
 * @param {HTMLElement} el
 * @returns {{gte: string, lte: string}}
 */
export function readRangeInputsPair (el) {
  const gte = /** @type {HTMLInputElement|undefined} */ (
    findOwnControl(el, 'input.jsoeSearchRangeGte')
  )?.value ?? '';
  const lte = /** @type {HTMLInputElement|undefined} */ (
    findOwnControl(el, 'input.jsoeSearchRangeLte')
  )?.value ?? '';
  return {gte, lte};
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
  return ['select', {name, multiple: true, class: 'jsoeSearchMultiSelect'}, options.map((opt) => {
    const [value, title] = Array.isArray(opt) ? opt : [opt, opt];
    return ['option', {value}, [title]];
  })];
}

/**
 * Reads back a `buildMultiSelect` into the selected values, `[]` if none.
 * @param {HTMLElement} el
 * @returns {string[]}
 */
export function readMultiSelect (el) {
  const select = /** @type {HTMLSelectElement|undefined} */ (
    findOwnControl(el, 'select.jsoeSearchMultiSelect')
  );
  return [...(select?.selectedOptions ?? [])].map((opt) => opt.value);
}

/**
 * A tri-state "has property" control for one already-chosen property name
 * (README: "Has property &lt;property pull-down&gt;", "avoid listing
 * required"). `objectSearchType.js` supplies the additive pull-down that
 * lets a user pick *which* property to add one of these for; this helper is
 * only the fixed per-property toggle it adds each time, so the "any" state
 * (no constraint entered) is distinguishable from an explicit "has"/
 * "doesn't have" - matching `SearchTypeObject.getQuery`'s
 * `undefined`-means-"no constraint" convention. Shares `readTriStateSelect`
 * with `buildTriStateSelect` below - same three-value shape, just different
 * option labels.
 * @param {{name: string, propertyName: string}} cfg
 * @returns {JamilihArray}
 */
export function buildHasPropertyToggle ({name, propertyName}) {
  return ['label', [
    `Has property "${propertyName}": `,
    ['select', {name, class: 'jsoeSearchTriState'}, [
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
  return ['select', {name, class: 'jsoeSearchTriState'}, [
    ['option', {value: ''}, ['(any)']],
    ['option', {value: 'true'}, [trueLabel]],
    ['option', {value: 'false'}, [falseLabel]]
  ]];
}

/**
 * Reads back a `buildTriStateSelect`/`buildHasPropertyToggle`, `''` (any)
 * mapping to `undefined`.
 * @param {HTMLElement} el
 * @returns {boolean|undefined}
 */
export function readTriStateSelect (el) {
  const select = /** @type {HTMLSelectElement|undefined} */ (
    findOwnControl(el, 'select.jsoeSearchTriState')
  );
  if (!select || select.value === '') {
    return undefined;
  }
  return select.value === 'true';
}

/**
 * A single checkbox - the only search affordance the README grants
 * `undefined`/`void`/`null`/`NaN` ("Require present"; they have "no
 * variants to allow for distinct search", since existence only becomes a
 * meaningful question once the path is optional or nested in a union), and
 * also used by `recordSearchType.js` for its "require same entry" toggle.
 * @param {{name: string, label: string}} cfg
 * @returns {JamilihArray}
 */
export function buildCheckbox ({name, label}) {
  return ['label', [
    `${label}: `,
    ['input', {type: 'checkbox', name, class: 'jsoeSearchCheckbox'}]
  ]];
}

/**
 * Reads back a `buildCheckbox`.
 * @param {HTMLElement} el
 * @returns {boolean}
 */
export function readCheckbox (el) {
  return Boolean(/** @type {HTMLInputElement|undefined} */ (
    findOwnControl(el, 'input.jsoeSearchCheckbox')
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
      ['select', {name: `${name}-mode`, class: 'jsoeSearchMode'}, [
        ['option', {value: 'literal'}, ['One of (comma-separated)']],
        ['option', {value: 'regex'}, ['Matches regex']],
        ['option', {value: 'notContains'}, ['Does not contain']]
      ]]
    ]],
    ['label', [
      'Value: ',
      ['input', {type: 'text', name: `${name}-value`, class: 'jsoeSearchValue'}]
    ]]
  ]];
}

/**
 * Reads back `buildLiteralRegexControls` into the corresponding
 * `literalSet`/`regex`/`notContains` leaf.
 * @param {HTMLElement} el
 * @param {string} path
 * @returns {import('./queryTree.js').QueryLiteralSetLeaf|
 *   import('./queryTree.js').QueryRegexLeaf|
 *   import('./queryTree.js').QueryNotContainsLeaf|undefined}
 */
export function readLiteralRegexQuery (el, path) {
  const mode = /** @type {HTMLSelectElement|undefined} */ (
    findOwnControl(el, 'select.jsoeSearchMode')
  )?.value;
  const value = /** @type {HTMLInputElement|undefined} */ (
    findOwnControl(el, 'input.jsoeSearchValue')
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
      ['input', {
        type: 'number', name: `${name}-size`, class: 'jsoeSearchSize',
        min, max, step: 1
      }]
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
 * @param {string} path
 * @returns {import('./queryTree.js').QueryLengthSizeLeaf|undefined}
 */
export function readLengthSizeQuery (el, path) {
  const sizeStr = /** @type {HTMLInputElement|undefined} */ (
    findOwnControl(el, 'input.jsoeSearchSize')
  )?.value;
  const sparseCheck = readTriStateSelect(el);
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
