import {jml} from '../vendor-imports.js';
import {getSearchTypeObject, buildSearchWidget, resolveIntersection} from './searchDispatch.js';

/**
 * @typedef {{
 *   container: HTMLFormElement,
 *   $getQuery: () => import('./queryTree.js').QueryAnd,
 *   $applyQuery: (queryDoc: import('./queryTree.js').QueryAnd) => void,
 *   whenReady: Promise<void>
 * }} SearchChoicesControl
 */

/**
 * The top-level entry point (search plan §5): builds the whole recursive
 * search widget tree for `schemaContent` via `buildSearchWidget`
 * (`searchDispatch.js`), starting at `path = '#/'`. Does not route through
 * `getTypesForSchema` for the general case - that function flattens union
 * members into one flat `Set` of leaf types for a type-choice pull-down,
 * whereas search needs union branches to stay distinguishable nested
 * sub-widgets for the "has type" affordance (`unionSearchType.js` et al.) -
 * `getTypesForSchema` is only reused narrowly, for intersection resolution,
 * inside `buildSearchWidget`/`resolveIntersection` - which run at *every*
 * recursive call site (every composite module's own child recursion uses
 * `buildSearchWidget` too), not just here at the root, so an intersection
 * schema nested anywhere in the tree resolves the same way a top-level one
 * does rather than falling through to the `noneditableSearchType` escape
 * hatch.
 *
 * `resolveIntersection` is called here too (redundantly, but cheaply, since
 * it's a no-op for anything that isn't itself an `intersection`) purely so
 * `$getQuery()` below dispatches through the *same* resolved schema
 * `buildSearchWidget` actually built the UI for, rather than the original
 * (possibly-`intersection`) one.
 *
 * Mirrors `buildTypeChoices`'s (`src/typeChoices.js`) `whenReady`/
 * pull-based convention rather than inventing a push/callback API:
 * `$getQuery()` reads the live DOM into a `QueryAnd` on demand (`{$and:
 * []}` when nothing has been entered anywhere, matching the empty-`$and`
 * convention of "no constraint"), and a host that wants live updates wraps
 * it in its own `container.addEventListener('input', ...)`. Every widget
 * built so far is synchronous, so `whenReady` (unlike `buildTypeChoices`'s)
 * has no deferred work to wait on and settles immediately - it's still
 * returned, so a caller can `await` either function uniformly without
 * checking which one it has.
 *
 * `container` is a real `<form>` (its own `submit` prevented, since it is
 * never actually submitted) rather than a plain `<div>`, matching the edit
 * side's own root `<form>` (`src/types.js`'s `Types.validValuesSet` reads
 * `form.checkValidity()`) - the various cross-field checks the individual
 * search widgets wire up (`searchUtils.js`'s `buildRangeInputsPair`,
 * `dateSearchType.js`, etc.) are native Constraint Validation API calls
 * (`setCustomValidity`/`required`), so a host only needs the one native
 * `container.checkValidity()`/`container.reportValidity()` to check them
 * all at once, the same way `demo/index-search.js`'s "Check validity"
 * button does.
 * @param {{
 *   schemaContent: import('../formats/schema.js').ZodexySchema,
 *   typeNamespace?: string,
 *   topRoot?: import('../types.js').RootElement,
 *   types?: import('../types.js').default
 * }} cfg
 * @returns {SearchChoicesControl}
 */
export function buildSearchChoices ({schemaContent, typeNamespace, topRoot, types}) {
  // Not '#/': `getJSONPointerParts` (`src/utils/jsonPointer.js`) splits on
  //   '/' and drops the leading '#', so '#/' parts to `['']` (one segment
  //   named the empty string) rather than `[]` (the root, no segments yet)
  //   - every recursive module here appends `${path}/segment`, so starting
  //   from the bare '#' is what keeps the first level from coming out as
  //   '#//segment'.
  const path = '#';
  const arr = buildSearchWidget({
    schemaObject: schemaContent, path, typeNamespace, topRoot, types,
    originalJSON: schemaContent
  });
  const container = /** @type {HTMLFormElement} */ (
    jml('form', {
      class: 'searchChoicesContainer',
      $on: {
        submit (e) {
          e.preventDefault();
        }
      }
    }, [arr])
  );
  const schemaObject = resolveIntersection(schemaContent, schemaContent);
  return {
    container,
    $getQuery () {
      const result = getSearchTypeObject(schemaObject).getQuery({
        root: container, path
      });
      return {$and: result === undefined ? [] : [result]};
    },
    /**
     * The "Edit raw" round-trip's entry point - the inverse of `$getQuery`,
     * unwrapping its own `{$and: [...]}` convention back to a bare
     * `QueryNode` (or `undefined` for an empty `$and`, "no constraint")
     * before handing off to the root schema's own `applyQuery`, which
     * recurses through the whole tree exactly as `getQuery` does.
     * @param {import('./queryTree.js').QueryAnd} queryDoc
     * @returns {void}
     */
    $applyQuery (queryDoc) {
      const {$and: clauses} = queryDoc;
      let queryNode;
      if (clauses.length === 1) {
        [queryNode] = clauses;
      } else if (clauses.length > 1) {
        queryNode = {$and: clauses};
      }
      getSearchTypeObject(schemaObject).applyQuery({
        root: container, path, queryNode
      });
    },
    whenReady: Promise.resolve()
  };
}
