import {jml} from '../../vendor-imports.js';
import {buildPathLabel, findOwnControl, extractLeafOfKind} from '../searchUtils.js';
import {makeTypeOfLeaf, combineAnd} from '../queryTreeBuilders.js';
import {
  findSearchElement, getQueryViaElement, hasGetQuery,
  applyQueryViaElement, hasApplyQuery
} from '../searchElementUtils.js';
import {getSearchSchemaType, buildSearchWidget} from '../searchDispatch.js';

/**
 * @typedef {import('../searchDispatch.js').SearchTypeObject} SearchTypeObject
 */

/**
 * @param {HTMLElement} el
 * @returns {el is HTMLSelectElement}
 */
function isSelectElement (el) {
  return el.nodeName.toLowerCase() === 'select';
}

/**
 * @typedef {{
 *   discriminator?: string,
 *   options: import('../../formats/schema.js').ZodexSchema[]
 * }} UnionLikeSchemaObject
 */

/**
 * Shared implementation behind `unionSearchType.js`, `xorSearchType.js` and
 * `discriminatedUnionSearchType.js`: all three share the exact same
 * "has type &lt;type pull-down&gt;" shape (README) - `SzUnion`/`SzXor` carry
 * only `options`, `SzDiscriminatedUnion` additionally carries a
 * `discriminator` field name (`zodexy`'s schema types), so `discriminated`
 * is the only behavioral difference. Picking a branch also renders that
 * branch's own recursively-built search widget below the pull-down (not
 * just "is type X" - "X matches Y" too), matching every other composite
 * built so far.
 *
 * Each `<option>` carries its branch's search-dispatch key and (for a
 * discriminated union) its discriminator value as `data-*` attributes,
 * since `getQuery()` runs as a `$define` mixin method installed once on the
 * tag's shared prototype - the branch metadata needs to be read back off
 * the currently-selected `<option>` itself at query time, not closed over
 * from this factory's one-time call.
 * @param {{tagName: string, discriminated: boolean}} cfg
 * @returns {SearchTypeObject}
 */
