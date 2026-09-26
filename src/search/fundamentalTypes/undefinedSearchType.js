import {makePresenceOnlySearchType} from '../searchElementUtils.js';

/**
 * `undefined`/`void`: "no variants to allow for distinct search" (README).
 * @type {import('../searchDispatch.js').SearchTypeObject}
 */
const undefinedSearchType = makePresenceOnlySearchType({
  tagName: 'jsoe-search-undefined', searchKind: 'undef'
});

export default undefinedSearchType;
