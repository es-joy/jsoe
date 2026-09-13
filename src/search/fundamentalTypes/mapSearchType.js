import {buildPathLabel, buildCheckbox, readCheckbox, buildLengthSizeControls, readLengthSizeQuery} from '../searchUtils.js';
import {makeMapRecordJointLeaf, combineAnd} from '../queryTreeBuilders.js';
import {findSearchElement, getQueryViaElement, hasGetQuery} from '../searchElementUtils.js';
import {getSearchTypeObject} from '../searchDispatch.js';

/**
 * @typedef {import('../searchDispatch.js').SearchTypeObject} SearchTypeObject
 */

/**
 * Map, Record: string-type searches of keys, values; ideally would allow
 * search to insist on match of key and value (README) - structurally the
 * same as `recordSearchType.js` (`key`/`value` recursion at `*key`/`*value`
 * segments, a "require same entry" toggle producing one `mapRecordJoint`
 * leaf), plus a `lengthSize` control for `min`/`max` (a `Map`, unlike a
 * `Record`, carries its own size bounds in the schema - the same
 * affordance `setSearchType.js` gets for the analogous reason), combined
 * with the joint leaf via `$and`.
 * @type {SearchTypeObject}
 */
const mapSearchType = {
  buildUI ({schemaObject, path, typeNamespace, topRoot, types}) {
    const label = buildPathLabel(schemaObject, path);
    const name = `${typeNamespace}-map`;
    const mapSchemaObject = /** @type {import('zodexy').SzMap<any, any>} */ (
      schemaObject
    );
    const keyPath = `${path}/*key`;
    const valuePath = `${path}/*value`;
    const keyArr = getSearchTypeObject(mapSchemaObject.key).buildUI({
      schemaObject: mapSchemaObject.key,
      path: keyPath,
      typeNamespace,
      topRoot,
      types
    });
    const valueArr = getSearchTypeObject(mapSchemaObject.value).buildUI({
      schemaObject: mapSchemaObject.value,
      path: valuePath,
      typeNamespace,
      topRoot,
      types
    });
    return ['jsoe-search-map', {
      dataset: {searchPath: path, searchKind: 'map'},
      title: label,
      $define: {
        /** @this {HTMLElement} */
        getQuery () {
          const searchPath = this.dataset.searchPath ?? '';
          const lengthLeaf = readLengthSizeQuery(this, searchPath);
          const keyEl = findSearchElement(this, `${searchPath}/*key`);
          const valueEl = findSearchElement(this, `${searchPath}/*value`);
          const keyQuery = keyEl && hasGetQuery(keyEl)
            ? keyEl.getQuery()
            : undefined;
          const valueQuery = valueEl && hasGetQuery(valueEl)
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
      ['div', {class: 'searchMapKey'}, [
        ['span', ['Key matches: ']],
        keyArr
      ]],
      ['div', {class: 'searchMapValue'}, [
        ['span', ['Value matches: ']],
        valueArr
      ]],
      buildCheckbox({name: `${name}-joint`, label: 'Require same entry'})
    ]];
  },
  getQuery: getQueryViaElement
};

export default mapSearchType;
