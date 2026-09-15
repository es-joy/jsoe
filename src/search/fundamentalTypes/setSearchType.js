import {
  buildPathLabel, buildLengthSizeControls, readLengthSizeQuery, applyLengthSizeQuery,
  buildOptInFieldset, readOptInChecked, wireOptInFieldset, applyOptIn,
  buildAtLeastOneSentinel, syncAtLeastOneCheck, extractLeafOfKind
} from '../searchUtils.js';
import {combineAnd} from '../queryTreeBuilders.js';
import {
  findSearchElement, getQueryViaElement, hasGetQuery,
  applyQueryViaElement, hasApplyQuery
} from '../searchElementUtils.js';
import {buildSearchWidget} from '../searchDispatch.js';

/**
 * @typedef {import('../searchDispatch.js').SearchTypeObject} SearchTypeObject
 */

/**
 * @param {Element} root - a `jsoe-search-set` element
 * @returns {void}
 */
function syncSetValidity (root) {
  syncAtLeastOneCheck(
    root, () => readLengthSizeQuery(root, '') !== undefined || readOptInChecked(root)
  );
}

/**
 * Has length/size of &lt;number&gt; (README) - no sparse toggle: unlike
 * `array`, a `Set` cannot have holes. Also recurses into the value schema's
 * own search widget (as `arraySearchType.js` does for its element), via the
 * same `*` path-segment convention (`queryTree.js`), wrapped in the same
 * `buildOptInFieldset` `arraySearchType.js` uses and for the same reason -
 * a length/size-only search should stay valid. Leaving *both* length/size
 * and the element match unconfigured is still invalid, though
 * (`buildAtLeastOneSentinel`), same as `arraySearchType.js`.
 * @type {SearchTypeObject}
 */
const setSearchType = {
  buildUI ({schemaObject, path, typeNamespace, topRoot, types, originalJSON}) {
    const label = buildPathLabel(schemaObject, path);
    const name = `${typeNamespace}-set`;
    const setSchemaObject = /** @type {import('zodexy').SzSet} */ (
      schemaObject
    );
    const elementPath = `${path}/*`;
    const elementArr = buildSearchWidget({
      schemaObject: setSchemaObject.value,
      path: elementPath,
      typeNamespace,
      topRoot,
      types,
      originalJSON
    });
    return ['jsoe-search-set', {
      dataset: {searchPath: path, searchKind: 'set'},
      title: label,
      $define: {
        /** @this {HTMLElement} */
        connectedCallback () {
          wireOptInFieldset(this, '', () => syncSetValidity(this));
          this.querySelector('input.jsoeSearchSize')?.addEventListener(
            'input', () => syncSetValidity(this)
          );
          syncSetValidity(this);
        },
        /** @this {HTMLElement} */
        getQuery () {
          const searchPath = this.dataset.searchPath ?? '';
          const lengthLeaf = readLengthSizeQuery(this, searchPath);
          const elementEl = findSearchElement(this, `${searchPath}/*`);
          const elementLeaf = elementEl && hasGetQuery(elementEl) && readOptInChecked(this)
            ? elementEl.getQuery()
            : undefined;
          return combineAnd([lengthLeaf, elementLeaf]);
        },
        /**
         * @this {HTMLElement}
         * @param {import('../queryTree.js').QueryNode|undefined} queryNode
         * @returns {void}
         */
        applyQuery (queryNode) {
          const searchPath = this.dataset.searchPath ?? '';
          const {matched: lengthLeaf, rest} = extractLeafOfKind(queryNode, 'lengthSize');
          applyLengthSizeQuery(this, lengthLeaf);
          applyOptIn(this, rest !== undefined, '');
          const elementEl = findSearchElement(this, `${searchPath}/*`);
          if (elementEl && hasApplyQuery(elementEl)) {
            elementEl.applyQuery(rest);
          }
          syncSetValidity(this);
        }
      }
    }, [
      ['span', {class: 'searchLabel'}, [label]],
      ...buildLengthSizeControls({
        name,
        min: setSchemaObject.minSize,
        max: setSchemaObject.maxSize,
        includeSparse: false
      }),
      ...buildOptInFieldset({
        name: `${name}-element`, label: 'Element matches', children: [elementArr]
      }),
      buildAtLeastOneSentinel()
    ]];
  },
  getQuery: getQueryViaElement,
  applyQuery: applyQueryViaElement
};

export default setSearchType;
