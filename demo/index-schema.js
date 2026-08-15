import {jml, body, $} from '../src/vendor-imports.js';

import {
  formatAndTypeChoices
} from '../src/formatAndTypeChoices.js';

import {
  Types, typeChoices
} from '../src/index.js';

import {
  schemaInstanceJSON, schemaInstanceJSON2, schemaInstanceJSON3,
  schemaInstanceJSON4, schemaInstanceJSON5, schemaInstanceJSON6,
  schemaInstanceJSON7, schemaInstanceJSON8, schemaInstanceJSON9,
  schemaInstanceJSON10, schemaInstanceJSON11
} from './schema-data.js';

const zodexSchemaJSON = await (
  await fetch('../vendor/zodexy/dist/schema.zodexy.json')
).json();

const anySchemaJSON = {
  type: 'any'
};

const unknownSchemaJSON = {
  type: 'unknown'
};

const schemaInstanceJSONMinsMaxes = {
  type: 'union',
  options: [
    {
      type: 'number',
      min: 400,
      max: 700,
      int: true
    },
    {
      type: 'bigInt',
      min: '400',
      max: '700'
    },
    {
      type: 'date',
      min: new Date('1999-01-01').getTime(),
      max: new Date('2001-01-01').getTime()
    },
    {
      type: 'string',
      min: 5,
      max: 10
    }
  ]
};

const schemaInstanceJSONMinsMaxes2 = {
  type: 'union',
  options: [
    {
      type: 'number',
      min: 400,
      minInclusive: true,
      max: 700,
      maxInclusive: true,
      multipleOf: 5
    },
    {
      type: 'bigInt',
      min: '400',
      minInclusive: true,
      max: '700',
      maxInclusive: true,
      multipleOf: '5'
    },
    {
      type: 'date',
      min: new Date('1999-01-01').getTime(),
      max: new Date('2001-01-01').getTime()
    },
    {
      type: 'string',
      length: 10
    }
  ]
};

const schemaInstanceJSONMinsMaxes3 = {
  type: 'union',
  options: [
    {
      type: 'number',
      min: 400,
      max: 700
    },
    {
      type: 'bigInt'
    },
    {
      type: 'date',
      min: new Date('1999-01-01').getTime(),
      max: new Date('2001-01-01').getTime()
    },
    {
      type: 'string',
      startsWith: 'abc',
      endsWith: 'xyz',
      toLowerCase: true,
      trim: true
    }
  ]
};

const schemaInstanceJSONStrings1 = {
  type: 'union',
  options: [
    {
      type: 'string',
      includes: 'GHI',
      position: 5,
      toUpperCase: true
    }
  ]
};

const schemaInstanceJSONStrings2 = {
  type: 'union',
  options: [
    {
      type: 'string',
      includes: 'GHI',
      regex: 'a[a-z]c'
    }
  ]
};

const schemaInstanceJSONStrings3 = {
  type: 'union',
  options: [
    {
      type: 'string',
      regex: 'a[a-z]c',
      flags: 'i'
    }
  ]
};

const schemaInstanceJSONStrings4 = {
  type: 'union',
  options: [
    {
      type: 'string',
      kind: 'time',
      precision: 3
    }
  ]
};

const schemaInstanceJSONStrings5 = {
  type: 'union',
  options: [
    {
      type: 'string',
      kind: 'time'
    }
  ]
};

const schemaInstanceJSONStrings6 = {
  type: 'union',
  options: [
    {
      type: 'string',
      kind: 'datetime',
      offset: true,
      local: true,
      precision: 3
    }
  ]
};

const schemaInstanceJSONStrings7 = {
  type: 'union',
  options: [
    {
      type: 'string',
      kind: 'ip',
      version: 'v4'
    }
  ]
};

const schemaInstanceJSONStrings8 = {
  type: 'union',
  options: [
    {
      type: 'string',
      kind: 'ip',
      version: 'v6'
    }
  ]
};

