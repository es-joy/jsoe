import {buildPathLabel, buildCheckbox, readCheckbox} from '../searchUtils.js';
import {makeMapRecordJointLeaf} from '../queryTreeBuilders.js';
import {findSearchElement, getQueryViaElement, hasGetQuery} from '../searchElementUtils.js';
import {buildSearchWidget} from '../searchDispatch.js';

/**
 * @typedef {import('../searchDispatch.js').SearchTypeObject} SearchTypeObject
 */

/**
 * Record search is "key-schema search AND/OR value-schema search,"
 * structurally unlike object's additive "has property" (search plan §1) -
 * recurses into both the `key` and `value` schemas' own search widgets
 * (`*key`/`*value` path segments, `queryTree.js`), and lets the user say
 * whether a match must come from the *same* entry ("has key 2-4 and value
 * 7-9", README) via the "joint" toggle on the resulting `mapRecordJoint`
 * leaf - also used for `looseRecord`, aliased to this same module in
 * `searchDispatch.js` since the search semantics are identical.
 * @type {SearchTypeObject}
 */
const recordSearchType = {
  buildUI ({schemaObject, path, typeNamespace, topRoot, types, originalJSON}) {
    const label = buildPathLabel(schemaObject, path);
    const name = `${typeNamespace}-record`;
    const recordSchemaObject = /** @type {import('zodexy').SzRecord} */ (
      schemaObject
    );
    const keyPath = `${path}/*key`;
    const valuePath = `${path}/*value`;
    const keyArr = buildSearchWidget({
      schemaObject: recordSchemaObject.key,
      path: keyPath,
      typeNamespace,
      topRoot,
      types,
      originalJSON
    });
    const valueArr = buildSearchWidget({
      schemaObject: recordSchemaObject.value,
      path: valuePath,
      typeNamespace,
      topRoot,
      types,
      originalJSON
    });
    return ['jsoe-search-record', {
      dataset: {searchPath: path, searchKind: 'record'},
      title: label,
      $define: {
        /** @this {HTMLElement} */
        getQuery () {
          const searchPath = this.dataset.searchPath ?? '';
          const keyEl = findSearchElement(this, `${searchPath}/*key`);
          const valueEl = findSearchElement(this, `${searchPath}/*value`);
          const keyQuery = keyEl && hasGetQuery(keyEl)
            ? keyEl.getQuery()
            : undefined;
          const valueQuery = valueEl && hasGetQuery(valueEl)
            ? valueEl.getQuery()
            : undefined;
          if (!keyQuery && !valueQuery) {
            return undefined;
          }
          const joint = readCheckbox(this);
          return makeMapRecordJointLeaf(searchPath, joint, keyQuery, valueQuery);
        }
      }
    }, [
      ['span', {class: 'searchLabel'}, [label]],
      ['div', {class: 'searchRecordKey'}, [
        ['span', ['Key matches: ']],
        keyArr
      ]],
      ['div', {class: 'searchRecordValue'}, [
        ['span', ['Value matches: ']],
        valueArr
      ]],
      buildCheckbox({name: `${name}-joint`, label: 'Require same entry'})
    ]];
  },
  getQuery: getQueryViaElement
};

export default recordSearchType;
