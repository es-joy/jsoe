import {jml, body} from '../src/vendor-imports.js';
import {
  typeChoices
} from '../src/index.js';

import {
  schemaInstanceJSON, schemaInstanceJSON2, schemaInstanceJSON3,
  schemaInstanceJSON4, schemaInstanceJSON5,
  schemaInstanceJSON6, schemaInstanceJSON7,
  schemaInstanceJSON8, schemaInstanceJSON9,
  schemaInstanceJSON10, schemaInstanceJSON11,
  makeNoneditableType
} from './schema-data.js';

import FileList from '../src/utils/FileList.js';

const zodexSchemaJSON = await (
  await fetch('../vendor/zodexy/dist/schema.zodexy.json')
).json();

/**
 * @param {any[]} values
 * @param {import('zodexy').SzType} schema
 * @returns {import('jamilih').JamilihChildren}
 */
function getTypeChoices (values, schema) {
  return [['section', values.map((value, idx) => {
    return ['div', {class: 'innerItem'}, [
      ...typeChoices({
        format: 'schema',
        setValue: true,
        typeNamespace: 'demo-type-choices-only-initial-value',
        // schema: '',

        // The key differences with `schema-preloaded.js`
        value: [value],
        schemaContent: {
          description: 'Container',
          type: 'array',
          element: schema.options[idx]
        }
      }).domArray
    ]];
  })]];
}

