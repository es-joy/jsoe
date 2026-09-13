import {domExceptionNames} from '../../fundamentalTypes/domexceptionType.js';
import {buildPathLabel, buildMultiSelect, readMultiSelect, buildLiteralRegexControls, readLiteralRegexQuery} from '../searchUtils.js';
import {makeMultiSelectLeaf, combineAnd} from '../queryTreeBuilders.js';
import {getQueryViaElement} from '../searchElementUtils.js';

/**
 * @typedef {import('../searchDispatch.js').SearchTypeObject} SearchTypeObject
 */

/**
 * DOMException: Literal/Regex search of child string properties; also
 * pull-down of name for DOMException (README) - `.name` gets the
 * multi-select pull-down (its standard predefined values, imported as-is
 * from `domexceptionType.js`'s own `domExceptionNames` export rather than a
 * second copy of the list), `.message` gets the usual literal/regex/
 * does-not-contain control, combined via `$and`.
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
        getQuery () {
          const searchPath = this.dataset.searchPath ?? '';
          const selectedNames = readMultiSelect(this);
          const nameLeaf = selectedNames.length
            ? makeMultiSelectLeaf(`${searchPath}/name`, {$in: selectedNames})
            : undefined;
          const messageLeaf = readLiteralRegexQuery(
            this, `${searchPath}/message`, 'message'
          );
          return combineAnd([nameLeaf, messageLeaf]);
        }
      }
    }, [
      ['span', {class: 'searchLabel'}, [label]],
      ['div', {class: 'domexceptionName'}, [
        ['span', ['Name: ']],
        buildMultiSelect({name: `${name}-name`, options: domExceptionNames})
      ]],
      ['div', {class: 'domexceptionMessage'}, [
        ['span', ['Message: ']],
        buildLiteralRegexControls({name: `${name}-message`, key: 'message'})
      ]]
    ]];
  },
  getQuery: getQueryViaElement
};

export default domexceptionSearchType;
