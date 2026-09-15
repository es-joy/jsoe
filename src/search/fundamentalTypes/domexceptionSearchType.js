import {domExceptionNames} from '../../fundamentalTypes/domexceptionType.js';
import {
  buildPathLabel, buildMultiSelect, readMultiSelect, applyMultiSelect,
  buildLiteralRegexControls,
  readLiteralRegexQuery, buildOptInFieldset, readOptInChecked, wireOptInFieldset,
  buildAtLeastOneSentinel, syncAtLeastOneCheck, extractLeafOfKind, applyOptInLiteralRegexFacet
} from '../searchUtils.js';
import {makeMultiSelectLeaf, combineAnd} from '../queryTreeBuilders.js';
import {getQueryViaElement, applyQueryViaElement} from '../searchElementUtils.js';
import regexpType from '../../fundamentalTypes/regexpType.js';

/**
 * @typedef {import('../searchDispatch.js').SearchTypeObject} SearchTypeObject
 */

/**
 * @param {Element} root - a `jsoe-search-domexception` element
 * @returns {void}
 */
function syncDomexceptionValidity (root) {
  syncAtLeastOneCheck(
    root, () => readMultiSelect(root).length > 0 || readOptInChecked(root, 'message')
  );
}

/**
 * DOMException: Literal/Regex search of child string properties; also
 * pull-down of name for DOMException (README) - `.name` gets the
 * multi-select pull-down (its standard predefined values, imported as-is
 * from `domexceptionType.js`'s own `domExceptionNames` export rather than a
 * second copy of the list, and already properly optional on its own - an
 * empty selection needs no opt-in gate), `.message` gets the usual literal/
 * regex/does-not-contain control (wrapped in `buildOptInFieldset`, since
 * that one *does* carry a `required` Value input), combined via `$and`.
 * `buildAtLeastOneSentinel` requires at least one of the two.
 * @type {SearchTypeObject}
 */
const domexceptionSearchType = {
  buildUI ({schemaObject, path, typeNamespace}) {
    const label = buildPathLabel(schemaObject, path);
    const name = `${typeNamespace}-domexception`;
    return ['jsoe-search-domexception', {
      dataset: {searchPath: path, searchKind: 'domexception'},
      title: label,
      $define: {
        /** @this {HTMLElement} */
        connectedCallback () {
          this.querySelector('select.jsoeSearchMultiSelect')?.addEventListener(
            'change', () => syncDomexceptionValidity(this)
          );
          wireOptInFieldset(this, 'message', () => syncDomexceptionValidity(this));
          syncDomexceptionValidity(this);
        },
        /** @this {HTMLElement} */
        getQuery () {
          const searchPath = this.dataset.searchPath ?? '';
          const selectedNames = readMultiSelect(this);
          const nameLeaf = selectedNames.length
            ? makeMultiSelectLeaf(`${searchPath}/name`, {$in: selectedNames})
            : undefined;
          const messageLeaf = readOptInChecked(this, 'message')
            ? readLiteralRegexQuery(this, `${searchPath}/message`, 'message')
            : undefined;
          return combineAnd([nameLeaf, messageLeaf]);
        },
        /**
         * @this {HTMLElement}
         * @param {import('../queryTree.js').QueryNode|undefined} queryNode
         * @returns {void}
         */
        applyQuery (queryNode) {
          const searchPath = this.dataset.searchPath ?? '';
          const {matched: nameLeaf} = extractLeafOfKind(queryNode, 'multiSelect');
          applyMultiSelect(this, nameLeaf?.$in ?? []);
          applyOptInLiteralRegexFacet(this, queryNode, `${searchPath}/message`, 'message');
          syncDomexceptionValidity(this);
        }
      }
    }, [
      ['span', {class: 'searchLabel'}, [label]],
      ['div', {class: 'domexceptionName'}, [
        ['span', ['Name: ']],
        buildMultiSelect({name: `${name}-name`, options: domExceptionNames})
      ]],
      ...buildOptInFieldset({
        name: `${name}-message`, key: 'message', label: 'Message',
        children: [buildLiteralRegexControls({
          name: `${name}-message`, key: 'message', flagOptions: regexpType.allowedFlags
        })]
      }),
      buildAtLeastOneSentinel()
    ]];
  },
  getQuery: getQueryViaElement,
  applyQuery: applyQueryViaElement
};

export default domexceptionSearchType;
