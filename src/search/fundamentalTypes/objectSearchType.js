import {jml} from '../../vendor-imports.js';
import {escapeJSONPointer} from '../../utils/jsonPointer.js';
import {
  buildPathLabel, buildHasPropertyToggle, readTriStateSelect, applyTriState, findOwnControl,
  buildCheckbox, readCheckbox, applyCheckbox, buildAtLeastOneSentinel, syncAtLeastOneCheck,
  setDescendantsRequired, revalidateDescendants, resyncAtLeastOne,
  extractLeafOfKind, extractClauseForPath
} from '../searchUtils.js';
import {combineAnd, makeHasPropertyLeaf} from '../queryTreeBuilders.js';
import {
  findSearchElement, getQueryViaElement, hasGetQuery,
  applyQueryViaElement, hasApplyQuery
} from '../searchElementUtils.js';
import {buildSearchWidget} from '../searchDispatch.js';

/**
 * @typedef {import('../searchDispatch.js').SearchTypeObject} SearchTypeObject
 */

/**
 * An object with zero active rows (nothing added from the pull-down, and no
 * required property opted into) expresses no constraint at all - the same
 * "no absent values" reasoning as every other leaf's own required control,
 * just with nothing native to hang a `required` attribute directly off of,
 * since what counts as "active" is a dynamically-changing count of child
 * rows rather than one fixed input. `searchUtils.js`'s
 * `buildAtLeastOneSentinel`/`syncAtLeastOneCheck` stand in for that.
 * @param {Element} root - a `jsoe-search-object` element
 * @returns {void}
 */
function syncObjectValidity (root) {
  const addedRowCount = root.querySelectorAll(':scope > jsoe-search-has-property').length;
  const checkedRequiredCount = [
    ...root.querySelectorAll(
      ':scope > jsoe-search-required-property > label > input.jsoeSearchCheckbox'
    )
  ].filter((checkbox) => /** @type {HTMLInputElement} */ (checkbox).checked).length;
  syncAtLeastOneCheck(root, () => addedRowCount + checkedRequiredCount > 0);
}

/**
 * One added property's row: the fixed "has property" tri-state toggle
 * (`buildHasPropertyToggle`) plus, immediately recursing (search plan §6
 * build order: "Object / Array / Set - first types recursing into child
 * schemas via `getSearchTypeObject`"), that property's own full search
 * widget - so a user can combine "has property X" with "X matches Y" in
 * one row rather than only being able to ask about existence.
 * @param {{
 *   propertyName: string,
 *   propSchema: import('../../formats/schema.js').ZodexSchema,
 *   path: string,
 *   typeNamespace: string|undefined,
 *   topRoot: import('../../types.js').RootElement|undefined,
 *   types: import('../../types.js').default|undefined,
 *   originalJSON: import('../../formats/schema.js').ZodexSchema|undefined,
 *   addPropertySelect: HTMLSelectElement
 * }} cfg
 * @returns {HTMLElement}
 */
