import {schemaLabel} from '../utils/schemaMeta.js';
import {getJSONPointerParts} from '../utils/jsonPointer.js';
import {
  combineAnd, combineOr, makeLiteralSetLeaf, makeRegexLeaf, makeNotContainsLeaf
} from './queryTreeBuilders.js';

/**
 * @typedef {import('../types.js').JamilihArray} JamilihArray
 */

/**
 * Label for a leaf/container's own control, preferring the schema's own
 * `meta.title`/`meta.description`/`description` (via `schemaLabel`, same
 * precedence the value-editing side uses) and falling back to the JSON
 * Pointer path's final segment so every control still has a legible label
 * even when the schema carries no metadata.
 * @param {import('../formats/schema.js').ZodexySchema|undefined} schemaObject
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
 * Whether `el` sits inside an `objectSearchType.js` has-property row whose
 * own "Has"/"Doesn't have" tri-state is *already* explicitly chosen (not
 * "(any)") - if so, that existence assertion alone is already a complete
 * constraint for the row, so a per-field "no absent values" requirement
 * inside it (a range's own "at least one bound", `buildRangeInputsPair`'s
 * doc) should be relaxed. `setDescendantsRequired` handles this for plain
 * `required`-attribute controls, but a range pair's requirement is
 * re-asserted imperatively on every `input`/`change` via `setCustomValidity`
 * (`syncRangeValidity`, `dateSearchType.js`'s own equivalent) - clearing it
 * once wouldn't stick past the next keystroke, so those call this directly,
 * live, instead.
 *
 * Returns `false` (not exempted) when `el` also sits inside a
 * `buildOptInFieldset` fieldset (`jsoeSearchOptInFieldset--*`), for the same
 * reason `setDescendantsRequired` skips those controls: a dimension range
 * nested in `makeDomShapeSearchType`'s per-dimension opt-in gate (say,
 * DOMRect's "Width") is only reachable at all once its own checkbox is
 * checked, and checking it is itself the user's explicit request to
 * constrain *that* facet - an enclosing "Has property" shouldn't then let
 * its "From"/"To" sit blank and still read as valid, any more than
 * `fileSearchType.js`'s "Name" facet should once opted into.
 * @param {Element} el
 * @returns {boolean}
 */
export function isExemptedByAncestorHasProperty (el) {
  if (el.closest('fieldset[class^="jsoeSearchOptInFieldset--"]')) {
    return false;
  }
  const row = el.closest('jsoe-search-has-property');
  if (!row) {
    return false;
  }
  const select = /** @type {HTMLSelectElement|undefined} */ (
    findOwnControl(row, 'select.jsoeSearchTriState--')
  );
  return select !== undefined && select.value !== '';
}

/**
 * Re-runs every `input`/`change`-driven validator within `root` by
 * re-dispatching those events on each descendant form control -
 * `objectSearchType.js`'s `buildHasPropertyRow` calls this when its own
 * "Has"/"Doesn't have" tri-state changes, since a range pair (or anything
 * else reactive) nested anywhere inside the child widget needs to
 * re-evaluate `isExemptedByAncestorHasProperty` against the *new* tri-state
 * value - nothing else would otherwise prompt it to run again until the
 * user happens to interact with that specific field themselves.
 * @param {Element} root
 * @returns {void}
 */
export function revalidateDescendants (root) {
  [...root.querySelectorAll('input, select, textarea')].forEach((el) => {
    el.dispatchEvent(new Event('input'));
    el.dispatchEvent(new Event('change'));
  });
}

/**
 * The `buildRangeInputsPair` cross-validation check, factored out so a
 * consuming widget's own `$define.connectedCallback` (custom elements,
 * search plan §8) can also call it - the `input`/`change` events
 * `buildRangeInputsPair` wires below only fire from the user's *first*
 * interaction, so a freshly-built pair with both ends still empty would
 * otherwise stay "valid" by the browser's reckoning (no `setCustomValidity`
 * call has ever run yet) until then, contradicting the "leaving both blank
 * is invalid" rule documented below. `connectedCallback` is a native
 * Custom Elements lifecycle method (invoked once per instance the moment it
 * connects to the document), so calling this from there closes that gap
 * without needing any build-time live element reference.
 *
 * "Leaving both blank is invalid" is itself relaxed when
 * `isExemptedByAncestorHasProperty` says so - a range nested as a has-
 * property row's own child widget (e.g. a `date`/`number` property) needs
 * the same "'Has property X' is already a complete constraint" relief
 * `setDescendantsRequired` gives `required`-attribute controls, just
 * re-checked live on every call rather than toggled once, since this runs
 * imperatively on every keystroke regardless.
 * @param {Element} root
 * @param {string} [key]
 * @returns {void}
 */
export function syncRangeValidity (root, key = '') {
  const gteEl = /** @type {HTMLInputElement|undefined} */ (
    findOwnControl(root, `input.jsoeSearchRangeGte--${key}`)
  );
  const lteEl = /** @type {HTMLInputElement|undefined} */ (
    findOwnControl(root, `input.jsoeSearchRangeLte--${key}`)
  );
  if (!gteEl || !lteEl) {
    return;
  }
  const bothEmpty = gteEl.value === '' && lteEl.value === '' &&
    !isExemptedByAncestorHasProperty(gteEl);
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
 * is excluded from constraint validation entirely. Every caller must also
 * call `syncRangeValidity` from its own `connectedCallback` (see that
 * function's doc) so the initial both-blank state is actually invalid from
 * the moment the widget exists, not just after the user's first keystroke.
 * `dateSearchType.js`'s own `datetime-local` pair needs the same two checks
 * but isn't built through this helper (`buildDateInputControl` handles its
 * own ISO-slicing), so it wires an equivalent handler itself.
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
   * `this` is whichever of the pair fired the event - `syncRangeValidity`
   * looks up both fresh via `findOwnControl` rather than closing over
   * either, so it stays correct however many `buildRangeInputsPair` pairs
   * (of possibly-differing `key`s) end up sharing the same widget.
   * @this {HTMLElement}
   * @returns {void}
   */
  function validateRange () {
    const root = this.closest('[data-search-path]');
    if (root) {
      syncRangeValidity(root, key);
    }
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
  )?.value ??
    /* istanbul ignore next -- Guard: buildRangeInputsPair always creates this input */
    '';
  const lte = /** @type {HTMLInputElement|undefined} */ (
    findOwnControl(el, `input.jsoeSearchRangeLte--${key}`)
  )?.value ??
    /* istanbul ignore next -- Guard: buildRangeInputsPair always creates this input */
    '';
  return {gte, lte};
}

