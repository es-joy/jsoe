import {
  buildPathLabel, buildCheckbox, readCheckbox, buildLengthSizeControls,
  readLengthSizeQuery, buildOptInFieldset, readOptInChecked, wireOptInFieldset,
  buildAtLeastOneSentinel, syncAtLeastOneCheck
} from '../searchUtils.js';
import {makeMapRecordJointLeaf, combineAnd} from '../queryTreeBuilders.js';
import {findSearchElement, getQueryViaElement, hasGetQuery} from '../searchElementUtils.js';
import {buildSearchWidget} from '../searchDispatch.js';

/**
 * @typedef {import('../searchDispatch.js').SearchTypeObject} SearchTypeObject
 */

/**
 * @param {Element} root - a `jsoe-search-map` element
 * @returns {void}
 */
function syncMapValidity (root) {
  syncAtLeastOneCheck(
    root, () => readOptInChecked(root, 'key') || readOptInChecked(root, 'value') ||
      readLengthSizeQuery(root, '') !== undefined
  );
}

/**
 * Map, Record: string-type searches of keys, values; ideally would allow
 * search to insist on match of key and value (README) - structurally the
 * same as `recordSearchType.js` (`key`/`value` recursion at `*key`/`*value`
 * segments, a "require same entry" toggle producing one `mapRecordJoint`
 * leaf), plus a `lengthSize` control for `min`/`max` (a `Map`, unlike a
 * `Record`, carries its own size bounds in the schema - the same
 * affordance `setSearchType.js` gets for the analogous reason), combined
 * with the joint leaf via `$and`. Key and value are each wrapped in their
 * own `buildOptInFieldset` (so leaving either at "no constraint" doesn't
 * force it via a `required` control inside), but *leaving all three*
 * (key, value, and size) unconfigured is itself invalid via
 * `buildAtLeastOneSentinel` - unlike `recordSearchType.js` (which has no
 * size control of its own and so needs key or value specifically), a
 * length/size-only search is already meaningful here, the same as
 * `arraySearchType.js`/`setSearchType.js`.
 * @type {SearchTypeObject}
 */
const mapSearchType = {
  buildUI ({schemaObject, path, typeNamespace, topRoot, types, originalJSON}) {
    const label = buildPathLabel(schemaObject, path);
    const name = `${typeNamespace}-map`;
    const mapSchemaObject = /** @type {import('zodexy').SzMap<any, any>} */ (
      schemaObject
    );
    const keyPath = `${path}/*key`;
    const valuePath = `${path}/*value`;
    const keyArr = buildSearchWidget({
      schemaObject: mapSchemaObject.key,
      path: keyPath,
      typeNamespace,
      topRoot,
      types,
      originalJSON
    });
    const valueArr = buildSearchWidget({
      schemaObject: mapSchemaObject.value,
      path: valuePath,
      typeNamespace,
      topRoot,
      types,
      originalJSON
    });
    return ['jsoe-search-map', {
      dataset: {searchPath: path, searchKind: 'map'},
      title: label,
      $define: {
        /** @this {HTMLElement} */
        connectedCallback () {
          wireOptInFieldset(this, 'key', () => syncMapValidity(this));
          wireOptInFieldset(this, 'value', () => syncMapValidity(this));
          this.querySelector('input.jsoeSearchSize')?.addEventListener(
            'input', () => syncMapValidity(this)
          );
          syncMapValidity(this);
        },
        /** @this {HTMLElement} */
        getQuery () {
          const searchPath = this.dataset.searchPath ?? '';
          const lengthLeaf = readLengthSizeQuery(this, searchPath);
          const keyEl = findSearchElement(this, `${searchPath}/*key`);
          const valueEl = findSearchElement(this, `${searchPath}/*value`);
          const keyQuery = keyEl && hasGetQuery(keyEl) && readOptInChecked(this, 'key')
            ? keyEl.getQuery()
            : undefined;
          const valueQuery = valueEl && hasGetQuery(valueEl) && readOptInChecked(this, 'value')
            ? valueEl.getQuery()
            : undefined;
          const jointLeaf = keyQuery || valueQuery
            ? makeMapRecordJointLeaf(searchPath, readCheckbox(this), keyQuery, valueQuery)
            : undefined;
          return combineAnd([lengthLeaf, jointLeaf]);
        }
      }
    }, [
      ['span', {class: 'searchLabel'}, [label]],
      ...buildLengthSizeControls({
        name, min: mapSchemaObject.min, max: mapSchemaObject.max, includeSparse: false
      }),
      ...buildOptInFieldset({
        name: `${name}-key`, key: 'key', label: 'Key matches', children: [keyArr]
      }),
      ...buildOptInFieldset({
        name: `${name}-value`, key: 'value', label: 'Value matches', children: [valueArr]
      }),
      buildCheckbox({name: `${name}-joint`, label: 'Require same entry'}),
      buildAtLeastOneSentinel()
    ]];
  },
  getQuery: getQueryViaElement
};

export default mapSearchType;