function buildHasPropertyRow ({
  propertyName, propSchema, path, typeNamespace, topRoot, types, originalJSON,
  addPropertySelect
}) {
  const childPath = `${path}/${escapeJSONPointer(propertyName)}`;
  const name = `${typeNamespace}-hasProperty-${propertyName}`;
  const childArr = buildSearchWidget({
    schemaObject: propSchema, path: childPath, typeNamespace, topRoot, types,
    originalJSON
  });
  const row = /** @type {HTMLElement} */ (jml('jsoe-search-has-property', {
    dataset: {searchPath: childPath, searchKind: 'hasProperty', propertyName},
    $define: {
      // Reads `childPath` off `this.dataset` rather than closing over the
      //   outer `path`/`propertyName`: `$define`'s mixin is installed once
      //   on the shared prototype the first time this tag is defined, so
      //   every later `<jsoe-search-has-property>` instance must read its
      //   own per-row state off `this`. `readTriStateSelect`/
      //   `findSearchElement` are themselves closure-free (class- and
      //   `dataset`-driven; see `searchUtils.js`'s `findOwnControl`), so no
      //   further per-instance state needs storing here.
      /** @this {HTMLElement} */
      getQuery () {
        const searchPath = this.dataset.searchPath ?? '';
        const existsCheck = readTriStateSelect(this);
        const existsLeaf = existsCheck === undefined
          ? undefined
          : makeHasPropertyLeaf(searchPath, existsCheck);
        // "Doesn't have" already hides the child (its own `syncChildState`),
        // since a value/presence constraint on an asserted-absent property
        // is meaningless - skip its query outright rather than combining a
        // stale/leftover constraint with a contradictory `$exists: false`.
        // This matters most for `makePresenceOnlySearchType`'s leaves
        // (undef/null/NaN), whose checkbox is permanently checked
        // (`buildCheckbox`'s doc) and so would otherwise always contribute
        // its `presence` leaf regardless of this row's own answer.
        const childEl = existsCheck === false
          ? undefined
          : findSearchElement(this, searchPath);
        const childLeaf = childEl && hasGetQuery(childEl)
          ? childEl.getQuery()
          : undefined;
        return combineAnd([existsLeaf, childLeaf]);
      }
    }
  }, [
    buildHasPropertyToggle({name, propertyName}),
    ['button', {
      type: 'button',
      class: 'removePropertyButton',
      $on: {
        // `row`/`addPropertySelect`/`propertyName` are all closed over
        // directly - safe since `buildHasPropertyRow` (unlike `$define`)
        // runs fresh per row, so nothing here is shared across instances.
        click () {
          const option = /** @type {HTMLOptionElement|null} */ (
            addPropertySelect.querySelector(
              `option[value="${CSS.escape(propertyName)}"]`
            )
          );
          if (option) {
            option.disabled = false;
          }
          const objectRoot = row.closest('jsoe-search-object');
          row.remove();
          if (objectRoot) {
            syncObjectValidity(/** @type {HTMLElement} */ (objectRoot));
          }
        }
      }
    }, ['Remove']],
    childArr
  ]));

  // Asserting the property is absent ("Doesn't have") makes a value
  // constraint on it meaningless, so hide the recursed child widget while
  // that's selected rather than leaving it showing (and usable) alongside a
  // contradictory "doesn't have" answer - `buildUI` runs fresh per row, so
  // (unlike `$define`) it's safe for this listener to close over `select`/
  // `childRoot` directly.
  const select = /** @type {HTMLSelectElement|undefined} */ (
    findOwnControl(row, 'select.jsoeSearchTriState--')
  );
  const childRoot = findSearchElement(row, childPath);
  // "Doesn't have" hides the child entirely (a value constraint on an
  // asserted-absent property is meaningless) - a hidden control is already
  // exempt from constraint validation on its own. "Has" keeps the child
  // visible and interactive (so "Has property X" AND "X matches Y" can
  // still be combined), but that existence assertion is *already* a
  // complete constraint by itself, so its own required inputs (whatever
  // type the child turns out to be) are relaxed via `setDescendantsRequired`
  // rather than disabled - only "(any)" (no existence assertion) leaves
  // them actually required, since the child's own value is then the row's
  // only possible contribution. `revalidateDescendants` covers anything
  // that (unlike a plain `required` attribute) re-asserts its own
  // constraint imperatively on every keystroke regardless of this row's
  // state - a range pair's `isExemptedByAncestorHasProperty` check
  // (`searchUtils.js`) only takes effect once something re-runs it, which
  // otherwise wouldn't happen until the user next touches that field.
  // `resyncAtLeastOne` covers the same gap for a child that's itself an
  // `object`/`array`/`map`/etc. with its own "at least one facet" sentinel
  // (`buildAtLeastOneSentinel`) - `revalidateDescendants`' event-redispatch
  // reaches `array`/`map`/etc. fine (their own answer changes via a plain
  // `input`/`change` on a real control), but not `objectSearchType.js`
  // itself, whose sentinel changes when a row is added/removed - a button
  // click and a structural DOM change, neither of which redispatching
  // `input`/`change` events can simulate.
  const syncChildState = () => {
    /* istanbul ignore if -- Guard: every property type builds a child search widget */
    if (!childRoot) {
      return;
    }
    childRoot.hidden = select?.value === 'false';
    setDescendantsRequired(childRoot, select?.value === '');
    revalidateDescendants(childRoot);
    resyncAtLeastOne(childRoot);
  };
  select?.addEventListener('change', syncChildState);
  syncChildState();

  return row;
}