/**
 * A `<select multiple>` populated from a fixed candidate list - used by
 * `enum`/`multiSelect`/`literalSet` leaf controls (README: "multiple
 * select").
 *
 * `required`, when set, makes leaving *every* option unselected invalid -
 * `<select multiple required>` is natively satisfied by one or more
 * selections, no custom validity code needed. `enumSearchType.js` passes
 * this (an enum widget has nothing else to constrain, so an empty selection
 * is never a meaningful "no constraint" state - same "no absent values"
 * reasoning as `buildLiteralRegexControls`'s Value input); other callers
 * (`regexpSearchType.js`'s Flags, `SpecialRealNumberSearchType.js`) leave it
 * at the default `false`, since an empty selection there legitimately means
 * "no constraint on this facet" alongside a widget that has other facets.
 * @param {{
 *   name: string,
 *   options: (string|[value: string, title: string])[],
 *   required?: boolean
 * }} cfg
 * @returns {JamilihArray}
 */
export function buildMultiSelect ({name, options, required = false}) {
  return ['select', {
    name, multiple: true, required, class: 'jsoeSearchMultiSelect'
  }, options.map((opt) => {
    const [value, title] = Array.isArray(opt) ? opt : [opt, opt];
    return ['option', {value}, [title]];
  })];
}

/**
 * Reads back a `buildMultiSelect` into the selected values, `[]` if none.
 * @param {Element} el
 * @returns {string[]}
 */
