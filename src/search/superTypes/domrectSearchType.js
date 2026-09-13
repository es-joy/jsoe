import {makeDomShapeSearchType} from '../searchElementUtils.js';

/**
 * DOMRect: numeric search ranges for children; "Is/Is not Readonly"
 * (README) - see `searchElementUtils.js`'s `makeDomShapeSearchType` for the
 * shared implementation.
 * @type {import('../searchDispatch.js').SearchTypeObject}
 */
const domrectSearchType = makeDomShapeSearchType({
  tagName: 'jsoe-search-domrect',
  dimensionKeys: ['x', 'y', 'width', 'height'],
  includeReadonly: true
});

export default domrectSearchType;
