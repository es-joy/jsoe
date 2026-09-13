import {makePresenceOnlySearchType} from '../searchElementUtils.js';

/**
 * `NaN`: "no variants to allow for distinct search" (README).
 * @type {import('../searchDispatch.js').SearchTypeObject}
 */
const nanSearchType = makePresenceOnlySearchType({
  tagName: 'jsoe-search-nan'
});

export default nanSearchType;