/**
 * A required property's own value-match widget, wrapped in an opt-in
 * "Search on this property" checkbox (default unchecked) around a disabled
 * `<fieldset>`: a required property has no existence to ask about, but it
 * still auto-appears with no "Remove" affordance the moment its parent
 * object is added (search plan build order never lists it in the "Add
 * property" pull-down at all) - and several leaf widgets now mark their own
 * value input `required` (`buildLiteralRegexControls`'s doc), which would
 * otherwise make the *whole* form invalid the instant such a property's
 * object exists, before the user has asked to search on it at all.
 * `<fieldset disabled>` is a native way to exempt a whole subtree from
 * constraint validation in one step (every descendant control, whatever
 * type it turns out to be, stops blocking `checkValidity`/`reportValidity`
 * while disabled) - checking the box re-enables the fieldset, making its
 * contents both interactive and, if left with a `required` field empty,
 * actually invalid again.
 * @param {{
 *   propertyName: string,
 *   propSchema: import('../../formats/schema.js').ZodexSchema,
 *   path: string,
 *   typeNamespace: string|undefined,
 *   topRoot: import('../../types.js').RootElement|undefined,
 *   types: import('../../types.js').default|undefined,
 *   originalJSON: import('../../formats/schema.js').ZodexSchema|undefined
 * }} cfg
 * @returns {HTMLElement}
 */
function buildRequiredPropertyRow ({
  propertyName, propSchema, path, typeNamespace, topRoot, types, originalJSON
}) {
  const childPath = `${path}/${escapeJSONPointer(propertyName)}`;
  const name = `${typeNamespace}-requiredProperty-${propertyName}`;
  const childArr = buildSearchWidget({
    schemaObject: propSchema, path: childPath, typeNamespace, topRoot, types,
    originalJSON
  });
  const row = /** @type {HTMLElement} */ (jml('jsoe-search-required-property', {
    dataset: {searchPath: childPath, searchKind: 'requiredProperty', propertyName},
    $define: {
      /** @this {HTMLElement} */
      getQuery () {
        if (!readCheckbox(this)) {
          return undefined;
        }
        const searchPath = this.dataset.searchPath ?? '';
        const childEl = findSearchElement(this, searchPath);
        return childEl && hasGetQuery(childEl) ? childEl.getQuery() : undefined;
      }
    }
  }, [
    buildCheckbox({name, label: `Search on "${propertyName}"`}),
    ['fieldset', {disabled: true, class: 'searchRequiredPropertyFieldset'}, [childArr]]
  ]));

  const checkbox = /** @type {HTMLInputElement|undefined} */ (
    findOwnControl(row, 'input.jsoeSearchCheckbox')
  );
  const fieldset = /** @type {HTMLFieldSetElement|null} */ (
    row.querySelector('fieldset.searchRequiredPropertyFieldset')
  );
  checkbox?.addEventListener('change', () => {
    if (fieldset) {
      fieldset.disabled = !checkbox.checked;
    }
    const objectRoot = row.closest('jsoe-search-object');
    if (objectRoot) {
      syncObjectValidity(/** @type {HTMLElement} */ (objectRoot));
    }
  });

  return row;
}