const schemaInstanceJSONStrings9 = {
  type: 'union',
  options: [
    {
      description: 'Emoji',
      type: 'string',
      kind: 'emoji'
    },
    {
      description: 'UUID',
      type: 'string',
      kind: 'uuid'
    },
    {
      description: 'Nanoid',
      type: 'string',
      kind: 'nanoid'
    },
    {
      description: 'CUID',
      type: 'string',
      kind: 'cuid'
    },
    {
      description: 'CUID2',
      type: 'string',
      kind: 'cuid2'
    },
    {
      description: 'ULID',
      type: 'string',
      kind: 'ulid'
    },
    {
      description: 'Duration',
      type: 'string',
      kind: 'duration'
    },
    {
      description: 'Base64',
      type: 'string',
      kind: 'base64'
    },

    {
      description: 'Base64 URL',
      type: 'string',
      kind: 'base64url'
    }
  ]
};

const schemaInstanceJSONStrings10 = {
  type: 'union',
  options: [
    {
      type: 'string',
      kind: 'cidr',
      version: 'v4'
    }
  ]
};

const schemaInstanceJSONStrings11 = {
  type: 'union',
  options: [
    {
      type: 'string',
      kind: 'cidr',
      version: 'v6'
    }
  ]
};

// Todo: test editing, including fixing aggregate errors and aggregate error
//         as cause (done?)

// Todo: If Zod starts to do circular data, support with reference types
// Todo: If Zod starts to allow specific types for our effects, use those
//         instead, not just for more standard semanticness, but for any
//         additional validations

/**
 * @param {string} schema
 * @throws {Error}
 * @returns {import('zodexy').SzType}
 */
function getSchemaContent (schema) {
  switch (schema) {
  case 'Zodexy schema':
    return zodexSchemaJSON;
  case 'Zodexy schema instance':
    return schemaInstanceJSON;
  case 'Zodexy schema instance 2':
    return schemaInstanceJSON2;
  case 'Zodexy schema instance 3':
    return schemaInstanceJSON3;
  case 'Zodexy schema instance 4':
    return schemaInstanceJSON4;
  case 'Zodexy schema instance 5':
    return schemaInstanceJSON5;
  case 'Zodexy schema instance 6':
    return schemaInstanceJSON6;
  case 'Zodexy schema instance 7':
    return schemaInstanceJSON7;
  case 'Zodexy schema instance 8':
    return schemaInstanceJSON8;
  case 'Zodexy schema instance 9':
    return schemaInstanceJSON9;
  case 'Zodexy schema instance 10':
    return schemaInstanceJSON10;
  case 'Zodexy schema instance 11':
    return schemaInstanceJSON11;
  case 'Zodexy schema instance mins and maxes':
    return schemaInstanceJSONMinsMaxes;
  case 'Zodexy schema instance mins and maxes 2':
    return schemaInstanceJSONMinsMaxes2;
  case 'Zodexy schema instance mins and maxes 3':
    return schemaInstanceJSONMinsMaxes3;
  case 'Zodexy schema instance strings 1':
    return schemaInstanceJSONStrings1;
  case 'Zodexy schema instance strings 2':
    return schemaInstanceJSONStrings2;
  case 'Zodexy schema instance strings 3':
    return schemaInstanceJSONStrings3;
  case 'Zodexy schema instance strings 4':
    return schemaInstanceJSONStrings4;
  case 'Zodexy schema instance strings 5':
    return schemaInstanceJSONStrings5;
  case 'Zodexy schema instance strings 6':
    return schemaInstanceJSONStrings6;
  case 'Zodexy schema instance strings 7':
    return schemaInstanceJSONStrings7;
  case 'Zodexy schema instance strings 8':
    return schemaInstanceJSONStrings8;
  case 'Zodexy schema instance strings 9':
    return schemaInstanceJSONStrings9;
  case 'Zodexy schema instance strings 10':
    return schemaInstanceJSONStrings10;
  case 'Zodexy schema instance strings 11':
    return schemaInstanceJSONStrings11;
  case 'any schema':
    return anySchemaJSON;
  case 'unknown schema':
    return unknownSchemaJSON;
  /* istanbul ignore next -- Guard */
  default:
    /* istanbul ignore next -- Guard */
    throw new Error('Unexpected schema');
  }
}

