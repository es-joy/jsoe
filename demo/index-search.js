import {jml, body} from '../src/vendor-imports.js';
import {buildSearchChoices} from '../src/index.js';
import {
  schemaInstanceJSONSearchAllTypes,
  schemaInstanceJSONSearchDate,
  schemaInstanceJSONSearchTupleRest,
  schemaInstanceJSONSearchRecord,
  schemaInstanceJSONSearchLooseRecord,
  schemaInstanceJSONSearchDiscriminatedUnion
} from './schema-data.js';

/**
 * One section per fixture, each its own independent `buildSearchChoices`
 * call plus a "Get query" button and a `<pre>` results area - mirroring the
 * existing demo pages' one-section-per-named-schema-instance convention.
 * @type {{
 *   id: string,
 *   label: string,
 *   schemaContent: import('../src/formats/schema.js').ZodexSchema
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
    return ['div', {class: 'searchDemoSection', id: `section-${id}`}, [
      ['h2', [label]],
      control.container,
      ['button', {
        class: 'getQueryButton',
        $on: {
          click () {
            const query = control.$getQuery();
            console.log(query);
            resultPre.textContent = JSON.stringify(query, null, 2);
          }
        }
      }, ['Get query']],
      resultPre
    ]];
  })
], body);
