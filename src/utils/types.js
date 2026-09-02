/**
 * @param {unknown} obj
 */
export const isNullish = (obj) => {
  return obj === null || typeof obj === 'undefined';
};

/**
 * Zodex schema types which jsoe expands into a flat set of candidate leaf
 * types and drives from a single type-choices control: `union` (anyOf), `xor`
 * (exactly one), and `discriminatedUnion` (keyed by a literal field). They
 * share `options` and, downstream, the same option-indexing logic.
 * @type {readonly ['union', 'xor', 'discriminatedUnion']}
 */
const unionLikeTypes = ['union', 'xor', 'discriminatedUnion'];

/**
 * @param {string|undefined} type
 * @returns {boolean}
 */
export const isUnionLike = (type) => {
  return unionLikeTypes.includes(
    /** @type {typeof unionLikeTypes[number]} */ (type)
  );
};
