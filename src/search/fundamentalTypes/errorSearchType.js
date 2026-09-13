import {makeErrorFamilySearchType} from '../searchElementUtils.js';

/**
 * Error: Literal/Regex search of child string properties, numeric of
 * number children (README) - see `searchElementUtils.js`'s
 * `makeErrorFamilySearchType` for the shared implementation.
 * @type {import('../searchDispatch.js').SearchTypeObject}
 */
const errorSearchType = makeErrorFamilySearchType({tagName: 'jsoe-search-error'});

export default errorSearchType;
