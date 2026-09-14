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
 * @param {Element} root
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
 *
 * `key` distinguishes multiple range pairs *within one widget* (e.g.
 * `domrectSearchType.js`'s `x`/`y`/`width`/`height` dimensions, or
 * `errorSearchType.js`'s `lineNumber`/`columnNumber`): `findOwnControl`
 * already isolates one widget's controls from another's, but can't tell
 * apart two same-class controls belonging to the *same* widget, so those
 * need distinct classes. Leave it at the default `''` for the common case
 * of a widget with only one range pair.
 *
 * Cross-validates the pair via the native Constraint Validation API,
 * surfaced by `jsoe.css`'s `input:invalid` styling and a real `<form>`'s
 * `reportValidity`/`checkValidity` (`src/search/index.js`): leaving *both*
 * ends blank is invalid - the same "no absent values" reasoning
 * `buildLiteralRegexControls`'s Value input documents, an added range row
 * needs at least one bound to mean anything - and if both ends are filled
 * with "To" less than "From", that's invalid too. An open-ended range (only
 * one end filled) stays valid. A row nested under an
 * `objectSearchType.js` required-property's opt-in `<fieldset disabled>`
 * (or, for `dateSearchType.js`'s own equivalent pair, its own
 * "Invalid date" fieldset) is unaffected either way, since a disabled field
 * is excluded from constraint validation entirely. `dateSearchType.js`'s
 * own `datetime-local` pair needs the same two checks but isn't built
 * through this helper (`buildDateInputControl` handles its own
 * ISO-slicing), so it wires an equivalent handler itself.
 * @param {{
 *   name: string,
 *   key?: string,
 *   type?: string,
 *   min?: string|number,
 *   max?: string|number,
 *   step?: string|number
 * }} cfg
 * @returns {JamilihArray[]}
 */
export function buildRangeInputsPair ({
  name, key = '', type = 'number', min, max, step
}) {
  /**
   * `this` is whichever of the pair fired the event - looked up fresh via
   * `findOwnControl` rather than closed over, so it stays correct however
   * many `buildRangeInputsPair` pairs (of possibly-differing `key`s) end up
   * sharing the same widget.
   * @this {HTMLElement}
   * @returns {void}
   */
  function validateRange () {
    const root = this.closest('[data-search-path]');
    if (!root) {
      return;
    }
    const gteEl = /** @type {HTMLInputElement|undefined} */ (
      findOwnControl(root, `input.jsoeSearchRangeGte--${key}`)
    );
    const lteEl = /** @type {HTMLInputElement|undefined} */ (
      findOwnControl(root, `input.jsoeSearchRangeLte--${key}`)
    );
    if (!gteEl || !lteEl) {
      return;
    }
    const bothEmpty = gteEl.value === '' && lteEl.value === '';
    const outOfOrder = gteEl.value !== '' && lteEl.value !== '' &&
      Number(lteEl.value) < Number(gteEl.value);
    const emptyMessage = 'Enter at least one bound (From or To).';
    gteEl.setCustomValidity(bothEmpty ? emptyMessage : '');
    let lteMessage = '';
    if (bothEmpty) {
      lteMessage = emptyMessage;
    } else if (outOfOrder) {
      lteMessage = 'End of range must not be less than the start of the range.';
    }
    lteEl.setCustomValidity(lteMessage);
  }
  return [
    ['label', [
      'From: ',
      ['input', {
        name: `${name}-gte`, class: `jsoeSearchRangeGte--${key}`, type, min, max, step,
        $on: {input: validateRange, change: validateRange}
      }]
    ]],
    ['label', [
      'To: ',
      ['input', {
        name: `${name}-lte`, class: `jsoeSearchRangeLte--${key}`, type, min, max, step,
        $on: {input: validateRange, change: validateRange}
      }]
    ]]
  ];
}

/**
 * Reads back a `buildRangeInputsPair` - pass the same `key` it was built
 * with.
 * @param {HTMLElement} el
 * @param {string} [key]
 * @returns {{gte: string, lte: string}}
 */
