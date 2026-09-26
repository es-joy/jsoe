import {
  jml, body, EditorView, basicSetup, javascript, JSON6
} from '../src/vendor-imports.js';
import {stringifyJSON6} from '../src/utils/json6Stringify.js';
import {buildSearchChoices} from '../src/index.js';
import {
  combineAnd, makeHasPropertyLeaf, makeRangeLeaf, makeLiteralSetLeaf,
  makeRegexLeaf, makeMultiSelectLeaf, makeBooleanEqualsLeaf, makeTypeOfLeaf,
  makeMapRecordJointLeaf, makePassThroughLeaf, makeBlobHTMLLeaf, makeDomShapeLeaf,
  makeLengthSizeLeaf
} from '../src/search/queryTreeBuilders.js';
import {
  schemaInstanceJSONSearchAllTypes,
  schemaInstanceJSONSearchDate,
  schemaInstanceJSONSearchTupleRest,
  schemaInstanceJSONSearchRecord,
  schemaInstanceJSONSearchLooseRecord,
  schemaInstanceJSONSearchDiscriminatedUnion,
  schemaInstanceJSONSearchResurrectableRoot
} from './schema-data.js';

/**
 * One `hasProperty` + child-value clause for an optional property, exactly
 * mirroring `objectSearchType.js`'s own `buildHasPropertyRow.getQuery`
 * (`combineAnd([existsLeaf, childLeaf])`) - reusing `combineAnd` here (rather
 * than hand-nesting `$and`s) means this always produces the very same shape
 * `$getQuery()` would, so `$applyQuery` is guaranteed to read it back
 * correctly.
 * @param {string} path
 * @param {import('../src/search/queryTree.js').QueryNode} [childLeaf]
 * @returns {import('../src/search/queryTree.js').QueryNode}
 */
function hasPropertyClause (path, childLeaf) {
  // `combineAnd`'s own return type stays `QueryNode|undefined` (it's also
  // used where every clause can be absent) - never `undefined` here
  // specifically, since `makeHasPropertyLeaf`'s own leaf is always present.
  return /** @type {import('../src/search/queryTree.js').QueryNode} */ (
    combineAnd([makeHasPropertyLeaf(path, true), childLeaf])
  );
}

/**
 * A single example `QueryAnd` document exercising one representative
 * constraint for every property of `schemaInstanceJSONSearchAllTypes` (one
 * example of every search-supported type, "all in one object") - built via
 * `queryTreeBuilders.js`'s own constructors (the same ones every widget's
 * `getQuery` uses) so the shape is guaranteed to match what `$applyQuery`
 * expects, rather than hand-typed JSON that could drift out of sync with the
 * query tree's actual structure.
 * @returns {import('../src/search/queryTree.js').QueryAnd}
 */