/**
 * Has property &lt;property pull-down&gt; (README), additive: only
 * optional properties are offered ("avoid listing required" - a required
 * property is guaranteed present, so asking about its existence is
 * meaningless), and picking one from the pull-down adds a row for it
 * (disabled in the pull-down, rather than removed, so it can't be added a
 * second time while its row exists). Each row's own "Remove" button
 * discards the row and re-enables its property in the pull-down, for
 * undoing an added-by-mistake property - a coarser-grained option than
 * setting the row's toggle back to "(any)" (which already expresses "no
 * constraint from this row" without removing it). A required property gets
 * no pull-down entry (its existence is never in question), but does still
 * get its own row - `buildRequiredPropertyRow`'s opt-in checkbox, defaulting
 * unchecked/disabled, so it doesn't force a search constraint the user never
 * asked for just by existing.
 * @type {SearchTypeObject}
 */
const objectSearchType = {
  buildUI ({schemaObject, path, typeNamespace, topRoot, types, originalJSON}) {
    const label = buildPathLabel(schemaObject, path);
    const objectSchemaObject = /** @type {import('zodexy').SzObject} */ (
      schemaObject
    );
    const propertyEntries = Object.entries(objectSchemaObject.properties);
    const availableProperties = propertyEntries.filter(
      ([, propSchema]) => propSchema.isOptional === true
    );
    // A required property is guaranteed present, so a has/doesn't-have
    // toggle would be meaningless for it (same reasoning `availableProperties`
    // already uses to leave it out of the "Add property" pull-down) - but it
    // still gets its own row, via `buildRequiredPropertyRow`'s opt-in
    // checkbox, so it doesn't silently force a search constraint the user
    // never asked for just by its parent object existing.
    const requiredProperties = propertyEntries.filter(
      ([, propSchema]) => propSchema.isOptional !== true
    );
    const requiredArr = requiredProperties.map(([propertyName, propSchema]) => (
      buildRequiredPropertyRow({
        propertyName, propSchema, path, typeNamespace, topRoot, types,
        originalJSON
      })
    ));

    return ['jsoe-search-object', {
      dataset: {searchPath: path, searchKind: 'object'},
      title: label,
      $define: {
        /** @this {HTMLElement} */
        connectedCallback () {
          if (propertyEntries.length > 0) {
            syncObjectValidity(this);
          }
        },
        /** @this {HTMLElement} */
        getQuery () {
          const rows = [...this.children].filter(hasGetQuery);
          return combineAnd(rows.map((row) => row.getQuery()));
        },
        /**
         * `$define` methods are shared once per tag (this file's other
         * docs), so - like `getQuery` - this reads every per-instance fact
         * (which properties exist, their names) off `this`'s own live DOM
         * rather than closing over `objectSchemaObject`/`propertyEntries`.
         * A property the query doesn't reference is reset to "no
         * constraint" (its tri-state back to "(any)"/checkbox unchecked,
         * its own child cleared) rather than removed outright - cheaper and
         * just as correct a way to reach the same resulting query, and
         * non-destructive (the row, and any of the user's other in-progress
         * edits to it, stay put to remove by hand if truly unwanted).
         * @this {HTMLElement}
         * @param {import('../queryTree.js').QueryNode|undefined} queryNode
         * @returns {void}
         */
        applyQuery (queryNode) {
          const searchPath = this.dataset.searchPath ?? '';
          let remaining = queryNode;

          [...this.querySelectorAll(':scope > jsoe-search-has-property')].forEach((row) => {
            const propertyName = /** @type {HTMLElement} */ (row).dataset.propertyName ?? '';
            const childPath = `${searchPath}/${escapeJSONPointer(propertyName)}`;
            const {matched, rest} = extractClauseForPath(remaining, childPath);
            remaining = rest;
            const {matched: existsLeaf, rest: childQuery} = extractLeafOfKind(matched, 'hasProperty');
            applyTriState(row, existsLeaf?.$exists);
            const childEl = findSearchElement(row, childPath);
            if (childEl && hasApplyQuery(childEl)) {
              childEl.applyQuery(childQuery);
            }
          });

          [...this.querySelectorAll(':scope > jsoe-search-required-property')].forEach((row) => {
            const propertyName = /** @type {HTMLElement} */ (row).dataset.propertyName ?? '';
            const childPath = `${searchPath}/${escapeJSONPointer(propertyName)}`;
            const {matched, rest} = extractClauseForPath(remaining, childPath);
            remaining = rest;
            applyCheckbox(row, matched !== undefined);
            const childEl = findSearchElement(row, childPath);
            if (childEl && hasApplyQuery(childEl)) {
              childEl.applyQuery(matched);
            }
          });

          // Optional properties the query references but that aren't added
          // yet: pick each in turn from the pull-down and click "Add" (that
          // click handler is wired per-instance, so - unlike this method -
          // it's safe for it to close over this widget's own schema/path),
          // then apply the same way an already-added row above would.
          const addPropertySelect = /** @type {HTMLSelectElement|undefined} */ (
            findOwnControl(this, 'select.addPropertySelect')
          );
          const addButton = /** @type {HTMLButtonElement|undefined} */ (
            findOwnControl(this, 'button.addPropertyButton')
          );
          [...(addPropertySelect?.options ?? [])].
            filter((opt) => opt.value && !opt.disabled).
            map((opt) => opt.value).
            forEach((propertyName) => {
              const childPath = `${searchPath}/${escapeJSONPointer(propertyName)}`;
              const {matched, rest} = extractClauseForPath(remaining, childPath);
              if (matched === undefined) {
                return;
              }
              remaining = rest;
              if (addPropertySelect) {
                addPropertySelect.value = propertyName;
              }
              addButton?.click();
              const row = [
                ...this.querySelectorAll(':scope > jsoe-search-has-property')
              ].find((r) => /** @type {HTMLElement} */ (r).dataset.propertyName === propertyName);
              /* istanbul ignore if -- Guard: addButton's click adds the row synchronously */
              if (!row) {
                return;
              }
              const {matched: existsLeaf, rest: childQuery} = extractLeafOfKind(matched, 'hasProperty');
              applyTriState(row, existsLeaf?.$exists);
              const childEl = findSearchElement(row, childPath);
              if (childEl && hasApplyQuery(childEl)) {
                childEl.applyQuery(childQuery);
              }
            });

          syncObjectValidity(this);
        }
      }
    }, [
      ['div', {class: 'searchObjectControls'}, [
        ['span', {class: 'searchLabel'}, [label]],
        availableProperties.length
          ? ['label', [
            'Add property: ',
            ['select', {class: 'addPropertySelect'}, [
              ['option', {value: ''}, ['(choose a property)']],
              ...availableProperties.map(([propertyName]) => (
                ['option', {value: propertyName}, [propertyName]]
              ))
            ]]
          ]]
          : ['span', ['(no optional properties to search on)']],
        ['button', {
          type: 'button',
          class: 'addPropertyButton',
          $on: {
            click () {
              const container = this.closest('jsoe-search-object');
              const select = /** @type {HTMLSelectElement|null} */ (
                container?.querySelector('select.addPropertySelect')
              );
              const propertyName = select?.value;
              if (!container || !select || !propertyName) {
                return;
              }
              const propSchema = objectSchemaObject.properties[propertyName];
              const row = buildHasPropertyRow({
                propertyName, propSchema, path, typeNamespace, topRoot, types,
                originalJSON, addPropertySelect: select
              });
              container.append(row);
              const option = /** @type {HTMLOptionElement|null} */ (
                select.querySelector(
                  `option[value="${CSS.escape(propertyName)}"]`
                )
              );
              if (option) {
                option.disabled = true;
              }
              select.value = '';
              syncObjectValidity(/** @type {HTMLElement} */ (container));
            }
          }
        }, ['Add']]
      ]],
      ...requiredArr,
      // Placed last purely for markup order; a plain rendered-but-off-
      // screen input, so its position among siblings has no visual effect.
      ...(propertyEntries.length > 0 ? [buildAtLeastOneSentinel()] : [])
    ]];
  },
  getQuery: getQueryViaElement,
  applyQuery: applyQueryViaElement
};

export default objectSearchType;