setTimeout(function () {
  jml('section', {role: 'main'}, [
    ['h1', [
      'Jsoe schema testing'
    ]],
    ['form', [
      ...getTypeChoices([
        false, 123, NaN, 456n, 'a string'
      ], schemaInstanceJSON),
      ...getTypeChoices([
        undefined, 'ghi', false, 135, 'abcde', {},
        {abc: {def: 595}},
        {requiredProperty: 500, okProperty: 'okPropValue'},
        {},
        {okProperty: 'okPropVal'},
        {requiredProperty: true, okProperty: 'abc', another: 1400},
        [
          'abc', 'def', 'ghi'
        ],
        [],
        new Set([
          'abc', 'def', 'ghi'
        ]),
        new Set(),
        [
          123, 'abc', null, null
        ],
        [
          'abc'
        ],
        /abc/u,
        new Blob(['abc'], {
          type: 'text/plain'
        }),
        // eslint-disable-next-line no-new-wrappers, unicorn/new-for-builtins -- Deliberate allowance
        new Boolean(true),
        // eslint-disable-next-line no-new-wrappers, unicorn/new-for-builtins -- Deliberate allowance
        new Number(100),
        // eslint-disable-next-line no-new-wrappers, unicorn/new-for-builtins -- Deliberate allowance
        new String('abc'),
        -0,
        new DOMException('some message', 'someName'),
        new Error('a msg'),
        new File(['abc'], 'someName', {
          lastModified: 1231231230,
          type: 'text/plain'
        }),
        new ArrayBuffer(8),
        // new DataView(new ArrayBuffer(8), 2, 4),
        // new Uint8Array(new ArrayBuffer(8), 2, 4),
        new DOMMatrix([1, 2, 3, 4, 5, 6]),
        // new DOMMatrix([
        //   1, 2, 3, 4,
        //   5, 6, 7, 8,
        //   9, 10, 11, 12,
        //   13, 14, 15, 16
        // ]),
        // new DOMMatrixReadOnly([1, 2, 3, 4, 5, 6]),

        new DOMPoint(1, 2, 3, 4),
        // new DOMPointReadOnly(1, 2, 3, 4),
        new DOMRect(1, 2, 3, 4),
        // new DOMRectReadOnly(1, 2, 3, 4),
        new TypeError('msg'),
        // makeNoneditableType(),
        new Object(123n),
        'item-42'
      ], schemaInstanceJSON2),
      ...getTypeChoices([
        new Date('1999-01-01'),
        '1999-01-01',
        new Blob(['<b>Testing</b>'], {type: 'text/html'}),
        makeNoneditableType()
      ], schemaInstanceJSON3),
      ...getTypeChoices([
        'brettz9@yahoo.com',
        undefined
      ], schemaInstanceJSON4),
      ...getTypeChoices([
        null,
        'https://example.com'
      ], schemaInstanceJSON5),
      ...getTypeChoices([
        true,
        25,
        123n,
        'a string',
        new Date('2000-01-01')
      ], schemaInstanceJSON6),
      ...getTypeChoices([
        [],
        new Map([[3, 'hello'], [4, 'goodbye']]),
        // Adding properties here is problematic as JS won't recognize
        //   indexes as numeric
        {},
        {
          aaaaa: 123,
          bbbbb: 456
        },
        new FileList([
          new File(['abc'], 'someName', {
            lastModified: 1231231230,
            type: 'text/plain'
          }),
          new File(['def'], 'anotherName', {
            lastModified: 1031231230,
            type: 'text/plain'
          })
        ])
      ], schemaInstanceJSON7),
      ...getTypeChoices([
        null,
        'ghi'
      ], schemaInstanceJSON8),
      ...getTypeChoices([
        null,
        0,
        true,
        135,
        NaN,
        undefined,
        'ijkl'
      ], schemaInstanceJSON9),
      ...getTypeChoices([
        NaN,
        'def'
      ], schemaInstanceJSON10),
      ...getTypeChoices([
        NaN,
        'def'
      ], schemaInstanceJSON11),

      // Test nested arrays, objects
      ...getTypeChoices([
        {a: [3], b: [[5, 6], [7, 8, 9]], c: [{a: 5}]}
      ], {
        type: 'union',
        options: [
          {
            description: 'Some object',
            type: 'object',
            properties: {
              a: {
                description: 'A array',
                type: 'array',
                element: {
                  description: 'A number',
                  type: 'number'
                }
              },
              b: {
                description: 'B array',
                type: 'array',
                element: {
                  description: 'Inner B array',
                  type: 'array',
                  element: {
                    description: 'A number',
                    type: 'number'
                  }
                }
              },
              c: {
                description: 'C array',
                type: 'array',
                element: {
                  description: 'C array object',
                  type: 'object',
                  properties: {
                    a: {
                      description: 'A number',
                      type: 'number'
                    }
                  }
                }
              }
            }
          }
        ]
      }),
      ...(() => {
        const schema = {
          type: 'union',
          options: [
            {
              type: 'string'
            },
            {
              description: 'Some object',
              type: 'object',
              properties: {
                a: {
                  type: 'union',
                  options: [
                    {
                      type: 'number'
                    },
                    {
                      type: 'string'
                    }
                  ]
                }
              }
            }
          ]
        };
        return typeChoices({
          format: 'schema',
          setValue: true,
          typeNamespace: 'demo-type-choices-only-initial-value',
          // schema: '',
          value: [{a: 3}],
          schemaContent: {
            description: 'Container',
            type: 'array',
            element: schema
          }
        }).domArray;
      })(),
      ...(() => {
        const schema = {
          type: 'union',
          options: [
            {
              description: 'Some object',
              type: 'object',
              properties: {
                a: {
                  type: 'union',
                  options: [
                    {
                      type: 'number'
                    },
                    {
                      type: 'string'
                    }
                  ]
                }
              }
            }
          ]
        };
        return typeChoices({
          format: 'schema',
          setValue: true,
          typeNamespace: 'demo-type-choices-only-initial-value',
          // schema: '',
          value: [{a: 3}],
          schemaContent: {
            description: 'Container',
            type: 'array',
            element: schema
          }
        }).domArray;
      })(),
      ['section', [
        (() => {
          const value = {
            type: 'object',
            catchall: {
              type: 'bigInt'
            },
            properties: {}
          };
          const schema = structuredClone(zodexSchemaJSON);
          schema.options = [
            {
              type: 'array',
              element: {
                $ref: '#/$defs/type'
              }
            }
          ];

          return ['div', {class: 'innerItem'}, [
            ...typeChoices({
              autoTrigger: true,
              format: 'schema',
              setValue: true,
              typeNamespace: 'demo-type-choices-only-initial-value',
              // schema: '',
              value: [value],
              schemaContent: schema,
              schemaOriginal: schema
            }).domArray
          ]];
        })()
      ]]
    ]]
  ], body);
}, 0);