function buildExampleAllTypesQuery () {
  const clauses = [
    makeLiteralSetLeaf('#/requiredString', {$in: ['example']}),
    hasPropertyClause(
      '#/date', makeRangeLeaf('#/date', 'date', {$gte: '2024-01-01T00:00:00.000Z'})
    ),
    hasPropertyClause(
      '#/number', makeRangeLeaf('#/number', 'number', {$gte: 1, $lte: 10})
    ),
    hasPropertyClause(
      '#/bigint', makeRangeLeaf('#/bigint', 'bigint', {$gte: '1', $lte: '100'})
    ),
    hasPropertyClause('#/string', makeLiteralSetLeaf('#/string', {$in: ['abc']})),
    hasPropertyClause('#/regexp', combineAnd([
      makeRegexLeaf('#/regexp', '^abc'),
      makeMultiSelectLeaf('#/regexp', {$in: ['g', 'i']})
    ])),
    hasPropertyClause('#/boolean', makeBooleanEqualsLeaf('#/boolean', true)),
    hasPropertyClause('#/symbol', makeLiteralSetLeaf('#/symbol', {$in: ['sym']})),
    hasPropertyClause('#/undef'),
    hasPropertyClause('#/nullValue'),
    hasPropertyClause('#/nan'),
    hasPropertyClause('#/enum', makeMultiSelectLeaf('#/enum', {$in: ['red']})),
    hasPropertyClause('#/array', combineAnd([
      makeLengthSizeLeaf('#/array', {$size: 3}),
      makeRangeLeaf('#/array/*', 'number', {$gte: 5})
    ])),
    hasPropertyClause(
      '#/object',
      hasPropertyClause(
        '#/object/nested', makeLiteralSetLeaf('#/object/nested', {$in: ['inner']})
      )
    ),
    hasPropertyClause('#/map', makeMapRecordJointLeaf(
      '#/map', false,
      makeLiteralSetLeaf('#/map/*key', {$in: ['a']}),
      makeRangeLeaf('#/map/*value', 'number', {$gte: 1})
    )),
    hasPropertyClause('#/set', makeLengthSizeLeaf('#/set', {$size: 2})),
    hasPropertyClause('#/tuple', combineAnd([
      makeLiteralSetLeaf('#/tuple/0', {$in: ['a']}),
      makeRangeLeaf('#/tuple/1', 'number', {$gte: 1}),
      makeBooleanEqualsLeaf('#/tuple/*', true)
    ])),
    hasPropertyClause('#/record', makeMapRecordJointLeaf(
      '#/record', false,
      makeLiteralSetLeaf('#/record/*key', {$in: ['k']}),
      makeRangeLeaf('#/record/*value', 'number', {$gte: 2})
    )),
    hasPropertyClause('#/filelist', makeLengthSizeLeaf('#/filelist', {$size: 1})),
    hasPropertyClause(
      '#/file', makeLiteralSetLeaf('#/file/name', {$in: ['report.pdf']})
    ),
    hasPropertyClause('#/blob', makeRegexLeaf('#/blob', '^image/', 'i')),
    hasPropertyClause(
      '#/error', makeLiteralSetLeaf('#/error/message', {$in: ['Oops']})
    ),
    hasPropertyClause(
      '#/errors', makeLiteralSetLeaf('#/errors/message', {$in: ['Oops']})
    ),
    hasPropertyClause(
      '#/domexception',
      makeMultiSelectLeaf('#/domexception/name', {$in: ['IndexSizeError']})
    ),
    hasPropertyClause('#/promise', makePassThroughLeaf(
      '#/promise', makeRangeLeaf('#/promise', 'number', {$gte: 1})
    )),
    hasPropertyClause('#/catch', makePassThroughLeaf(
      '#/catch', makeLiteralSetLeaf('#/catch', {$in: ['fallbackValue']})
    )),
    hasPropertyClause('#/function', combineAnd([
      makeRangeLeaf('#/function/*args/0', 'number', {$gte: 1}),
      makeBooleanEqualsLeaf('#/function/*output', true)
    ])),
    hasPropertyClause('#/union', combineAnd([
      makeTypeOfLeaf('#/union', 'string'),
      makeLiteralSetLeaf('#/union', {$in: ['picked']})
    ])),
    hasPropertyClause('#/xor', combineAnd([
      makeTypeOfLeaf('#/xor', 'boolean'),
      makeBooleanEqualsLeaf('#/xor', false)
    ])),
    hasPropertyClause('#/discriminatedUnion', combineAnd([
      makeTypeOfLeaf('#/discriminatedUnion', 'object', 'event'),
      combineAnd([
        makeLiteralSetLeaf('#/discriminatedUnion/kind', {$in: ['event']}),
        hasPropertyClause(
          '#/discriminatedUnion/when',
          makeRangeLeaf(
            '#/discriminatedUnion/when', 'date', {$gte: '2024-06-01T00:00:00.000Z'}
          )
        )
      ])
    ])),
    hasPropertyClause('#/domrect', makeDomShapeLeaf('#/domrect', {
      x: makeRangeLeaf('#/domrect/x', 'number', {$gte: 0}),
      width: makeRangeLeaf('#/domrect/width', 'number', {$gte: 10})
    }, {readonlyCheck: true})),
    hasPropertyClause('#/dompoint', makeDomShapeLeaf('#/dompoint', {
      x: makeRangeLeaf('#/dompoint/x', 'number', {$gte: 1})
    }, {readonlyCheck: false})),
    hasPropertyClause('#/dommatrix', makeDomShapeLeaf('#/dommatrix', {
      a: makeRangeLeaf('#/dommatrix/a', 'number', {$gte: 1})
    }, {dimensionCheck: 2})),
    hasPropertyClause(
      '#/blobHTML', makeBlobHTMLLeaf('#/blobHTML', 'cssSelector', '.title')
    ),
    hasPropertyClause(
      '#/specialRealNumber', makeMultiSelectLeaf('#/specialRealNumber', {$in: ['Infinity']})
    ),
    hasPropertyClause(
      '#/buffersource', makeRangeLeaf('#/buffersource', 'buffersource', {$gte: 0, $lte: 1024})
    )
  ];
  return {$and: clauses};
}

/**
 * One section per fixture, each its own independent `buildSearchChoices`
 * call plus a "Get query" button and a `<pre>` results area - mirroring the
 * existing demo pages' one-section-per-named-schema-instance convention.
 * @type {{
 *   id: string,
 *   label: string,
 *   schemaContent: import('../src/formats/schema.js').ZodexySchema
 * }[]}
 */