const keyPathNotExpectedTypeChoices = await formatAndTypeChoices({
  hasKeyPath: false,
  typeNamespace: 'demo-keypath-not-expected',
  schemas: [
    'Zodexy schema', 'Zodexy schema instance', 'Zodexy schema instance 2',
    'Zodexy schema instance 3', 'Zodexy schema instance 4',
    'Zodexy schema instance 5', 'Zodexy schema instance 6',
    'Zodexy schema instance 7', 'Zodexy schema instance 8',
    'Zodexy schema instance 9', 'Zodexy schema instance 10',
    'Zodexy schema instance 11',
    'Zodexy schema instance mins and maxes',
    'Zodexy schema instance mins and maxes 2',
    'Zodexy schema instance mins and maxes 3',
    'Zodexy schema instance strings 1',
    'Zodexy schema instance strings 2',
    'Zodexy schema instance strings 3',
    'Zodexy schema instance strings 4',
    'Zodexy schema instance strings 5',
    'Zodexy schema instance strings 6',
    'Zodexy schema instance strings 7',
    'Zodexy schema instance strings 8',
    'Zodexy schema instance strings 9',
    'any schema', 'unknown schema'
  ],
  selectedSchema: 'Zodexy schema instance 2',
  getSchemaContent
});

const keyPathNotExpectedTypeChoicesFirstPreselected =
  await formatAndTypeChoices({
    hasKeyPath: false,
    typeNamespace: 'demo-keypath-not-expected-no-preselected',
    schemas: [
      'Zodexy schema', 'Zodexy schema instance'
    ],
    getSchemaContent
  });

