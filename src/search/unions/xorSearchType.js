import {makeUnionFamilySearchType} from './unionFamilySearchType.js';

/**
 * Xor (exclusive union): "Has type &lt;type pull-down&gt;" (README) - see
 * `unionFamilySearchType.js` for the shared implementation.
 * `getXorBranchMatchInfo` (`src/formats/schema.js`) is deliberately not
 * reused here, same as the search plan already rules out for xor generally
 * (§4): it requires a concrete value to test branch match, which the search
 * side never has.
 * @type {import('../searchDispatch.js').SearchTypeObject}
 */
const xorSearchType = makeUnionFamilySearchType({
  tagName: 'jsoe-search-xor', discriminated: false
});

export default xorSearchType;