const sections = [
  {
    id: 'allTypes',
    label: 'One property per search-supported type',
    schemaContent: schemaInstanceJSONSearchAllTypes
  },
  {id: 'date', label: 'Date (with a real min/max range)', schemaContent: schemaInstanceJSONSearchDate},
  {id: 'tupleRest', label: 'Tuple with rest', schemaContent: schemaInstanceJSONSearchTupleRest},
  {id: 'record', label: 'Record', schemaContent: schemaInstanceJSONSearchRecord},
  {id: 'looseRecord', label: 'Loose record', schemaContent: schemaInstanceJSONSearchLooseRecord},
  {
    id: 'discriminatedUnion',
    label: 'Discriminated union (with a date branch)',
    schemaContent: schemaInstanceJSONSearchDiscriminatedUnion
  },
  {
    id: 'resurrectableRoot',
    label: 'Resurrectable (noneditable escape hatch) at the search root',
    schemaContent: schemaInstanceJSONSearchResurrectableRoot
  }
];

jml('section', {role: 'main'}, [
  ['h1', ['JSOE Search Demo']],
  ...sections.map(({id, label, schemaContent}) => {
    const control = buildSearchChoices({
      schemaContent, typeNamespace: `search-${id}`
    });
    control.container.classList.add('searchDemoContainer');
    control.container.dataset.sectionId = id;
    const resultPre = /** @type {HTMLElement} */ (
      jml('pre', {class: 'queryResult'})
    );
    const validityResult = /** @type {HTMLElement} */ (
      jml('span', {class: 'validityResult'})
    );
    // A CodeMirror-backed JSON6 editor for "Edit raw", the same combination
    // `rawTypesonEditor.js`'s "View raw"/"Edit raw" dialog uses for the
    // value-editing side, syntax-highlighting the pasted/typed query rather
    // than leaving it a plain `<textarea>`. Its own content is seeded via
    // that same module's `stringifyJSON6` (unquoted identifier-like keys),
    // parsed back via `JSON6.parse` on "Apply query" below - `JSON6.stringify`
    // itself is not used; see `stringifyJSON6`'s own doc for the real bug in
    // the package's version that this avoids.
    const editorHost = /** @type {HTMLElement} */ (
      jml('div', {class: 'queryRawEditor'})
    );
    const editorError = /** @type {HTMLElement} */ (
      jml('div', {class: 'queryRawEditorError', role: 'alert'})
    );
    const view = new EditorView({
      doc: stringifyJSON6({$and: []}, '  ', ''),
      extensions: [basicSetup, javascript()],
      parent: editorHost
    });
    return ['div', {class: 'searchDemoSection', id: `section-${id}`}, [
      ['h2', [label]],
      control.container,
      ['button', {
        type: 'button',
        class: 'getQueryButton',
        $on: {
          click () {
            const query = control.$getQuery();
            console.log(query);
            resultPre.textContent = JSON.stringify(query, null, 2);
          }
        }
      }, ['Get query']],
      resultPre,
      ['button', {
        type: 'button',
        class: 'loadQueryButton',
        $on: {
          click () {
            const query = control.$getQuery();
            view.dispatch({
              changes: {
                from: 0, to: view.state.doc.length,
                insert: stringifyJSON6(query, '  ', '')
              }
            });
          }
        }
      }, ['Load current query into editor']],
      ...(id === 'allTypes'
        ? [['button', {
          type: 'button',
          class: 'loadExampleQueryButton',
          $on: {
            click () {
              view.dispatch({
                changes: {
                  from: 0, to: view.state.doc.length,
                  insert: stringifyJSON6(buildExampleAllTypesQuery(), '  ', '')
                }
              });
            }
          }
        }, ['Load example query (one of each type)']]]
        : []),
      editorHost,
      editorError,
      ['button', {
        type: 'button',
        class: 'applyQueryButton',
        $on: {
          click () {
            editorError.textContent = '';
            /** @type {import('../src/search/queryTree.js').QueryAnd} */
            let queryDoc;
            try {
              queryDoc = /** @type {import('../src/search/queryTree.js').QueryAnd} */ (
                JSON6.parse(view.state.doc.toString())
              );
            } catch (error) {
              editorError.textContent = /** @type {Error} */ (error).message;
              return;
            }
            control.$applyQuery(queryDoc);
          }
        }
      }, ['Apply query']],
      ['button', {
        type: 'button',
        class: 'checkValidityButton',
        $on: {
          click () {
            validityResult.textContent = control.container.reportValidity()
              ? 'Valid'
              : 'Invalid';
          }
        }
      }, ['Check validity']],
      validityResult
    ]];
  })
], body);
