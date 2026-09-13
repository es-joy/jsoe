import {makeDomShapeSearchType} from '../searchElementUtils.js';

/**
 * DOMPoint: numeric search ranges for children; "Is/Is not Readonly"
 * (README) - see `searchElementUtils.js`'s `makeDomShapeSearchType` for the
 * shared implementation.
 * @type {import('../searchDispatch.js').SearchTypeObject}
 */
const dompointSearchType = makeDomShapeSearchType({
  tagName: 'jsoe-search-dompoint',
  dimensionKeys: ['x', 'y', 'z', 'w'],
  includeReadonly: true
});

export default dompointSearchType;
