import {makeDomShapeSearchType} from '../searchElementUtils.js';

const threeDOnlyKeys = [
  'm11', 'm12', 'm13', 'm14',
  'm21', 'm22', 'm23', 'm24',
  'm31', 'm32', 'm33', 'm34',
  'm41', 'm42', 'm43', 'm44'
];

/**
 * DOMMatrix: numeric search ranges for children; "Is/Is not Readonly";
 * "Is/Is not 3d" (README) - see `searchElementUtils.js`'s
 * `makeDomShapeSearchType` for the shared implementation. `dimensionKeys`
 * covers both the 2D (`a`-`f`) and 3D (`m11`-`m44`) property sets at once;
 * `threeDOnlyKeys` (the 3D-only subset) are hidden by default and only
 * shown once "Is 3d" is answered `true` - see that factory's doc for why.
 * @type {import('../searchDispatch.js').SearchTypeObject}
 */
const dommatrixSearchType = makeDomShapeSearchType({
  tagName: 'jsoe-search-dommatrix',
  searchKind: 'dommatrix',
  dimensionKeys: [
    'a', 'b', 'c', 'd', 'e', 'f',
    ...threeDOnlyKeys
  ],
  threeDOnlyKeys,
  includeReadonly: true,
  includeDimensionCheck: true
});

export default dommatrixSearchType;
