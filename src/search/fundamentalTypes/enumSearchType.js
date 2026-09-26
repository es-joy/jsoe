import {
  buildPathLabel, buildMultiSelect, readMultiSelect, applyMultiSelect, extractLeafOfKind
} from '../searchUtils.js';
import {makeMultiSelectLeaf} from '../queryTreeBuilders.js';
import {getQueryViaElement, applyQueryViaElement} from '../searchElementUtils.js';

/**
 * @typedef {import('../searchDispatch.js').SearchTypeObject} SearchTypeObject
 */

/**
 * Enum: multiple select (README). The value-editing side has no dedicated
 * `enumType.js` (`getSchemaType` resolves `enum` to whatever its underlying
 * value type is), but search needs the actual allowed values listed, so
 * this is one of the search-only dedicated modules (search plan §1).
 *
 * Native enums (whose keys could differ from their values, unlike a plain
 * `z.enum([...])`) are no longer a schema shape zodexy produces, so every
 * `values` entry's own key is always identical to its (stringified) value;
 * the key-vs-value label distinction below is kept only as a guard.
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
        key === strValue
          ? strValue
          : /* istanbul ignore next -- Guard: no current zodexy enum schema has a key differing from its own value */ `${strValue} (${key})`
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
            ? makeMultiSelectLeaf(this.dataset.searchPath ??
            /* istanbul ignore next -- Guard: buildUI always sets dataset.searchPath */
            '', {$in: selected})
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
