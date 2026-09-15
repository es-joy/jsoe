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
 * @param {Element} root - a `jsoe-search-array` element
 * @returns {void}
 */
function syncArrayValidity (root) {
  syncAtLeastOneCheck(
    root, () => readLengthSizeQuery(root, '') !== undefined || readOptInChecked(root)
  );
}

/**
 * Has length/size of &lt;number&gt;; Is/Is not sparse (README), plus - by
 * recursing into the element schema's own search widget (search plan §6
 * build order) - "the array contains at least one element matching Y",
 * expressed via a `*` path segment (`queryTree.js`) so no dedicated wrapper
 * leaf kind is needed: the two constraints simply combine with `$and`. The
 * element match is wrapped in `buildOptInFieldset` (default unchecked/
 * disabled) so a length/size-only search stays valid: unlike the length/
 * size inputs (plain, un-`required` numbers), the recursed element widget
 * can itself carry `required` controls (e.g. a `string` element's Value),
 * which would otherwise force this whole array invalid just for existing,
 * whether or not the user actually wants an element constraint. Leaving
 * both length/size and the element match unconfigured at once is still
 * invalid, though (`buildAtLeastOneSentinel`) - the same "no absent values"
 * reasoning as everywhere else, just with two facets where either alone
 * already suffices.
 * @type {SearchTypeObject}
 */
const arraySearchType = {
  buildUI ({schemaObject, path, typeNamespace, topRoot, types, originalJSON}) {
    const label = buildPathLabel(schemaObject, path);
    const name = `${typeNamespace}-array`;
    const arraySchemaObject = /** @type {import('zodexy').SzArray} */ (
      schemaObject
    );
    const elementPath = `${path}/*`;
    const elementArr = buildSearchWidget({
      schemaObject: arraySchemaObject.element,
      path: elementPath,
      typeNamespace,
      topRoot,
      types,
      originalJSON
    });
    return ['jsoe-search-array', {
      dataset: {searchPath: path, searchKind: 'array'},
      title: label,
      $define: {
        /** @this {HTMLElement} */
        connectedCallback () {
          wireOptInFieldset(this, '', () => syncArrayValidity(this));
          this.querySelector('input.jsoeSearchSize')?.addEventListener(
            'input', () => syncArrayValidity(this)
          );
          this.querySelector('select.jsoeSearchTriState--')?.addEventListener(
            'change', () => syncArrayValidity(this)
          );
          syncArrayValidity(this);
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
          // Whatever's left (0 or 1 clauses, `combineAnd` only ever having
          // combined the length/size leaf with the recursed element's own
          // subtree) belongs to the element widget.
          applyOptIn(this, rest !== undefined, '');
          const elementEl = findSearchElement(this, `${searchPath}/*`);
          if (elementEl && hasApplyQuery(elementEl)) {
            elementEl.applyQuery(rest);
          }
          syncArrayValidity(this);
        }
      }
    }, [
      ['span', {class: 'searchLabel'}, [label]],
      ...buildLengthSizeControls({
        name,
        min: arraySchemaObject.minLength,
        max: arraySchemaObject.maxLength,
        includeSparse: true
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

export default arraySearchType;