export function makeUnionFamilySearchType ({tagName, discriminated}) {
  return {
    buildUI ({schemaObject, path, typeNamespace, topRoot, types, originalJSON}) {
      const label = buildPathLabel(schemaObject, path);
      const name = `${typeNamespace}-${tagName}`;
      const unionLikeSchemaObject = /** @type {UnionLikeSchemaObject} */ (
        /** @type {unknown} */ (schemaObject)
      );
      const {options} = unionLikeSchemaObject;
      const discriminator = discriminated
        ? unionLikeSchemaObject.discriminator
        : undefined;

      const branches = options.map((option, idx) => {
        const searchType = getSearchSchemaType(option);
        let discriminatorValue;
        if (discriminator) {
          const discSchema = /** @type {{properties?: {[key: string]: any}}} */ (
            option
          ).properties?.[discriminator];
          if (discSchema?.type === 'literal') {
            [discriminatorValue] = discSchema.values;
          }
        }
        const optLabel = discriminatorValue === undefined
          ? (buildPathLabel(option, `${path}/${idx}`) ||
            /* istanbul ignore next -- Guard: buildPathLabel always returns a non-empty string for a branch's own path */
            searchType)
          : String(discriminatorValue);
        return {idx, option, searchType, discriminatorValue, optLabel};
      });

      return [tagName, {
        dataset: {searchPath: path, searchKind: tagName},
        title: label,
        $define: {
          /** @this {HTMLElement} */
          getQuery () {
            const searchPath = this.dataset.searchPath ??
            /* istanbul ignore next -- Guard: buildUI always sets dataset.searchPath */
            '';
            const select = /** @type {HTMLSelectElement|undefined} */ (
              findOwnControl(this, 'select.jsoeSearchTypeOf')
            );
            if (!select || select.value === '') {
              return undefined;
            }
            const selectedOption = select.selectedOptions[0];
            const searchType = selectedOption?.dataset.searchType ??
              /* istanbul ignore next -- Guard: buildUI always sets dataset.searchType on every option */
              '';
            const rawDiscriminatorValue = selectedOption?.dataset.discriminatorValue;
            const typeOfLeaf = makeTypeOfLeaf(
              searchPath,
              searchType,
              rawDiscriminatorValue === undefined
                ? undefined
                : JSON.parse(rawDiscriminatorValue)
            );
            const branchEl = findSearchElement(this, searchPath);
            const branchQuery = branchEl && hasGetQuery(branchEl)
              ? branchEl.getQuery()
              : /* istanbul ignore next -- Guard: a selected branch's own search widget is always built by then */ undefined;
            return combineAnd([typeOfLeaf, branchQuery]);
          },
          /**
           * Drives the existing "Has type" `<select>`'s own `change`
           * listener (defined below, per-instance and so already safe to
           * close over `branches`) rather than reimplementing branch-DOM
           * construction here - `$define` methods are installed once on the
           * tag's shared prototype the first time it's defined (this
           * function's own doc), so `applyQuery` can't close over
           * `branches` itself, but dispatching a real `change` event lets
           * the per-instance listener that *can* do the rebuild for us.
           * @this {HTMLElement}
           * @param {import('../queryTree.js').QueryNode|undefined} queryNode
           * @returns {void}
           */
          applyQuery (queryNode) {
            const select = /** @type {HTMLSelectElement|undefined} */ (
              findOwnControl(this, 'select.jsoeSearchTypeOf')
            );
            /* istanbul ignore if -- Guard: buildUI always creates this select */
            if (!select) {
              return;
            }
            const {matched, rest} = extractLeafOfKind(queryNode, 'typeOf');
            const optionMatch = matched && [...select.options].find((opt) => (
              opt.dataset.searchType === matched.searchType &&
              (opt.dataset.discriminatorValue === undefined
                ? matched.discriminatorValue === undefined
                : JSON.parse(opt.dataset.discriminatorValue) === matched.discriminatorValue)
            ));
            select.value = optionMatch
              ? optionMatch.value
              : /* istanbul ignore next -- Same "discriminator no longer matches any branch" case as below */ '';
            select.dispatchEvent(new Event('change'));
            /* istanbul ignore if -- A query whose discriminator no longer
              matches any current branch (e.g. the schema changed since it
              was saved); the `select` is still reset to "none" above */
            if (!optionMatch) {
              return;
            }
            const searchPath = this.dataset.searchPath ??
            /* istanbul ignore next -- Guard: buildUI always sets dataset.searchPath */
            '';
            const branchEl = findSearchElement(this, searchPath);
            if (branchEl && hasApplyQuery(branchEl)) {
              branchEl.applyQuery(rest);
            }
          }
        }
      }, [
        ['span', {class: 'searchLabel'}, [label]],
        ['label', [
          'Has type: ',
          ['select', {
            name,
            class: 'jsoeSearchTypeOf',
            // The "(any)" placeholder's `value: ''` below is exactly what
            // native `required` treats as "nothing selected", so choosing
            // any real branch already satisfies it - no custom validity
            // code needed. A union/xor/discriminatedUnion has no other
            // possible constraint (unlike `mapSearchType.js`'s key/value or
            // `objectSearchType.js`'s properties), so this alone is "no
            // absent values" for the whole widget, not just one facet of it.
            required: true,
            $on: {
              change () {
                /* istanbul ignore if -- Guard: registered as this select's own handler */
                if (!isSelectElement(this)) {
                  return;
                }
                const container = this.closest(tagName)?.querySelector(
                  '.searchUnionBranch'
                );
                /* istanbul ignore if -- Guard: buildUI always creates this container */
                if (!container) {
                  return;
                }
                container.textContent = '';
                if (this.value === '') {
                  return;
                }
                const branch = branches[Number(this.value)];
                const branchArr = buildSearchWidget({
                  schemaObject: branch.option,
                  path,
                  typeNamespace,
                  topRoot,
                  types,
                  originalJSON
                });
                container.append(/** @type {HTMLElement} */ (jml(...branchArr)));
              }
            }
          }, [
            ['option', {value: ''}, ['(any)']],
            ...branches.map(({idx, searchType, discriminatorValue, optLabel}) => (
              ['option', {
                value: String(idx),
                dataset: {
                  searchType,
                  ...(discriminatorValue === undefined
                    ? {}
                    : {discriminatorValue: JSON.stringify(discriminatorValue)})
                }
              }, [optLabel]]
            ))
          ]]
        ]],
        ['div', {class: 'searchUnionBranch'}]
      ]];
    },
    getQuery: getQueryViaElement,
    applyQuery: applyQueryViaElement
  };
}
