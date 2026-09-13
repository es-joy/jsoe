import {makeErrorFamilySearchType} from '../searchElementUtils.js';

/**
 * Special Errors (RangeError/TypeError/SyntaxError/AggregateError/etc.):
 * Literal/Regex search of child string properties, numeric of number
 * children (README, same bullet as plain `Error`) - see
 * `searchElementUtils.js`'s `makeErrorFamilySearchType` for the shared
 * implementation.
 * @type {import('../searchDispatch.js').SearchTypeObject}
 */
const errorsSpecialSearchType = makeErrorFamilySearchType({
  tagName: 'jsoe-search-errors-special'
});

export default errorsSpecialSearchType;
