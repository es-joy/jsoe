import {buildPathLabel} from './searchUtils.js';

/**
 * Locates a built search element by the JSON-Pointer path it was built for.
 * Compares `dataset.searchPath` in JS rather than interpolating `path` into
 * a `querySelector` attribute-value string, since a schema path can embed
 * arbitrary property-name characters (only `~`/`/` are escaped by
 * `makeJSONPointer`) that would otherwise need CSS-selector escaping.
 * @param {ParentNode} root
 * @param {string} path
 * @returns {HTMLElement|undefined}
 */
export function findSearchElement (root, path) {
  return /** @type {HTMLElement[]} */ (
    [...root.querySelectorAll('[data-search-path]')]
  ).find((el) => el.dataset.searchPath === path);
}

/**
 * @typedef {HTMLElement & {
 *   getQuery: () => import('./queryTree.js').QueryNode|undefined
 * }} SearchElement
 */

/**
 * The `SearchTypeObject.getQuery` every leaf module implements identically:
 * locate the element it built under `root` and delegate to its own
 * (per-element, `dataset`-driven) `getQuery()` method.
 * @param {{root: HTMLElement, path: string}} cfg
 * @returns {import('./queryTree.js').QueryNode|undefined}
 */
export function getQueryViaElement ({root, path}) {
  const el = /** @type {SearchElement|undefined} */ (
    findSearchElement(root, path)
  );
  return el?.getQuery();
}

/**
 * Factory for the README's "no variants to allow for distinct search"
 * leaves (`undefined`/`void`, `null`, `NaN`): the only meaningful question
 * is whether the path is present at all, which only matters once the path
 * is optional or nested in a union - so all three share one tiny, single-
 * checkbox implementation, differing only in tag name/label.
 * @param {{tagName: string}} cfg
 * @returns {import('./searchDispatch.js').SearchTypeObject}
 */
export function makePresenceOnlySearchType ({tagName}) {
  return {
    buildUI ({schemaObject, path, typeNamespace}) {
      const label = buildPathLabel(schemaObject, path);
      const name = `${typeNamespace}-${tagName}`;
      return [tagName, {
        dataset: {searchPath: path, searchKind: tagName},
        title: label,
        $define: {
          /** @this {HTMLElement} */
          getQuery () {
            const checked = Boolean(/** @type {HTMLInputElement|null} */ (
              this.querySelector(`input[name="${CSS.escape(name)}"]`)
            )?.checked);
            return checked
              ? {kind: 'presence', path: this.dataset.searchPath ?? '', $exists: true}
              : undefined;
          }
        }
      }, [
        ['span', {class: 'searchLabel'}, [label]],
        ['label', [
          `Require ${label} present: `,
          ['input', {type: 'checkbox', name}]
        ]]
      ]];
    },
    getQuery: getQueryViaElement
  };
}
