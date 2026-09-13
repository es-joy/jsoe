import {makeUnionFamilySearchType} from './unionFamilySearchType.js';

/**
 * Union: "Has type &lt;type pull-down&gt;" (README) - see
 * `unionFamilySearchType.js` for the shared implementation.
 * @type {import('../searchDispatch.js').SearchTypeObject}
 */
const unionSearchType = makeUnionFamilySearchType({
  tagName: 'jsoe-search-union', discriminated: false
});

export default unionSearchType;