export function readRangeInputsPair (el, key = '') {
  const gte = /** @type {HTMLInputElement|undefined} */ (
    findOwnControl(el, `input.jsoeSearchRangeGte--${key}`)
  )?.value ?? '';
  const lte = /** @type {HTMLInputElement|undefined} */ (
    findOwnControl(el, `input.jsoeSearchRangeLte--${key}`)
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
    ['select', {name, class: 'jsoeSearchTriState--'}, [
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
 *
 * `key` distinguishes multiple tri-states *within one widget* (e.g.
 * `dommatrixSearchType.js`'s "Is/Is not Readonly" and "Is/Is not 3d" side
 * by side); see `buildRangeInputsPair`'s doc for why. Leave it at the
 * default `''` for the common case of a widget with only one tri-state.
 * `onChange`, when given, wires the select's own `change` event too (in
 * addition to whatever the caller reads back via `readTriStateSelect` at
 * `getQuery` time) - `dateSearchType.js`'s "Is valid/invalid date" tri-state
 * uses it to disable the (otherwise irrelevant) From/To range while
 * "Invalid date" is selected.
 * @param {{
 *   name: string, key?: string, trueLabel: string, falseLabel: string,
 *   onChange?: (this: HTMLElement) => void
 * }} cfg
 * @returns {JamilihArray}
 */
export function buildTriStateSelect ({name, key = '', trueLabel, falseLabel, onChange}) {
  return ['select', {
    name, class: `jsoeSearchTriState--${key}`,
    $on: onChange ? {change: onChange} : undefined
  }, [
    ['option', {value: ''}, ['(any)']],
    ['option', {value: 'true'}, [trueLabel]],
    ['option', {value: 'false'}, [falseLabel]]
  ]];
}

/**
 * Reads back a `buildTriStateSelect`/`buildHasPropertyToggle` - pass the
 * same `key` it was built with. `''` (any) maps to `undefined`.
 * @param {HTMLElement} el
 * @param {string} [key]
 * @returns {boolean|undefined}
 */
export function readTriStateSelect (el, key = '') {
  const select = /** @type {HTMLSelectElement|undefined} */ (
    findOwnControl(el, `select.jsoeSearchTriState--${key}`)
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
 *
 * `key` distinguishes multiple literal/regex controls *within one widget*
 * (e.g. `errorSearchType.js`'s `message`/`name`/`fileName`/`stack`); see
 * `buildRangeInputsPair`'s doc for why. Leave it at the default `''` for
 * the common case of a widget with only one such control.
 *
 * The Value input is `required`: unlike an untouched range/checkbox/select
 * (whose empty/default state unambiguously means "no constraint"), a mode
 * is always selected here (there is no "(any)" option), so an empty Value
 * next to it is never a meaningful "no constraint" state - it just means
 * the row was added and never finished. That leaves the whole form invalid
 * from the moment such a row exists (`buildSearchChoices`'s `<form>`,
 * `src/search/index.js`) until either a value is entered or (for an
 * `objectSearchType.js` has-property row) the row is removed via its own
 * "Remove" button.
 * @param {{name: string, key?: string}} cfg
 * @returns {JamilihArray}
 */
export function buildLiteralRegexControls ({name, key = ''}) {
  return ['span', [
    ['label', [
      'Mode: ',
      ['select', {name: `${name}-mode`, class: `jsoeSearchMode--${key}`}, [
        ['option', {value: 'literal'}, ['One of (comma-separated)']],
        ['option', {value: 'regex'}, ['Matches regex']],
        ['option', {value: 'notContains'}, ['Does not contain']]
      ]]
    ]],
    ['label', [
      'Value: ',
      ['input', {
        type: 'text', name: `${name}-value`, class: `jsoeSearchValue--${key}`,
        required: true
      }]
    ]]
  ]];
}

/**
 * Reads back `buildLiteralRegexControls` into the corresponding
 * `literalSet`/`regex`/`notContains` leaf - pass the same `key` it was
 * built with.
 * @param {HTMLElement} el
 * @param {string} path
 * @param {string} [key]
 * @returns {import('./queryTree.js').QueryLiteralSetLeaf|
 *   import('./queryTree.js').QueryRegexLeaf|
 *   import('./queryTree.js').QueryNotContainsLeaf|undefined}
 */
export function readLiteralRegexQuery (el, path, key = '') {
  const mode = /** @type {HTMLSelectElement|undefined} */ (
    findOwnControl(el, `select.jsoeSearchMode--${key}`)
  )?.value;
  const value = /** @type {HTMLInputElement|undefined} */ (
    findOwnControl(el, `input.jsoeSearchValue--${key}`)
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
