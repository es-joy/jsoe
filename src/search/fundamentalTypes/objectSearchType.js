import {jml} from '../../vendor-imports.js';
import {escapeJSONPointer} from '../../utils/jsonPointer.js';
import {
  buildPathLabel, buildHasPropertyToggle, readTriStateSelect, findOwnControl
} from '../searchUtils.js';
import {combineAnd, makeHasPropertyLeaf} from '../queryTreeBuilders.js';
import {
  findSearchElement, getQueryViaElement, hasGetQuery
} from '../searchElementUtils.js';
import {buildSearchWidget} from '../searchDispatch.js';

/**
 * @typedef {import('../searchDispatch.js').SearchTypeObject} SearchTypeObject
 */

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
        const childEl = findSearchElement(this, searchPath);
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
          row.remove();
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
  const syncChildVisibility = () => {
    if (childRoot) {
      childRoot.hidden = select?.value === 'false';
    }
  };
  select?.addEventListener('change', syncChildVisibility);
  syncChildVisibility();

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
 * no pull-down entry or toggle at all - its own value-match widget is just
 * always shown, since its existence is never in question.
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
    // already uses to leave it out of the "Add property" pull-down) - it
    // still needs its own value-match widget, though, just always shown
    // rather than added on demand. `buildSearchWidget` is used directly
    // (not `buildHasPropertyRow`) since there is no existence toggle to
    // combine it with - the child widget's own `getQuery` is exactly the
    // row's query.
    const requiredProperties = propertyEntries.filter(
      ([, propSchema]) => propSchema.isOptional !== true
    );
    const requiredArr = requiredProperties.map(([propertyName, propSchema]) => (
      buildSearchWidget({
        schemaObject: propSchema,
        path: `${path}/${escapeJSONPointer(propertyName)}`,
        typeNamespace,
        topRoot,
        types,
        originalJSON
      })
    ));

    return ['jsoe-search-object', {
      dataset: {searchPath: path, searchKind: 'object'},
      title: label,
      $define: {
        /** @this {HTMLElement} */
        getQuery () {
          const rows = [...this.children].filter(hasGetQuery);
          return combineAnd(rows.map((row) => row.getQuery()));
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
            }
          }
        }, ['Add']]
      ]],
      ...requiredArr
    ]];
  },
  getQuery: getQueryViaElement
};

export default objectSearchType;
