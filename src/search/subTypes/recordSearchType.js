import {
  buildPathLabel, buildCheckbox, readCheckbox, applyCheckbox, buildOptInFieldset,
  readOptInChecked, wireOptInFieldset, applyOptIn, buildAtLeastOneSentinel,
  syncAtLeastOneCheck, extractLeafOfKind
} from '../searchUtils.js';
import {makeMapRecordJointLeaf} from '../queryTreeBuilders.js';
import {
  findSearchElement, getQueryViaElement, hasGetQuery,
  applyQueryViaElement, hasApplyQuery
} from '../searchElementUtils.js';
import {buildSearchWidget} from '../searchDispatch.js';

/**
 * @typedef {import('../searchDispatch.js').SearchTypeObject} SearchTypeObject
 */

/**
 * @param {Element} root - a `jsoe-search-record` element
 * @returns {void}
 */
function syncKeyValueValidity (root) {
  syncAtLeastOneCheck(
    root, () => readOptInChecked(root, 'key') || readOptInChecked(root, 'value')
  );
}

/**
 * Record search is "key-schema search AND/OR value-schema search,"
 * structurally unlike object's additive "has property" (search plan §1) -
 * recurses into both the `key` and `value` schemas' own search widgets
 * (`*key`/`*value` path segments, `queryTree.js`), and lets the user say
 * whether a match must come from the *same* entry ("has key 2-4 and value
 * 7-9", README) via the "joint" toggle on the resulting `mapRecordJoint`
 * leaf - also used for `looseRecord`, aliased to this same module in
 * `searchDispatch.js` since the search semantics are identical. Key and
 * value each get their own `buildOptInFieldset` (see `mapSearchType.js`'s
 * matching doc for why), but leaving *both* unopted-in is itself invalid via
 * `buildAtLeastOneSentinel`.
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
        connectedCallback () {
          wireOptInFieldset(this, 'key', () => syncKeyValueValidity(this));
          wireOptInFieldset(this, 'value', () => syncKeyValueValidity(this));
          syncKeyValueValidity(this);
        },
        /** @this {HTMLElement} */
        getQuery () {
          const searchPath = this.dataset.searchPath ?? '';
          const keyEl = findSearchElement(this, `${searchPath}/*key`);
          const valueEl = findSearchElement(this, `${searchPath}/*value`);
          const keyQuery = keyEl && hasGetQuery(keyEl) && readOptInChecked(this, 'key')
            ? keyEl.getQuery()
            : undefined;
          const valueQuery = valueEl && hasGetQuery(valueEl) && readOptInChecked(this, 'value')
            ? valueEl.getQuery()
            : undefined;
          if (!keyQuery && !valueQuery) {
            return undefined;
          }
          const joint = readCheckbox(this);
          return makeMapRecordJointLeaf(searchPath, joint, keyQuery, valueQuery);
        },
        /**
         * @this {HTMLElement}
         * @param {import('../queryTree.js').QueryNode|undefined} queryNode
         * @returns {void}
         */
        applyQuery (queryNode) {
          const searchPath = this.dataset.searchPath ?? '';
          const {matched: jointLeaf} = extractLeafOfKind(queryNode, 'mapRecordJoint');
          applyCheckbox(this, Boolean(jointLeaf?.joint));
          applyOptIn(this, jointLeaf?.keyQuery !== undefined, 'key');
          applyOptIn(this, jointLeaf?.valueQuery !== undefined, 'value');
          const keyEl = findSearchElement(this, `${searchPath}/*key`);
          if (keyEl && hasApplyQuery(keyEl)) {
            keyEl.applyQuery(jointLeaf?.keyQuery);
          }
          const valueEl = findSearchElement(this, `${searchPath}/*value`);
          if (valueEl && hasApplyQuery(valueEl)) {
            valueEl.applyQuery(jointLeaf?.valueQuery);
          }
          syncKeyValueValidity(this);
        }
      }
    }, [
      ['span', {class: 'searchLabel'}, [label]],
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
  getQuery: getQueryViaElement,
  applyQuery: applyQueryViaElement
};

export default recordSearchType;
