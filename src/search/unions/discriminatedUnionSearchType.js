import {makeUnionFamilySearchType} from './unionFamilySearchType.js';

/**
 * Discriminated Union: "Has type &lt;type pull-down&gt;", using the
 * discriminator of discriminated union (README) - the type pull-down's
 * options are labelled by each branch's discriminator value (e.g.
 * `'circle'`/`'square'`) rather than a generic type name, and the resulting
 * `typeOf` leaf carries that value too (`queryTree.js`). See
 * `unionFamilySearchType.js` for the shared implementation.
 * @type {import('../searchDispatch.js').SearchTypeObject}
 */
const discriminatedUnionSearchType = makeUnionFamilySearchType({
  tagName: 'jsoe-search-discriminated-union', discriminated: true
});

export default discriminatedUnionSearchType;