setTimeout(function () {
  jml('section', {role: 'main'}, [
    ['h1', [
      'Jsoe schema testing'
    ]],
    ['h2', [
      'Format and type choices: No key path expected (type can vary at root)'
    ]],

    // Put inside form so can validate
    ['form', {id: 'formatAndTypeChoices'}, [
      ...keyPathNotExpectedTypeChoices.domArray
    ]],

    ['button', {
      id: 'getType',
      $on: {
        click () {
          // eslint-disable-next-line no-alert -- Simple demo
          alert(keyPathNotExpectedTypeChoices.getType());
        }
      }
    }, ['Get type']],

    ['button', {
      id: 'isValid',
      $on: {
        click () {
          // eslint-disable-next-line no-alert -- Simple demo
          alert(keyPathNotExpectedTypeChoices.validValuesSet());
        }
      }
    }, ['Is valid']],

    ['button', {
      id: 'logValue',
      $on: {
        click () {
          console.log(keyPathNotExpectedTypeChoices.getValue());
        }
      }
    }, ['Log value']],

    ['button', {
      id: 'viewUI',
      $on: {
        async click () {
          const controls =
            (await keyPathNotExpectedTypeChoices.formats.getControlsForFormatAndValue(
              keyPathNotExpectedTypeChoices.types,
              keyPathNotExpectedTypeChoices.formatChoices.
                selectedOptions[0].value,
              keyPathNotExpectedTypeChoices.getValue(),
              {
                readonly: true,
                typeNamespace: 'demo-keypath-not-expected',
                // schemaContent: anySchemaJSON
                schemaContent: keyPathNotExpectedTypeChoices.formatChoices.
                  selectedOptions[0].dataset.schema
                  ? await getSchemaContent(
                    keyPathNotExpectedTypeChoices.formatChoices.
                      selectedOptions[0].dataset.schema
                  )
                  : undefined
              }
            )).rootUI;
          $('#viewUIResults').firstChild?.remove();
          $('#viewUIResults').append(controls);
        }
      }
    }, ['view UI']],

    ['div', {id: 'viewUIResults'}],

    ['button', {
      id: 'initializeWithValue',
      $on: {
        async click () {
          await keyPathNotExpectedTypeChoices.setValue({
            type: 'literal',
            value: 42
          }, {
            schemaContent: await getSchemaContent(
              keyPathNotExpectedTypeChoices.formatChoices.
                selectedOptions[0].dataset.schema
            )
          });
        }
      }
    }, ['Initialize with a value']],

    ['button', {
      id: 'showRootFormControl',
      $on: {
        click () {
          const root = $(
            '#formatAndTypeChoices > .typesHolder > ' +
              '.typeContainer > div[data-type]'
          );
          const formControl =
            keyPathNotExpectedTypeChoices.types.getFormControlForRoot(root);
          formControl.style.backgroundColor = 'red';
          setTimeout(() => {
            formControl.style.backgroundColor = 'white';
          }, 3000);
        }
      }
    }, ['Show root form control']],

    ['h2', [
      'Convert structured cloning string representation to value and log'
    ]],
    ['input', {
      id: 'getValueForString',
      placeholder: 'e.g., ["abc", 17]',
      $on: {
        change () {
          const union = {
            type: 'union',
            options: [
              ...schemaInstanceJSON.options,
              ...schemaInstanceJSON2.options,
              ...schemaInstanceJSON3.options,
              ...schemaInstanceJSON4.options,
              ...schemaInstanceJSON5.options,
              ...schemaInstanceJSON6.options,
              ...schemaInstanceJSON7.options,
              ...schemaInstanceJSON8.options,
              ...schemaInstanceJSON9.options,
              ...schemaInstanceJSON10.options
            ]
          };
          const types = new Types();
          const value = types.getValueForString(this.value, {
            format: 'schema',
            schemaObject: union,
            schemaOriginal: union
          })[0];
          console.log(value);
        }
      }
    }],

    ['br'], ['br'],
    ['h2', ['Type choices alone']],
    (() => {
      // Fallback from missing `schemaOriginal` to union `schemaContent`;
      //   trigger by change event
      const typeSelection = typeChoices({
        format: 'schema',
        typeNamespace: 'demo-type-choices-only',
        schemaIdx: 1,
        schemaContent: {
          type: 'union',
          options: [
            {
              description: 'String',
              type: 'string'
            },
            {
              description: 'Number',
              type: 'number'
            }
          ]
        }
      });

      return ['form', {
        id: 'typeChoicesOnly',
        $on: {
          /* istanbul ignore next -- Guard */
          submit (e) {
            /* istanbul ignore next -- Guard */
            e.preventDefault();
          }
        }
      }, [
        ...typeSelection.domArray
      ]];
    })(),

    ['br'], ['br'],
    ['h2', [
      'Default to first preselected schema'
    ]],
    ['form', {id: 'formatAndTypeChoicesFirstPreselected'}, [
      ...keyPathNotExpectedTypeChoicesFirstPreselected.domArray,
      ['button', {id: 'setASchemaFormat', $on: {
        click (e) {
          e.preventDefault();
          keyPathNotExpectedTypeChoicesFirstPreselected.
            formatChoices.$setFormat({
              schema: 'Zodexy schema instance'
            });
        }
      }}, [
        'Set a schema format'
      ]],
      ['button', {id: 'setABadSchemaFormat', $on: {
        click (e) {
          e.preventDefault();
          keyPathNotExpectedTypeChoicesFirstPreselected.
            formatChoices.$setFormat({
              schema: 'non-existent schema'
            });
        }
      }}, [
        'Recovers from setting bad schema format'
      ]]
    ]]
  ], body);
}, 500);
