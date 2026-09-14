import {
  buildPathLabel, buildOptInFieldset, readOptInChecked, wireOptInFieldset,
  buildAtLeastOneSentinel, syncAtLeastOneCheck
} from '../searchUtils.js';
import {combineAnd} from '../queryTreeBuilders.js';
import {findSearchElement, getQueryViaElement, hasGetQuery} from '../searchElementUtils.js';
import {buildSearchWidget} from '../searchDispatch.js';

/**
 * @typedef {import('../searchDispatch.js').SearchTypeObject} SearchTypeObject
 */

/**
 * @param {Element} root - a `jsoe-search-function` element
 * @returns {void}
 */
function syncFunctionValidity (root) {
  syncAtLeastOneCheck(
    root, () => readOptInChecked(root, 'args') || readOptInChecked(root, 'output')
  );
}

/**
 * Function; pass on args, return type (README) - recurses into both
 * `.input` (itself a tuple, so its own per-position controls come for free
 * via `tupleSearchType.js`) and `.output`, at `*args`/`*output` path
 * segments (`queryTree.js`), combined via `$and`. The build order's own
 * note that `function` is "fuzzy" in the README and could ship as a
 * minimal stub predates `tupleSearchType.js` existing; now that it does,
 * recursing into `.input` through it is no more work than `.output` alone
 * would have been. Each is wrapped in its own `buildOptInFieldset` (an args
 * tuple's own positions are themselves individually opt-in, so args as a
 * whole needs the same treatment one level up), with
 * `buildAtLeastOneSentinel` requiring at least one of the two.
 * @type {SearchTypeObject}
 */
const functionSearchType = {
  buildUI ({schemaObject, path, typeNamespace, topRoot, types, originalJSON}) {
    const label = buildPathLabel(schemaObject, path);
    const name = `${typeNamespace}-function`;
    const functionSchemaObject = /** @type {import('zodexy').SzFunction<any, any>} */ (
      schemaObject
    );
    const argsPath = `${path}/*args`;
    const outputPath = `${path}/*output`;
    const argsArr = buildSearchWidget({
      schemaObject: functionSchemaObject.input,
      path: argsPath,
      typeNamespace,
      topRoot,
      types,
      originalJSON
    });
    const outputArr = buildSearchWidget({
      schemaObject: functionSchemaObject.output,
      path: outputPath,
      typeNamespace,
      topRoot,
      types,
      originalJSON
    });
    return ['jsoe-search-function', {
      dataset: {searchPath: path, searchKind: 'function'},
      title: label,
      $define: {
        /** @this {HTMLElement} */
        connectedCallback () {
          wireOptInFieldset(this, 'args', () => syncFunctionValidity(this));
          wireOptInFieldset(this, 'output', () => syncFunctionValidity(this));
          syncFunctionValidity(this);
        },
        /** @this {HTMLElement} */
        getQuery () {
          const searchPath = this.dataset.searchPath ?? '';
          const argsEl = findSearchElement(this, `${searchPath}/*args`);
          const outputEl = findSearchElement(this, `${searchPath}/*output`);
          const argsQuery = argsEl && hasGetQuery(argsEl) && readOptInChecked(this, 'args')
            ? argsEl.getQuery()
            : undefined;
          const outputQuery = outputEl && hasGetQuery(outputEl) &&
            readOptInChecked(this, 'output')
            ? outputEl.getQuery()
            : undefined;
          return combineAnd([argsQuery, outputQuery]);
        }
      }
    }, [
      ['span', {class: 'searchLabel'}, [label]],
      ...buildOptInFieldset({
        name: `${name}-args`, key: 'args', label: 'Args match', children: [argsArr]
      }),
      ...buildOptInFieldset({
        name: `${name}-output`, key: 'output', label: 'Return value matches',
        children: [outputArr]
      }),
      buildAtLeastOneSentinel()
    ]];
  },
  getQuery: getQueryViaElement
};

export default functionSearchType;
