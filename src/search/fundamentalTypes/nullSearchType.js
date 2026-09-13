import {makePresenceOnlySearchType} from '../searchElementUtils.js';

/**
 * `null`: "no variants to allow for distinct search" (README).
 * @type {import('../searchDispatch.js').SearchTypeObject}
 */
const nullSearchType = makePresenceOnlySearchType({
  tagName: 'jsoe-search-null'
});

export default nullSearchType;
