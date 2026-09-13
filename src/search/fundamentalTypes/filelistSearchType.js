import {buildPathLabel, buildLengthSizeControls, readLengthSizeQuery} from '../searchUtils.js';
import {combineAnd} from '../queryTreeBuilders.js';
import {findSearchElement, getQueryViaElement, hasGetQuery} from '../searchElementUtils.js';
import {getSearchTypeObject} from '../searchDispatch.js';

/**
 * @typedef {import('../searchDispatch.js').SearchTypeObject} SearchTypeObject
 */

/**
 * @typedef {{
 *   type: 'array',
 *   element: import('../../formats/schema.js').ZodexSchema,
 *   minLength?: number,
 *   maxLength?: number
 * }} FilelistOutputSchema
 */

/**
 * Has length/size of &lt;number&gt; (README, grouped with array/set/
 * tuple-with-rest) - no sparse toggle, matching `setSearchType.js`. A
 * `FileList` schema serializes as `{type: 'codec', name: 'filelist',
 * output: {type: 'array', element: {type: 'file', ...}}}`
 * (`src/formats/schema.js`'s `codec`/`filelist` handling); the length
 * bounds and element schema both live on that `output` array shape, whose
 * element recurses into `fileSearchType.js` under the same `*` path-segment
 * convention `arraySearchType.js` uses.
 * @type {SearchTypeObject}
 */
const filelistSearchType = {
  buildUI ({schemaObject, path, typeNamespace, topRoot, types}) {
    const label = buildPathLabel(schemaObject, path);
    const name = `${typeNamespace}-filelist`;
    const outputSchema = /** @type {FilelistOutputSchema} */ (
      /** @type {{output: unknown}} */ (schemaObject).output
    );
    const elementPath = `${path}/*`;
    const elementArr = getSearchTypeObject(outputSchema.element).buildUI({
      schemaObject: outputSchema.element,
      path: elementPath,
      typeNamespace,
      topRoot,
      types
    });
    return ['jsoe-search-filelist', {
      dataset: {searchPath: path, searchKind: 'filelist'},
      title: label,
      $define: {
        /** @this {HTMLElement} */
        getQuery () {
          const searchPath = this.dataset.searchPath ?? '';
          const lengthLeaf = readLengthSizeQuery(this, searchPath);
          const elementEl = findSearchElement(this, `${searchPath}/*`);
          const elementLeaf = elementEl && hasGetQuery(elementEl)
            ? elementEl.getQuery()
            : undefined;
          return combineAnd([lengthLeaf, elementLeaf]);
        }
      }
    }, [
      ['span', {class: 'searchLabel'}, [label]],
      ...buildLengthSizeControls({
        name,
        min: outputSchema.minLength,
        max: outputSchema.maxLength,
        includeSparse: false
      }),
      ['div', {class: 'searchFilelistElement'}, [
        ['span', ['File matches: ']],
        elementArr
      ]]
    ]];
  },
  getQuery: getQueryViaElement
};

export default filelistSearchType;
