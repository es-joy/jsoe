import {jml} from '../../vendor-imports.js';
import {escapeJSONPointer} from '../../utils/jsonPointer.js';
import {buildPathLabel, buildHasPropertyToggle, readTriStateSelect} from '../searchUtils.js';
import {combineAnd, makeHasPropertyLeaf} from '../queryTreeBuilders.js';
import {
  findSearchElement, getQueryViaElement, hasGetQuery
} from '../searchElementUtils.js';
import {getSearchTypeObject} from '../searchDispatch.js';

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
 *   types: import('../../types.js').default|undefined
 * }} cfg
 * @returns {HTMLElement}
 */
function buildHasPropertyRow ({
  propertyName, propSchema, path, typeNamespace, topRoot, types
}) {
  const childPath = `${path}/${escapeJSONPointer(propertyName)}`;
  const name = `${typeNamespace}-hasProperty-${propertyName}`;
  const childArr = getSearchTypeObject(propSchema).buildUI({
    schemaObject: propSchema, path: childPath, typeNamespace, topRoot, types
  });
  return /** @type {HTMLElement} */ (jml('jsoe-search-has-property', {
    dataset: {
      searchPath: childPath, searchKind: 'hasProperty', propertyName,
      inputName: name
    },
    $define: {
      // Reads `name`/`childPath` off `this.dataset` rather than closing
      //   over the outer parameters: `$define`'s mixin is installed once on
      //   the shared prototype the first time this tag is defined, so every
      //   later `<jsoe-search-has-property>` instance must read its own
      //   per-row state off `this`.
      /** @this {HTMLElement} */
      getQuery () {
        const searchPath = this.dataset.searchPath ?? '';
        const inputName = this.dataset.inputName ?? '';
        const existsCheck = readTriStateSelect(this, inputName);
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
    childArr
  ]));
}

/**
 * Has property &lt;property pull-down&gt; (README), additive: only
 * optional properties are offered ("avoid listing required" - a required
 * property is guaranteed present, so asking about its existence is
 * meaningless), and picking one from the pull-down adds a row for it
 * (removed from the pull-down so it can't be added twice); there is no
 * remove affordance, since setting a row's toggle back to "(any)" already
 * expresses "no constraint from this row" for the existence half, same as
 * clearing the nested widget does for the value half.
 * @type {SearchTypeObject}
 */
const objectSearchType = {
  buildUI ({schemaObject, path, typeNamespace, topRoot, types}) {
    const label = buildPathLabel(schemaObject, path);
    const objectSchemaObject = /** @type {import('zodexy').SzObject} */ (
      schemaObject
    );
    const availableProperties = Object.entries(
      objectSchemaObject.properties
    ).filter(([, propSchema]) => propSchema.isOptional === true);

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
                propertyName, propSchema, path, typeNamespace, topRoot, types
              });
              container.append(row);
              const option = select.querySelector(
                `option[value="${CSS.escape(propertyName)}"]`
              );
              option?.remove();
            }
          }
        }, ['Add']]
      ]]
    ]];
  },
  getQuery: getQueryViaElement
};

export default objectSearchType;