export function readMultiSelect (el) {
  const select = /** @type {HTMLSelectElement|undefined} */ (
    findOwnControl(el, 'select.jsoeSearchMultiSelect')
  );
  return [...(select?.selectedOptions ??
    /* istanbul ignore next -- Guard: buildMultiSelect always creates this select */
    [])].map((opt) => opt.value);
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
 *
 * `required`, when set, makes leaving the select at "(any)" invalid - the
 * "(any)" option's `value: ''` below is exactly what native `required`
 * treats as "nothing selected", the same trick `unionFamilySearchType.js`'s
 * "Has type" select and `buildMultiSelect`'s `required` use.
 * `booleanSearchType.js` passes this (a boolean widget has nothing else to
 * constrain, so "(any)" is never a meaningful "no constraint" state - same
 * "no absent values" reasoning as `buildLiteralRegexControls`'s Value
 * input); other callers (`numberSearchType.js`'s "Is/Is Not Integer",
 * `dommatrixSearchType.js`'s readonly/3d) leave it at the default `false`,
 * since those are one of *several* facets in their own widget, where
 * "(any)" legitimately means "no constraint on this facet".
 * @param {{
 *   name: string, key?: string, trueLabel: string, falseLabel: string,
 *   onChange?: (this: HTMLElement) => void, required?: boolean
 * }} cfg
 * @returns {JamilihArray}
 */
export function buildTriStateSelect ({
  name, key = '', trueLabel, falseLabel, onChange, required = false
}) {
  return ['select', {
    name, class: `jsoeSearchTriState--${key}`, required,
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
 * @param {Element} el
 * @param {string} [key]
 * @returns {boolean|undefined}
 */
export function readTriStateSelect (el, key = '') {
  const select = /** @type {HTMLSelectElement|undefined} */ (
    findOwnControl(el, `select.jsoeSearchTriState--${key}`)
  );
  return !select || select.value === '' ? undefined : select.value === 'true';
}

/**
 * The "All of"/"Any of" combinator every widget that combines 2+ sibling
 * facets via `combineAnd`/`combineOr` adds next to those facets, letting a
 * user switch the whole group between AND- and OR-combining them (README:
 * "Need to allow multiple OR'd conditions"). Unlike `buildTriStateSelect`,
 * there is no "(any)" state: some combinator always applies once 2+ facets
 * are present, so this always has a definite selected value, defaulting to
 * "All of" (`'and'`) - the behavior every widget had before this control
 * existed, so a query built without ever touching this select is unchanged.
 *
 * `key` distinguishes multiple combinators *within one widget* (e.g.
 * `regexpSearchType.js`'s own item-9-restructured "source" facet combinator
 * alongside its separate source-vs-flags combinator); see
 * `buildRangeInputsPair`'s doc for why. Leave it at the default `''` for
 * the common case of a widget with only one.
 * @param {{name: string, key?: string}} cfg
 * @returns {JamilihArray}
 */
export function buildCombinatorSelect ({name, key = ''}) {
  return ['select', {name, class: `jsoeSearchCombinator--${key}`}, [
    ['option', {value: 'and'}, ['All of']],
    ['option', {value: 'or'}, ['Any of']]
  ]];
}

/**
 * Reads back a `buildCombinatorSelect` - pass the same `key` it was built
 * with. A missing control (shouldn't happen) defaults to `'and'`.
 * @param {Element} el
 * @param {string} [key]
 * @returns {'and'|'or'}
 */
export function readCombinator (el, key = '') {
  const select = /** @type {HTMLSelectElement|undefined} */ (
    findOwnControl(el, `select.jsoeSearchCombinator--${key}`)
  );
  return select?.value === 'or' ? 'or' : 'and';
}

/**
 * The inverse of `readCombinator` - sets the control from a previously
 * detected combinator (`combinatorOfQuery`).
 * @param {Element} el
 * @param {'and'|'or'} value
 * @param {string} [key]
 * @returns {void}
 */
export function applyCombinator (el, value, key = '') {
  const select = /** @type {HTMLSelectElement|undefined} */ (
    findOwnControl(el, `select.jsoeSearchCombinator--${key}`)
  );
  if (!select) {
    return;
  }
  select.value = value === 'or' ? 'or' : 'and';
  select.dispatchEvent(new Event('change'));
}

/**
 * A single checkbox - the only search affordance the README grants
 * `undefined`/`void`/`null`/`NaN` ("Require present"; they have "no
 * variants to allow for distinct search", since existence only becomes a
 * meaningful question once the path is optional or nested in a union), and
 * also used by `recordSearchType.js`/`mapSearchType.js` for their "require
 * same entry" toggle.
 *
 * `checked`, when set, pre-checks the checkbox; `disabled` locks it there,
 * non-interactive. `makePresenceOnlySearchType` passes both: the checkbox
 * is that leaf's *only* possible constraint, and its whole schema type has
 * exactly one value ("no variants to allow for distinct search" above) -
 * there is no second state worth offering a choice between, so this simply
 * asserts the one meaningful thing outright rather than making the user
 * pointlessly check a box that could only ever mean one thing. "require
 * same entry" leaves both at their `false` defaults (interactive,
 * unchecked), since that's one optional facet alongside a map/record's own
 * key/value matches, not the whole widget's sole, single-valued constraint.
 * @param {{name: string, label: string, checked?: boolean, disabled?: boolean}} cfg
 * @returns {JamilihArray}
 */
export function buildCheckbox ({name, label, checked = false, disabled = false}) {
  return ['label', [
    `${label}: `,
    ['input', {type: 'checkbox', name, class: 'jsoeSearchCheckbox', checked, disabled}]
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
 * Three independent opt-in facets for the README's "string, StringObject,
 * Blob, File, regexp (source), symbol (description): OR literal or regex
 * search/Does Not contain search" - one shared control (and reader, below)
 * that `stringSearchType.js`, `symbolSearchType.js`, and
 * `regexpSearchType.js` (for its source) each build their own custom
 * element around, since the query semantics are identical and only the
 * label/target facet differs. Each facet (Literal/Regex/Does-not-contain)
 * is a `buildOptInFieldset`-wrapped Value control, so any two or all three
 * can be opted into at once, combined via a shared `buildCombinatorSelect`
 * (README: "Need to allow multiple OR'd conditions... like 'matches regex'
 * and 'does not contain'") - previously a single mutually-exclusive Mode
 * `<select>` allowed only one at a time.
 *
 * `key` distinguishes multiple literal/regex controls *within one widget*
 * (e.g. `errorSearchType.js`'s `message`/`name`/`fileName`/`stack`); see
 * `buildRangeInputsPair`'s doc for why. Leave it at the default `''` for
 * the common case of a widget with only one such control. Call
 * `wireLiteralRegexControls(root, key)` once, from the consuming widget's
 * own `connectedCallback`, to actually connect the three checkboxes (and
 * the "at least one" sentinel) - this function only builds the static
 * markup, matching `buildOptInFieldset`'s own build/wire split.
 *
 * `flagOptions`, when given, adds a Flags multi-select to the Regex facet
 * (options passed in by the caller - most callers pass `regexpType.js`'s
 * own `allowedFlags`, the same list `regexpSearchType.js` uses for the
 * actual regexp's own flags - kept out of this generic module to avoid it
 * depending on a specific fundamental type), the same `$options` a
 * Mongo-flavored `$regex` accepts alongside it. `regexpSearchType.js`'s own
 * call (matching against the regexp's `.source` text, not to be confused
 * with its separate, bespoke Flags control for the regexp's *actual*
 * flags) leaves this unset, since a flag there would have no real regex of
 * its own to apply to.
 *
 * The Regex facet's Value input is also live syntax-checked
 * (`syncRegexValidity`, below) against `new RegExp(value, flags)` whenever
 * that facet is opted in - an unparsable pattern (or one only invalid for
 * the currently-selected flags, e.g. `u`/`v`'s stricter escape rules) sets
 * a custom validity message rather than silently accepting it.
 * @param {{name: string, key?: string, flagOptions?: string[]}} cfg
 * @returns {JamilihArray}
 */
export function buildLiteralRegexControls ({name, key = '', flagOptions}) {
  const literalKey = `${key}Literal`;
  const regexKey = `${key}Regex`;
  const notContainsKey = `${key}NotContains`;

  /**
   * Live syntax-checks the Regex facet's Value input against
   * `new RegExp(value, flags)` - a literal/does-not-contain Value is a
   * plain string with no format to violate, so only the Regex facet's own
   * Value/Flags controls call this. Flags are folded in (read fresh off
   * the Flags multi-select, when this call has one) because they can
   * themselves flip a pattern between valid and invalid - the `u`/`v`
   * flags' stricter escape rules being the main example - so a Flags
   * `change` needs to re-run this exactly like a Value `input` does.
   * @param {HTMLElement} el - the Regex facet's Value or Flags control
   * @returns {void}
   */
  function syncRegexValidity (el) {
    const root = el.closest('[data-search-path]');
    /* istanbul ignore if -- Guard: called from a descendant's own handler, so root is always found */
    if (!root) {
      return;
    }
    const valueEl = /** @type {HTMLInputElement|undefined} */ (
      findOwnControl(root, `input.jsoeSearchRegexValue--${key}`)
    );
    /* istanbul ignore if -- Guard: buildLiteralRegexControls always creates this */
    if (!valueEl) {
      return;
    }
    if (!valueEl.value) {
      valueEl.setCustomValidity('');
      return;
    }
    const flagsEl = /** @type {HTMLSelectElement|undefined} */ (
      findOwnControl(root, `select.jsoeSearchRegexFlags--${key}`)
    );
    const flags = [...(flagsEl?.selectedOptions ?? [])].map((opt) => opt.value).join('');
    try {
      // eslint-disable-next-line no-new -- Testing
      new RegExp(valueEl.value, flags);
      valueEl.setCustomValidity('');
    } catch {
      valueEl.setCustomValidity('Enter a valid regular expression.');
    }
  }

  /** @type {JamilihArray[]} */
  const regexChildren = [
    ['label', [
      'Value: ',
      ['input', {
        type: 'text', name: `${name}-regex-value`, class: `jsoeSearchRegexValue--${key}`,
        $on: {
          /** @this {HTMLElement} */
          input () {
            syncRegexValidity(this);
          }
        }
      }]
    ]]
  ];
  if (flagOptions) {
    regexChildren.push(['label', {class: `jsoeSearchRegexFlagsLabel--${key}`}, [
      'Flags: ',
      ['select', {
        name: `${name}-regex-flags`, multiple: true, class: `jsoeSearchRegexFlags--${key}`,
        $on: {
          /** @this {HTMLElement} */
          change () {
            syncRegexValidity(this);
          }
        }
      }, flagOptions.map((flag) => ['option', {value: flag}, [flag]])]
    ]]);
  }

  return ['span', [
    ...buildOptInFieldset({
      name: `${name}-literal`, key: literalKey, label: 'One of (comma-separated)',
      children: [['label', [
        'Value: ',
        ['input', {type: 'text', name: `${name}-literal-value`, class: `jsoeSearchLiteralValue--${key}`}]
      ]]]
    }),
    ...buildOptInFieldset({
      name: `${name}-regex`, key: regexKey, label: 'Matches regex',
      children: regexChildren
    }),
    ...buildOptInFieldset({
      name: `${name}-notContains`, key: notContainsKey, label: 'Does not contain',
      children: [['label', [
        'Value: ',
        ['input', {
          type: 'text', name: `${name}-notContains-value`,
          class: `jsoeSearchNotContainsValue--${key}`
        }]
      ]]]
    }),
    ['label', ['Combine: ', buildCombinatorSelect({name: `${name}-combinator`, key})]],
    buildAtLeastOneSentinel(key)
  ]];
}

/**
 * Connects a `buildLiteralRegexControls`'s three opt-in facets (and its own
 * "at least one" sentinel) - call once, synchronously, from the consuming
 * widget's own `connectedCallback` (see `buildOptInFieldset`'s doc for why
 * this build/wire split exists). Pass the same `key` it was built with.
 *
 * `onRegexToggle`, when given, is called after just the Regex facet's own
 * toggle (with that checkbox as `this`, matching `wireOptInFieldset`'s own
 * `onToggle` contract) - `regexpSearchType.js` uses it to also toggle its
 * Flags multi-select's visibility off the Regex facet's own checkbox,
 * replacing the old Mode-`change`-driven `onModeChange` hook.
 * @param {Element} root
 * @param {string} [key]
 * @param {((this: HTMLInputElement) => void)} [onRegexToggle]
 * @returns {void}
 */
export function wireLiteralRegexControls (
  root,
  /* istanbul ignore next -- Guard: every current caller passes `key` explicitly */
  key = '',
  /* istanbul ignore next -- Guard: every current caller passes `onRegexToggle` explicitly */
  onRegexToggle = undefined
) {
  const literalKey = `${key}Literal`;
  const regexKey = `${key}Regex`;
  const notContainsKey = `${key}NotContains`;
  const sync = () => syncAtLeastOneCheck(
    root,
    () => [literalKey, regexKey, notContainsKey].some(
      (facetKey) => readOptInChecked(root, facetKey)
    ),
    key
  );
  wireOptInFieldset(root, literalKey, sync);
  /**
   * @this {HTMLInputElement}
   * @returns {void}
   */
  function handleRegexToggle () {
    sync();
    onRegexToggle?.call(this);
  }
  wireOptInFieldset(root, regexKey, handleRegexToggle);
  wireOptInFieldset(root, notContainsKey, sync);
  sync();
}

/**
 * Reads back `buildLiteralRegexControls` - pass the same `key` it was built
 * with. Each of the three facets independently contributes its own leaf
 * when opted into (a `regex` leaf's `$options` only when the caller built
 * this with `flagOptions` and at least one flag is currently selected), all
 * combined via the shared `buildCombinatorSelect`
 * (`readCombinator(el, key) === 'or' ? combineOr : combineAnd`) - unlike
 * before this facet's own restructuring, this can now return a real
 * `$and`/`$or` of 2-3 leaves, not just one bare leaf.
 * @param {HTMLElement} el
 * @param {string} path
 * @param {string} [key]
 * @returns {import('./queryTree.js').QueryNode|undefined}
 */
export function readLiteralRegexQuery (el, path, key = '') {
  const literalLeaf = readOptInChecked(el, `${key}Literal`)
    ? (() => {
      const value = /** @type {HTMLInputElement|undefined} */ (
        findOwnControl(el, `input.jsoeSearchLiteralValue--${key}`)
      )?.value ??
        /* istanbul ignore next -- Guard: buildLiteralRegexControls always creates this input */
        '';
      const $in = value.split(',').map((v) => v.trim()).filter(Boolean);
      return $in.length ? makeLiteralSetLeaf(path, {$in}) : undefined;
    })()
    : undefined;
  const regexLeaf = readOptInChecked(el, `${key}Regex`)
    ? (() => {
      const value = /** @type {HTMLInputElement|undefined} */ (
        findOwnControl(el, `input.jsoeSearchRegexValue--${key}`)
      )?.value;
      if (!value) {
        return undefined;
      }
      const flagsSelect = /** @type {HTMLSelectElement|undefined} */ (
        findOwnControl(el, `select.jsoeSearchRegexFlags--${key}`)
      );
      const flags = [...(flagsSelect?.selectedOptions ?? [])].map((opt) => opt.value);
      return makeRegexLeaf(path, value, flags.length ? flags.join('') : undefined);
    })()
    : undefined;
  const notContainsLeaf = readOptInChecked(el, `${key}NotContains`)
    ? (() => {
      const value = /** @type {HTMLInputElement|undefined} */ (
        findOwnControl(el, `input.jsoeSearchNotContainsValue--${key}`)
      )?.value;
      return value ? makeNotContainsLeaf(path, value) : undefined;
    })()
    : undefined;
  const combine = readCombinator(el, key) === 'or' ? combineOr : combineAnd;
  return combine([literalLeaf, regexLeaf, notContainsLeaf]);
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
        // A length/size is never negative, regardless of whether the
        // schema itself declares a (necessarily non-negative) `min` -
        // floor at 0 rather than leaving the input unbounded below when it
        // doesn't.
        min: min === undefined ? 0 : Math.max(min, 0), max, step: 1
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
 * @param {Element} el
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

/**
 * Wraps arbitrary markup - a recursed child search widget's array, or a
 * fixed facet's own controls (`buildLiteralRegexControls`'s output, say) -
 * in an opt-in "Search on this" checkbox around a disabled `<fieldset>`.
 * For a facet that's one of *several* independent, individually-optional
 * constraints within a parent widget (array/set/tuple/filelist's element
 * match(es); map/record's key/value; `fileSearchType.js`'s name/content-
 * type), this keeps that facet's own `required` controls (if it has any)
 * from forcing the *whole* form invalid just by the facet existing -
 * generalizes `objectSearchType.js`'s original required-property row (see
 * that file's history) into a shared helper once enough call sites needed
 * the identical checkbox+fieldset shape.
 *
 * `key` distinguishes multiple opt-in fieldsets *within one widget* (e.g.
 * `mapSearchType.js`'s "key" and "value"); see `buildRangeInputsPair`'s doc
 * for why. Leave it at the default `''` for a widget with only one.
 *
 * The checkbox's own `name` attribute is `${name}-optIn`, not the bare
 * `name` passed in: a caller's `name` is typically shared with (a prefix
 * of) the wrapped content's own field names (`mapSearchType.js`'s "value"
 * facet, say, names its checkbox from the same `name` its inner value
 * widget builds its own `-value`-suffixed `<input>` from), and callers
 * cannot always predict what suffix a given recursed `SearchTypeObject`
 * will pick - the fixed `-optIn` suffix here guarantees no collision
 * regardless, without every caller needing to reason about it.
 *
 * Call `wireOptInFieldset` once, right after this is built into real DOM
 * (e.g. inside a `jml(...)` caller, same as `objectSearchType.js`'s rows
 * do), to actually connect the checkbox to the fieldset's `disabled` state -
 * this function only builds the static markup (default unchecked/disabled).
 * @param {{
 *   name: string, key?: string, label: string, children: JamilihArray[]
 * }} cfg
 * @returns {JamilihArray[]}
 */
export function buildOptInFieldset ({name, key = '', label, children}) {
  return [
    ['label', {class: 'jsoeSearchOptInLabel'}, [
      `${label}: `,
      ['input', {type: 'checkbox', name: `${name}-optIn`, class: `jsoeSearchOptIn--${key}`}]
    ]],
    ['fieldset', {disabled: true, class: `jsoeSearchOptInFieldset--${key}`}, children]
  ];
}

/**
 * Reads back a `buildOptInFieldset`'s checkbox - pass the same `key` it was
 * built with.
 * @param {Element} root
 * @param {string} [key]
 * @returns {boolean}
 */
export function readOptInChecked (root, key = '') {
  return Boolean(/** @type {HTMLInputElement|undefined} */ (
    findOwnControl(root, `input.jsoeSearchOptIn--${key}`)
  )?.checked);
}

/**
 * Connects a `buildOptInFieldset`'s checkbox to toggle its own fieldset's
 * `disabled` state - call once, synchronously, right after both are live
 * DOM nodes (see that function's doc). Pass the same `key` it was built
 * with.
 *
 * `onToggle`, when given, is called after each toggle (with the checkbox as
 * `this`) - `mapSearchType.js`/`recordSearchType.js`/`fileSearchType.js`
 * use it to re-run their own `syncAtLeastOneCheck` whenever one of their
 * (exactly two) opt-in facets changes, since checking/unchecking either one
 * can change whether "at least one" is satisfied.
 * @param {Element} root
 * @param {string} [key]
 * @param {((this: HTMLInputElement) => void)} [onToggle]
 * @returns {void}
 */
export function wireOptInFieldset (
  root,
  /* istanbul ignore next -- Guard: every current caller passes `key` explicitly */
  key = '',
  /* istanbul ignore next -- Guard: every current caller passes `onToggle` explicitly */
  onToggle = undefined
) {
  const checkbox = /** @type {HTMLInputElement|undefined} */ (
    findOwnControl(root, `input.jsoeSearchOptIn--${key}`)
  );
  const fieldset = /** @type {HTMLFieldSetElement|undefined} */ (
    findOwnControl(root, `fieldset.jsoeSearchOptInFieldset--${key}`)
  );
  checkbox?.addEventListener('change', () => {
    if (fieldset) {
      fieldset.disabled = !checkbox.checked;
    }
    onToggle?.call(checkbox);
  });
}

/**
 * A visually-hidden but still-rendered (and so still constraint-validation-
 * eligible - see `jsoe.css`'s `.searchAtLeastOneSentinel`, the same
 * "visually-hidden" pattern used for accessibility, which keeps an element
 * off-screen without `display: none`/`hidden` triggering the Constraint
 * Validation API's own "not rendered" exemption) sentinel control, for a
 * widget with several independent optional facets where leaving *every one*
 * unconfigured should be invalid even though no single facet is itself
 * always required (`mapSearchType.js`/`recordSearchType.js`'s key/value,
 * `fileSearchType.js`'s name/content-type). Pair with `syncAtLeastOneCheck`.
 *
 * `key` distinguishes multiple sentinels *within one widget* (e.g.
 * `fileSearchType.js`'s own top-level "at least one of name/type" sentinel
 * alongside each of its two `buildLiteralRegexControls` facets' own "at
 * least one of literal/regex/notContains" sentinel, all three sharing the
 * same nearest `[data-search-path]` root); see `buildRangeInputsPair`'s doc
 * for why. Leave it at the default `''` for a widget with only one.
 * @param {string} [key]
 * @returns {JamilihArray}
 */
export function buildAtLeastOneSentinel (key = '') {
  return ['input', {
    type: 'text', class: `searchAtLeastOneSentinel--${key}`, tabindex: -1,
    'aria-hidden': 'true'
  }];
}

/**
 * @type {WeakMap<Element, Map<string, () => void>>}
 */
const atLeastOneResyncs = new WeakMap();

/**
 * Sets a `buildAtLeastOneSentinel`'s custom validity from a live check -
 * call once at `connectedCallback` time for the initial state (a freshly-
 * built widget has satisfied none of its facets yet) and again whenever a
 * facet that could change the answer does (an opt-in checkbox toggling, a
 * recursed child's own `input`/`change`).
 *
 * Also relaxed, independently of `isSatisfied`, while
 * `isExemptedByAncestorHasProperty` says an enclosing
 * `objectSearchType.js` has-property row's own "Has"/"Doesn't have"
 * already provides a complete constraint - the same relief
 * `syncRangeValidity` and `dateSearchType.js`'s own range validator give
 * their "at least one bound" rule, needed here too since a has-property
 * row's own child could just as easily be an `array`/`map`/`file`/etc.
 * whose *own* sole constraint is this same "at least one facet" sentinel
 * rather than a plain `required` attribute or a range pair.
 *
 * Every call re-registers `isSatisfied` (keyed by `root` in a `WeakMap`, so
 * it never leaks past the element's own lifetime) for `resyncAtLeastOne` to
 * call later. This exists because not every "at least one" widget's own
 * answer changes via a plain `input`/`change` event - `objectSearchType.js`
 * itself is the reason: its sentinel changes when a row is added/removed
 * (a button click, and a structural DOM change, not a value change on any
 * control), which `revalidateDescendants`' blanket event-redispatch can
 * never reach, unlike `array`/`map`/etc.'s own opt-in checkboxes and size
 * inputs. `objectSearchType.js`'s `buildHasPropertyRow` calls
 * `resyncAtLeastOne` directly instead, precisely because it can't rely on
 * redispatched events reaching every possible child type.
 * @param {Element} root
 * @param {() => boolean} isSatisfied
 * @param {string} [key]
 * @returns {void}
 */
export function syncAtLeastOneCheck (
  root, isSatisfied,
  /* istanbul ignore next -- Guard: every current caller passes `key` explicitly */
  key = ''
) {
  let perKey = atLeastOneResyncs.get(root);
  if (!perKey) {
    perKey = new Map();
    atLeastOneResyncs.set(root, perKey);
  }
  perKey.set(key, () => syncAtLeastOneCheck(root, isSatisfied, key));
  const sentinel = /** @type {HTMLInputElement|undefined} */ (
    findOwnControl(root, `input.searchAtLeastOneSentinel--${key}`)
  );
  sentinel?.setCustomValidity(
    isSatisfied() || isExemptedByAncestorHasProperty(root)
      ? ''
      : 'Configure at least one of this widget’s facets.'
  );
}

/**
 * Re-runs every `syncAtLeastOneCheck` registered anywhere within `root`
 * (itself included) - see that function's doc for why this exists
 * alongside `revalidateDescendants` rather than relying on it alone.
 * @param {Element} root
 * @returns {void}
 */
export function resyncAtLeastOne (root) {
  atLeastOneResyncs.get(root)?.forEach((resync) => resync());
  [...root.querySelectorAll('[data-search-path]')].forEach((el) => {
    atLeastOneResyncs.get(el)?.forEach((resync) => resync());
  });
}

/**
 * Toggles the native `required` attribute on every originally-`required`
 * control inside `root`, leaving everything else (visibility, `disabled`)
 * alone - unlike `buildOptInFieldset`'s `<fieldset disabled>`, this keeps
 * the whole subtree fully interactive, for a case where an ancestor's own
 * choice already provides a complete constraint on its own, but should
 * still let the recursed child *optionally* add a further constraint on
 * top rather than blocking interaction with it entirely.
 * `objectSearchType.js`'s `buildHasPropertyRow` uses this for its "Has"/
 * "Doesn't have" tri-state: once existence is explicitly asserted either
 * way, the child's own required inputs (whatever type it turns out to be)
 * should stop forcing it to be filled in, while a user who still wants to
 * combine "Has property X" with "X matches Y" can keep typing into it -
 * `dateSearchType.js`'s "Valid"/"Invalid date" tri-state needs the
 * equivalent relaxation for its own (structurally different, so not built
 * through this helper) range pair.
 *
 * Relaxing (`required: false`) marks each control it touches with
 * `data-jsoe-was-required` before clearing the IDL `required` property -
 * setting that property to `false` reflects back to *removing* the
 * `required` content attribute entirely (standard boolean-attribute
 * reflection), so a later call to restore it can't rely on `[required]`
 * still matching that element; it looks for the marker instead.
 *
 * Skips any control inside a `buildOptInFieldset` fieldset
 * (`jsoeSearchOptInFieldset--*`): that facet already has its own gate on
 * whether it applies at all (the checkbox's `disabled` toggle exempts it
 * from constraint validation while unchecked), so an enclosing "Has
 * property" shouldn't also strip its `required` - a user who explicitly
 * opts into e.g. `fileSearchType.js`'s "Name" facet under a "Has property"
 * ancestor still needs to fill in the Value it requires, or uncheck "Name"
 * again; only the widget's own `buildAtLeastOneSentinel` (which *is*
 * exempted, via `isExemptedByAncestorHasProperty`) should be satisfied by
 * "Has property" alone.
 * @param {Element} root
 * @param {boolean} required
 * @returns {void}
 */
export function setDescendantsRequired (root, required) {
  const selector = required ? '[data-jsoe-was-required]' : '[required]';
  [...root.querySelectorAll(selector)].forEach((el) => {
    if (el.closest('fieldset[class^="jsoeSearchOptInFieldset--"]')) {
      return;
    }
    if (!required) {
      /** @type {HTMLElement} */ (el).dataset.jsoeWasRequired = 'true';
    }
    /** @type {HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement} */ (
      el
    ).required = required;
  });
}

/**
 * @typedef {import('./queryTree.js').QueryNode} QueryNode
 */

/**
 * The "Edit raw" round-trip (`SearchChoicesControl.$applyQuery`,
 * `src/search/index.js`) needs the inverse of every `getQuery`: given a
 * previously-serialized (or hand-edited) `QueryNode`, drive the same DOM
 * controls `getQuery` reads back into that state, so the two stay in sync.
 * `unwrapAndClauses`/`nodeTouchesPath`/`extractLeafOfKind`/
 * `extractClauseForPath` below are the shared groundwork every
 * `applyQuery` implementation builds on to undo `combineAnd`'s own
 * flattening; the `apply*` functions below those are the direct inverse of
 * one `build*`/`read*` pair each.
 *
 * A plain leaf becomes a one-element array; `undefined` (no constraint)
 * becomes `[]`; an `$and`/`$or` node's own combined array is returned as-is
 * (not further flattened - a nested `$and`/`$or` stays a single clause, so
 * `nodeTouchesPath` below is what actually looks inside one).
 * @param {QueryNode|undefined} queryNode
 * @returns {QueryNode[]}
 */
export function unwrapAndClauses (queryNode) {
  if (queryNode === undefined) {
    return [];
  }
  if ('$or' in queryNode) {
    return queryNode.$or;
  }
  return '$and' in queryNode ? queryNode.$and : [queryNode];
}

/**
 * Whether `queryNode` is itself a bare `{$or: [...]}` node - `'or'` if so,
 * else `'and'` (covering a bare leaf, an `$and` node, and `undefined`
 * alike). This is what every combining site's own `applyQuery` uses to
 * restore its `buildCombinatorSelect` from a previously-read/hand-edited
 * query: a query that collapsed to a single surviving leaf (`combineAnd`/
 * `combineOr`'s own collapsing, neither functions' doc) carries no `$and`/
 * `$or` wrapper at all to inspect, so it - correctly - defaults back to
 * `'and'`, indistinguishable from a deliberate "All of".
 * @param {QueryNode|undefined} queryNode
 * @returns {'and'|'or'}
 */
export function combinatorOfQuery (queryNode) {
  return queryNode !== undefined && '$or' in queryNode ? 'or' : 'and';
}

/**
 * The array-level primitive behind `extractClauseForPath` - finds every
 * clause in `clauses` that `nodeTouchesPath` says belongs to `path`,
 * returning the rest of the array with them removed. `objectSearchType.js`
 * uses this directly (rather than `extractClauseForPath`, which re-wraps the
 * rest into a fresh `QueryNode` after every single peel) since it must
 * repeatedly peel one has-property row's own clause at a time out of a
 * plain array of already-unwrapped optional-property clauses.
 *
 * Collects *every* matching clause, not just the first: `clauses` is already
 * flattened (by `unwrapAndClauses`, one level), so if the property at `path`
 * is itself the sole survivor of an ancestor `combineAnd`/`combineOr` that
 * collapsed away its own wrapper (both functions' own doc), its *own*
 * internally-combined leaves surface here as 2+ separate same-path entries
 * indistinguishable, at this flattened level, from separate sibling
 * properties - taking only the first (as this function used to) would
 * silently discard the rest. `combinator` (the combinator `clauses` was
 * itself unwrapped from - the caller already has it, from
 * `combinatorOfQuery`) recombines multiple matches the same way they were
 * originally combined; with at most one match it's inert, since
 * `combineAnd`/`combineOr` both return a lone survivor bare regardless.
 * @param {QueryNode[]} clauses
 * @param {string} path
 * @param {'and'|'or'} [combinator]
 * @returns {{matched: QueryNode|undefined, restClauses: QueryNode[]}}
 */
export function extractClauseFromList (
  clauses, path,
  /* istanbul ignore next -- Guard: every current caller passes `combinator` explicitly */
  combinator = 'and'
) {
  const matchedClauses = clauses.filter((clause) => nodeTouchesPath(clause, path));
  if (matchedClauses.length === 0) {
    return {matched: undefined, restClauses: clauses};
  }
  const combine = combinator === 'or' ? combineOr : combineAnd;
  return {
    matched: combine(matchedClauses),
    restClauses: clauses.filter((clause) => !nodeTouchesPath(clause, path))
  };
}

/**
 * Whether any leaf reachable from `node` (recursing through `$and`/`$or`
 * combinators and a `not`/`passThrough` leaf's own wrapped `query`) targets
 * `path` itself or somewhere nested under it - used to decide which of a
 * container widget's several recursed children (`tupleSearchType.js`'s
 * positions/rest, `functionSearchType.js`'s args/output,
 * `objectSearchType.js`'s properties, `unionFamilySearchType.js`'s chosen
 * branch) a given top-level clause belongs to, since a recursed child's own
 * `getQuery()` result is threaded through untouched (whatever shape it is)
 * rather than re-wrapped with the parent's path.
 * @param {QueryNode|undefined} node
 * @param {string} path
 * @returns {boolean}
 */
export function nodeTouchesPath (node, path) {
  // `QueryNotLeaf` is the only leaf kind with no `path` of its own - unwrap
  // its `query` (iteratively, in case of a `not` wrapping another `not`)
  // before dispatching on the combinator/leaf shapes below.
  let current = node;
  while (
    current !== undefined && !('$and' in current) && !('$or' in current) &&
    !('path' in current) && 'query' in current
  ) {
    ({query: current} = current);
  }
  if (current === undefined) {
    return false;
  }
  if ('$and' in current) {
    return current.$and.some((child) => nodeTouchesPath(child, path));
  }
  return '$or' in current
    ? current.$or.some((child) => nodeTouchesPath(child, path))
    : ('path' in current) &&
      (current.path === path || current.path.startsWith(`${path}/`));
}

/**
 * Pulls the (at most one) top-level clause of `queryNode` whose own `kind`
 * matches out of the `$and` it's combined into, leaving the rest re-combined
 * - the inverse half of `combineAnd([ownLeaf, ...])`. Safe to use for any
 * facet whose own leaf kind is unique within its widget (every `kind` this
 * module's callers pass is exactly that: `lengthSize`, `hasProperty`,
 * `mapRecordJoint`, `typeOf`), since a recursed child's own (arbitrarily
 * nested) contribution never surfaces as a *bare* top-level leaf sharing the
 * parent's own facet kind.
 * `kind`'s own type parameter narrows `matched`'s type to exactly the leaf
 * shape that `kind` names (`Extract<QueryLeaf, {kind: K}>`), so a call like
 * `extractLeafOfKind(queryNode, 'range')` gives back a properly-typed
 * `QueryRangeLeaf|undefined` with no cast needed at the call site.
 * @template {import('./queryTree.js').QueryLeaf['kind']} K
 * @param {QueryNode|undefined} queryNode
 * @param {K} kind
 * @returns {{
 *   matched: Extract<import('./queryTree.js').QueryLeaf, {kind: K}>|undefined,
 *   rest: QueryNode|undefined
 * }}
 */
export function extractLeafOfKind (queryNode, kind) {
  const clauses = unwrapAndClauses(queryNode);
  const idx = clauses.findIndex((clause) => 'kind' in clause && clause.kind === kind);
  if (idx === -1) {
    return {matched: undefined, rest: queryNode};
  }
  const combine = combinatorOfQuery(queryNode) === 'or' ? combineOr : combineAnd;
  return {
    matched: /** @type {Extract<import('./queryTree.js').QueryLeaf, {kind: K}>} */ (
      clauses[idx]
    ),
    rest: combine(clauses.filter((_clause, i) => i !== idx))
  };
}

/**
 * Pulls the top-level clause(s) of `queryNode` that `nodeTouchesPath` says
 * belong to `path` out of the `$and`/`$or` it's combined into, leaving the
 * rest re-combined - the path-based counterpart of `extractLeafOfKind`, for
 * a recursed child's own contribution (whose shape isn't a single known leaf
 * `kind`, unlike a container's own facets). `extractClauseFromList`'s own doc
 * covers why more than one clause can legitimately match `path` here.
 * @param {QueryNode|undefined} queryNode
 * @param {string} path
 * @returns {{matched: QueryNode|undefined, rest: QueryNode|undefined}}
 */
export function extractClauseForPath (queryNode, path) {
  const clauses = unwrapAndClauses(queryNode);
  const combinator = combinatorOfQuery(queryNode);
  const {matched, restClauses} = extractClauseFromList(clauses, path, combinator);
  if (matched === undefined) {
    return {matched: undefined, rest: queryNode};
  }
  const combine = combinator === 'or' ? combineOr : combineAnd;
  return {matched, rest: combine(restClauses)};
}

/**
 * The inverse of `readLiteralRegexQuery` - sets `buildLiteralRegexControls`'s
 * three facets (and their shared combinator) back from a previously-read
 * `QueryNode` (or resets every facet to unchecked/empty for `undefined`,
 * meaning none of them has a constraint any more). Unlike before this
 * facet's own restructuring, `queryNode` may combine up to all three leaf
 * kinds via `$and`/`$or` - `unwrapAndClauses` finds each independently, so
 * every facet is restored regardless of how many others accompany it.
 * Dispatches `input`/`change` on each Value/Flags control (so their own
 * live validators re-run) and lets `applyOptIn` dispatch `change` on each
 * checkbox (so `wireLiteralRegexControls`'s own toggle handling re-runs),
 * the same events a real user interacting with these controls would fire.
 * @param {Element} el
 * @param {import('./queryTree.js').QueryNode|undefined} queryNode
 * @param {string} [key]
 * @returns {void}
 */
export function applyLiteralRegexQuery (el, queryNode, key = '') {
  const clauses = unwrapAndClauses(queryNode);
  const literalLeaf = /** @type {import('./queryTree.js').QueryLiteralSetLeaf|undefined} */ (
    clauses.find((clause) => 'kind' in clause && clause.kind === 'literalSet')
  );
  const regexLeaf = /** @type {import('./queryTree.js').QueryRegexLeaf|undefined} */ (
    clauses.find((clause) => 'kind' in clause && clause.kind === 'regex')
  );
  const notContainsLeaf = /** @type {import('./queryTree.js').QueryNotContainsLeaf|undefined} */ (
    clauses.find((clause) => 'kind' in clause && clause.kind === 'notContains')
  );

  applyOptIn(el, literalLeaf !== undefined, `${key}Literal`);
  const literalEl = /** @type {HTMLInputElement|undefined} */ (
    findOwnControl(el, `input.jsoeSearchLiteralValue--${key}`)
  );
  if (literalEl) {
    literalEl.value = literalLeaf ? (literalLeaf.$in ?? []).map(String).join(', ') : '';
    literalEl.dispatchEvent(new Event('input'));
  }

  applyOptIn(el, regexLeaf !== undefined, `${key}Regex`);
  const regexEl = /** @type {HTMLInputElement|undefined} */ (
    findOwnControl(el, `input.jsoeSearchRegexValue--${key}`)
  );
  if (regexEl) {
    regexEl.value = regexLeaf?.$regex ?? '';
    regexEl.dispatchEvent(new Event('input'));
  }
  const flagsEl = /** @type {HTMLSelectElement|undefined} */ (
    findOwnControl(el, `select.jsoeSearchRegexFlags--${key}`)
  );
  if (flagsEl) {
    const flagChars = new Set((regexLeaf?.$options ?? '').split(''));
    [...flagsEl.options].forEach((opt) => {
      opt.selected = flagChars.has(opt.value);
    });
    flagsEl.dispatchEvent(new Event('change'));
  }

  applyOptIn(el, notContainsLeaf !== undefined, `${key}NotContains`);
  const notContainsEl = /** @type {HTMLInputElement|undefined} */ (
    findOwnControl(el, `input.jsoeSearchNotContainsValue--${key}`)
  );
  if (notContainsEl) {
    notContainsEl.value = notContainsLeaf?.value ?? '';
    notContainsEl.dispatchEvent(new Event('input'));
  }

  applyCombinator(el, combinatorOfQuery(queryNode), key);
}

/**
 * The inverse of `readRangeInputsPair` - sets the From/To inputs back from a
 * previously-read `range` leaf (or clears both for `undefined`). An
 * exclusive `$gt`/`$lt` bound (never produced by any `getQuery` in this
 * codebase, but tolerated on a hand-edited raw query) is treated the same as
 * its inclusive `$gte`/`$lte` counterpart, since the UI has only one plain
 * bound per side, not a separate inclusive/exclusive toggle.
 * @param {Element} el
 * @param {import('./queryTree.js').QueryRangeLeaf|undefined} leaf
 * @param {string} [key]
 * @returns {void}
 */
export function applyRangeQuery (el, leaf, key = '') {
  const gteEl = /** @type {HTMLInputElement|undefined} */ (
    findOwnControl(el, `input.jsoeSearchRangeGte--${key}`)
  );
  const lteEl = /** @type {HTMLInputElement|undefined} */ (
    findOwnControl(el, `input.jsoeSearchRangeLte--${key}`)
  );
  if (!gteEl || !lteEl) {
    return;
  }
  const gte = leaf?.$gte ?? leaf?.$gt;
  const lte = leaf?.$lte ?? leaf?.$lt;
  gteEl.value = gte === undefined ? '' : String(gte);
  lteEl.value = lte === undefined ? '' : String(lte);
  gteEl.dispatchEvent(new Event('input'));
  lteEl.dispatchEvent(new Event('input'));
}

/**
 * The inverse of `readTriStateSelect`/`buildHasPropertyToggle` - `undefined`
 * maps back to "(any)".
 * @param {Element} el
 * @param {boolean|undefined} value
 * @param {string} [key]
 * @returns {void}
 */
export function applyTriState (el, value, key = '') {
  const select = /** @type {HTMLSelectElement|undefined} */ (
    findOwnControl(el, `select.jsoeSearchTriState--${key}`)
  );
  if (!select) {
    return;
  }
  select.value = value === undefined ? '' : String(value);
  select.dispatchEvent(new Event('change'));
}

/**
 * The inverse of `readCheckbox`.
 * @param {Element} el
 * @param {boolean} checked
 * @returns {void}
 */
export function applyCheckbox (el, checked) {
  const checkbox = /** @type {HTMLInputElement|undefined} */ (
    findOwnControl(el, 'input.jsoeSearchCheckbox')
  );
  if (!checkbox) {
    return;
  }
  checkbox.checked = checked;
  checkbox.dispatchEvent(new Event('change'));
}

/**
 * The inverse of `readMultiSelect` - `values` is compared against each
 * `<option>`'s own `value` as a string (`String(item)`), matching how
 * `enumSearchType.js`/`SpecialRealNumberSearchType.js` build their own
 * options from stringified values.
 * @param {Element} el
 * @param {unknown[]} values
 * @returns {void}
 */
export function applyMultiSelect (el, values) {
  const select = /** @type {HTMLSelectElement|undefined} */ (
    findOwnControl(el, 'select.jsoeSearchMultiSelect')
  );
  if (!select) {
    return;
  }
  const strValues = new Set(values.map(String));
  [...select.options].forEach((opt) => {
    opt.selected = strValues.has(opt.value);
  });
  select.dispatchEvent(new Event('change'));
}

/**
 * The inverse of `readLengthSizeQuery` - clears both the size input and the
 * sparse tri-state for `undefined`.
 * @param {Element} el
 * @param {import('./queryTree.js').QueryLengthSizeLeaf|undefined} leaf
 * @returns {void}
 */
export function applyLengthSizeQuery (el, leaf) {
  const sizeEl = /** @type {HTMLInputElement|undefined} */ (
    findOwnControl(el, 'input.jsoeSearchSize')
  );
  if (sizeEl) {
    sizeEl.value = leaf?.$size === undefined ? '' : String(leaf.$size);
    sizeEl.dispatchEvent(new Event('input'));
  }
  applyTriState(el, leaf?.sparseCheck);
}

/**
 * The inverse of `readOptInChecked` - also dispatches `change` so
 * `wireOptInFieldset`'s own listener toggles the paired fieldset's
 * `disabled` state and runs whatever `onToggle` it was wired with (e.g. a
 * widget's own `syncAtLeastOneCheck` re-run).
 * @param {Element} el
 * @param {boolean} checked
 * @param {string} [key]
 * @returns {void}
 */
export function applyOptIn (
  el, checked,
  /* istanbul ignore next -- Guard: every current caller passes `key` explicitly */
  key = ''
) {
  const checkbox = /** @type {HTMLInputElement|undefined} */ (
    findOwnControl(el, `input.jsoeSearchOptIn--${key}`)
  );
  if (!checkbox) {
    return;
  }
  checkbox.checked = checked;
  checkbox.dispatchEvent(new Event('change'));
}

/**
 * A `buildOptInFieldset`-wrapped `buildLiteralRegexControls` facet
 * (`fileSearchType.js`'s name/content-type, `domexceptionSearchType.js`'s
 * message, `makeErrorFamilySearchType`'s string properties): opts the facet
 * in exactly when `queryNode` has a clause touching `path`, and applies that
 * clause (a bare literal/regex/does-not-contain leaf, since none of these
 * facets recurse any deeper) to its Mode/Value/Flags controls.
 * @param {Element} root
 * @param {QueryNode|undefined} queryNode
 * @param {string} path
 * @param {string} [key]
 * @returns {void}
 */
export function applyOptInLiteralRegexFacet (
  root, queryNode, path,
  /* istanbul ignore next -- Guard: every current caller passes `key` explicitly */
  key = ''
) {
  const {matched} = extractClauseForPath(queryNode, path);
  applyOptIn(root, matched !== undefined, key);
  applyLiteralRegexQuery(
    root,
    /**
     * @type {import('./queryTree.js').QueryLiteralSetLeaf|
     *import('./queryTree.js').QueryRegexLeaf|
      import('./queryTree.js').QueryNotContainsLeaf|undefined} */ (matched),
    key
  );
}

/**
 * A `buildOptInFieldset`-wrapped `buildRangeInputsPair` facet
 * (`makeErrorFamilySearchType`'s number properties,
 * `makeDomShapeSearchType`'s dimensions): opts the facet in exactly when
 * `queryNode` has a clause touching `path`, and applies that clause (a bare
 * `range` leaf) to its From/To controls.
 * @param {Element} root
 * @param {QueryNode|undefined} queryNode
 * @param {string} path
 * @param {string} [key]
 * @returns {void}
 */
export function applyOptInRangeFacet (
  root, queryNode, path,
  /* istanbul ignore next -- Guard: every current caller passes `key` explicitly */
  key = ''
) {
  const {matched} = extractClauseForPath(queryNode, path);
  applyOptIn(root, matched !== undefined, key);
  applyRangeQuery(
    root, /** @type {import('./queryTree.js').QueryRangeLeaf|undefined} */ (matched), key
  );
}

/**
 * A `buildOptInFieldset`-wrapped `buildMultiSelect` facet
 * (`makeErrorFamilySearchType`'s error-class choice): opts the facet in
 * exactly when `queryNode` has a clause touching `path`, and applies that
 * clause (a bare `multiSelect` leaf) to its select control.
 * @param {Element} root
 * @param {QueryNode|undefined} queryNode
 * @param {string} path
 * @param {string} [key]
 * @returns {void}
 */
export function applyOptInMultiSelectFacet (
  root, queryNode, path,
  /* istanbul ignore next -- Guard: every current caller passes `key` explicitly */
  key = ''
) {
  const {matched} = extractClauseForPath(queryNode, path);
  applyOptIn(root, matched !== undefined, key);
  applyMultiSelect(
    root,
    /** @type {import('./queryTree.js').QueryMultiSelectLeaf|undefined} */ (
      matched
    )?.$in ?? []
  );
}
