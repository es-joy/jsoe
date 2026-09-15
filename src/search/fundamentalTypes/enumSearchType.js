import {
  buildPathLabel, buildMultiSelect, readMultiSelect, applyMultiSelect, extractLeafOfKind
} from '../searchUtils.js';
import {makeMultiSelectLeaf} from '../queryTreeBuilders.js';
import {getQueryViaElement, applyQueryViaElement} from '../searchElementUtils.js';

/**
 * @typedef {import('../searchDispatch.js').SearchTypeObject} SearchTypeObject
 */

/**
 * Enum, Native Enum: multiple select (README). The value-editing side has
 * no dedicated `enumType.js` (`getSchemaType` resolves `enum` to whatever
 * its underlying value type is), but search needs the actual allowed
 * values listed, so this is one of the search-only dedicated modules
 * (search plan §1).
 *
 * The README's further "native enum also can search key vs. value" is not
 * implemented by this pass - only the plain multi-select-of-values
 * affordance every enum gets either way. A native enum whose keys differ
 * from its values (unlike a plain `z.enum([...])`, where they're the same)
 * still gets a usable widget here, just not that extra key-vs-value mode
 * yet; `values`'s keys are shown alongside their value as a hint.
 * `buildMultiSelect`'s `required` leaves the whole selection invalid until
 * at least one value is picked, natively (no build-time-empty gap like
 * `buildRangeInputsPair`'s custom validity needed a `connectedCallback`
 * for - `<select multiple required>` is evaluated by the browser itself).
 * @type {SearchTypeObject}
 */
const enumSearchType = {
  buildUI ({schemaObject, path, typeNamespace}) {
    const label = buildPathLabel(schemaObject, path);
    const name = `${typeNamespace}-enum`;
    const {values} = /** @type {import('zodexy').SzEnum} */ (
      schemaObject
    );
    const options = Object.entries(values).map(([key, value]) => {
      const strValue = String(value);
      return /** @type {[string, string]} */ ([
        strValue,
        key === strValue ? strValue : `${strValue} (${key})`
      ]);
    });
    return ['jsoe-search-enum', {
      dataset: {searchPath: path, searchKind: 'enum'},
      title: label,
      $define: {
        /** @this {HTMLElement} */
        getQuery () {
          const selected = readMultiSelect(this);
          return selected.length
            ? makeMultiSelectLeaf(this.dataset.searchPath ?? '', {$in: selected})
            : undefined;
        },
        /**
         * @this {HTMLElement}
         * @param {import('../queryTree.js').QueryNode|undefined} queryNode
         * @returns {void}
         */
        applyQuery (queryNode) {
          const {matched} = extractLeafOfKind(queryNode, 'multiSelect');
          applyMultiSelect(this, matched?.$in ?? []);
        }
      }
    }, [
      ['span', {class: 'searchLabel'}, [label]],
      buildMultiSelect({name, options, required: true})
    ]];
  },
  getQuery: getQueryViaElement,
  applyQuery: applyQueryViaElement
};

export default enumSearchType;
