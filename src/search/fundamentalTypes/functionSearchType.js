import {buildPathLabel} from '../searchUtils.js';
import {combineAnd} from '../queryTreeBuilders.js';
import {findSearchElement, getQueryViaElement, hasGetQuery} from '../searchElementUtils.js';
import {getSearchTypeObject} from '../searchDispatch.js';

/**
 * @typedef {import('../searchDispatch.js').SearchTypeObject} SearchTypeObject
 */

/**
 * Function; pass on args, return type (README) - recurses into both
 * `.input` (itself a tuple, so its own per-position controls come for free
 * via `tupleSearchType.js`) and `.output`, at `*args`/`*output` path
 * segments (`queryTree.js`), combined via `$and`. The build order's own
 * note that `function` is "fuzzy" in the README and could ship as a
 * minimal stub predates `tupleSearchType.js` existing; now that it does,
 * recursing into `.input` through it is no more work than `.output` alone
 * would have been.
 * @type {SearchTypeObject}
 */
const functionSearchType = {
  buildUI ({schemaObject, path, typeNamespace, topRoot, types}) {
    const label = buildPathLabel(schemaObject, path);
    const functionSchemaObject = /** @type {import('zodexy').SzFunction<any, any>} */ (
      schemaObject
    );
    const argsPath = `${path}/*args`;
    const outputPath = `${path}/*output`;
    const argsArr = getSearchTypeObject(functionSchemaObject.input).buildUI({
      schemaObject: functionSchemaObject.input,
      path: argsPath,
      typeNamespace,
      topRoot,
      types
    });
    const outputArr = getSearchTypeObject(functionSchemaObject.output).buildUI({
      schemaObject: functionSchemaObject.output,
      path: outputPath,
      typeNamespace,
      topRoot,
      types
    });
    return ['jsoe-search-function', {
      dataset: {searchPath: path, searchKind: 'function'},
      title: label,
      $define: {
        /** @this {HTMLElement} */
        getQuery () {
          const searchPath = this.dataset.searchPath ?? '';
          const argsEl = findSearchElement(this, `${searchPath}/*args`);
          const outputEl = findSearchElement(this, `${searchPath}/*output`);
          const argsQuery = argsEl && hasGetQuery(argsEl)
            ? argsEl.getQuery()
            : undefined;
          const outputQuery = outputEl && hasGetQuery(outputEl)
            ? outputEl.getQuery()
            : undefined;
          return combineAnd([argsQuery, outputQuery]);
        }
      }
    }, [
      ['span', {class: 'searchLabel'}, [label]],
      ['div', {class: 'searchFunctionArgs'}, [
        ['span', ['Args match: ']],
        argsArr
      ]],
      ['div', {class: 'searchFunctionOutput'}, [
        ['span', ['Return value matches: ']],
        outputArr
      ]]
    ]];
  },
  getQuery: getQueryViaElement
};

export default functionSearchType;
