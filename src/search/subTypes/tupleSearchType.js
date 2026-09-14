import {
  buildPathLabel, buildLengthSizeControls, readLengthSizeQuery,
  buildOptInFieldset, readOptInChecked, wireOptInFieldset
} from '../searchUtils.js';
import {combineAnd} from '../queryTreeBuilders.js';
import {findSearchElement, getQueryViaElement, hasGetQuery} from '../searchElementUtils.js';
import {buildSearchWidget} from '../searchDispatch.js';

/**
 * @typedef {import('../searchDispatch.js').SearchTypeObject} SearchTypeObject
 */

/**
 * Each fixed position gets its own control from `.items[i]`, not one
 * control repeated per element (search plan §1 - unlike the value-editing
 * side, this gets a dedicated module rather than delegating to
 * `arraySearchType.js`, since positions aren't interchangeable). A tuple
 * with no `rest` has an inherently fixed length (`items.length`), so - as
 * with a fixed-length array - no length control is shown for it; "with rest
 * has size search as with arrays" (README) applies once `rest` is present:
 * total length becomes a variable-length `lengthSize` control (`min:
 * items.length`, no sparse toggle - not applicable to a tuple), and the
 * `rest` element itself recurses into its own search widget under the same
 * `*` path-segment convention `arraySearchType.js` uses for its element.
 * @type {SearchTypeObject}
 */
const tupleSearchType = {
  buildUI ({schemaObject, path, typeNamespace, topRoot, types, originalJSON}) {
    const label = buildPathLabel(schemaObject, path);
    const name = `${typeNamespace}-tuple`;
    const tupleSchemaObject = /** @type {import('zodexy').SzTuple} */ (
      schemaObject
    );
    const {items, rest} = tupleSchemaObject;

    const itemArrs = items.map((itemSchema, idx) => buildSearchWidget({
      schemaObject: itemSchema,
      path: `${path}/${idx}`,
      typeNamespace,
      topRoot,
      types,
      originalJSON
    }));

    const restElementPath = `${path}/*`;
    const restArr = rest
      ? buildSearchWidget({
        schemaObject: rest,
        path: restElementPath,
        typeNamespace,
        topRoot,
        types,
        originalJSON
      })
      : undefined;

    /** @type {import('../../types.js').JamilihArray[]} */
    const children = [['span', {class: 'searchLabel'}, [label]]];
    itemArrs.forEach((itemArr, idx) => {
      children.push(...buildOptInFieldset({
        name: `${name}-${idx}`, key: String(idx), label: `Position ${idx} matches`,
        children: [itemArr]
      }));
    });
    if (rest) {
      const restChild = /** @type {import('../../types.js').JamilihArray} */ (restArr);
      children.push(
        ...buildLengthSizeControls({
          name, min: items.length, max: undefined, includeSparse: false
        }),
        ...buildOptInFieldset({
          name: `${name}-rest`, key: 'rest', label: 'Rest element matches',
          children: [restChild]
        })
      );
    }

    return ['jsoe-search-tuple', {
      dataset: {
        searchPath: path, searchKind: 'tuple',
        itemCount: String(items.length), hasRest: rest ? 'true' : ''
      },
      title: label,
      $define: {
        // Reads `itemCount`/`hasRest` off `this.dataset` rather than
        //   closing over `items`/`rest`: `$define`'s mixin is installed
        //   once on the shared prototype the first time this tag is
        //   defined, so a second tuple widget on the same page would
        //   otherwise silently reuse the first tuple's item count/rest-ness.
        /** @this {HTMLElement} */
        connectedCallback () {
          const itemCount = Number(this.dataset.itemCount ?? '0');
          Array.from({length: itemCount}, (_, idx) => String(idx)).forEach(
            (key) => wireOptInFieldset(this, key)
          );
          if (this.dataset.hasRest === 'true') {
            wireOptInFieldset(this, 'rest');
          }
        },
        /** @this {HTMLElement} */
        getQuery () {
          const searchPath = this.dataset.searchPath ?? '';
          const itemCount = Number(this.dataset.itemCount ?? '0');
          const hasRest = this.dataset.hasRest === 'true';
          const itemLeaves = Array.from({length: itemCount}, (_, idx) => {
            if (!readOptInChecked(this, String(idx))) {
              return undefined;
            }
            const itemEl = findSearchElement(this, `${searchPath}/${idx}`);
            return itemEl && hasGetQuery(itemEl) ? itemEl.getQuery() : undefined;
          });
          if (!hasRest) {
            return combineAnd(itemLeaves);
          }
          const lengthLeaf = readLengthSizeQuery(this, searchPath);
          const restEl = findSearchElement(this, `${searchPath}/*`);
          const restLeaf = restEl && hasGetQuery(restEl) && readOptInChecked(this, 'rest')
            ? restEl.getQuery()
            : undefined;
          return combineAnd([...itemLeaves, lengthLeaf, restLeaf]);
        }
      }
    }, children];
  },
  getQuery: getQueryViaElement
};

export default tupleSearchType;
