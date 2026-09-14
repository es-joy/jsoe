import {
  buildPathLabel, buildLengthSizeControls, readLengthSizeQuery,
  buildOptInFieldset, readOptInChecked, wireOptInFieldset
} from '../searchUtils.js';
import {combineAnd} from '../queryTreeBuilders.js';
import {findSearchElement, getQueryViaElement, hasGetQuery} from '../searchElementUtils.js';
import {buildSearchWidget} from '../searchDispatch.js';

/**
 * @typedef {import('../searchDispatch.js').SearchTypeObject} SearchTypeObject
 */

/**
 * Has length/size of &lt;number&gt;; Is/Is not sparse (README), plus - by
 * recursing into the element schema's own search widget (search plan §6
 * build order) - "the array contains at least one element matching Y",
 * expressed via a `*` path segment (`queryTree.js`) so no dedicated wrapper
 * leaf kind is needed: the two constraints simply combine with `$and`. The
 * element match is wrapped in `buildOptInFieldset` (default unchecked/
 * disabled) so a length/size-only search - or no constraint at all - stays
 * valid: unlike the length/size inputs (plain, un-`required` numbers), the
 * recursed element widget can itself carry `required` controls (e.g. a
 * `string` element's Value), which would otherwise force this whole array
 * invalid just for existing, whether or not the user actually wants an
 * element constraint.
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
          wireOptInFieldset(this);
        },
        /** @this {HTMLElement} */
        getQuery () {
          const searchPath = this.dataset.searchPath ?? '';
          const lengthLeaf = readLengthSizeQuery(this, searchPath);
          const elementEl = findSearchElement(this, `${searchPath}/*`);
          const elementLeaf = readOptInChecked(this) && elementEl && hasGetQuery(elementEl)
            ? elementEl.getQuery()
            : undefined;
          return combineAnd([lengthLeaf, elementLeaf]);
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
      })
    ]];
  },
  getQuery: getQueryViaElement
};

export default arraySearchType;
