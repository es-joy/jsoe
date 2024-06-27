import {jml, body, $} from '../src/vendor-imports.js';

import {
  formatAndTypeChoices
} from '../src/formatAndTypeChoices.js';

// const zodexSchemaJSON = await (await fetch('./schema.zodex')).json();
// const zodexSchemaJSON = {
//   type: 'union',
//   options: [
//     {
//       type: 'string'
//     },
//     {
//       type: 'number'
//     }
//   ]
// };
const zodexSchemaJSON = {
  type: 'union',
  options: [
    {
      type: 'boolean'
    },
    {
      type: 'number'
    },
    {
      type: 'nan'
    },
    {
      type: 'bigInt'
    },
    {
      type: 'string'
    },
    {
      type: 'date'
    },
    {
      type: 'undefined'
    },
    {
      type: 'void'
    },
    {
      type: 'null'
    },
    {
      type: 'array'
    },
    {
      type: 'object'
    },
    {
      type: 'tuple'
    },
    {
      type: 'record'
    },
    {
      type: 'map'
    },
    {
      type: 'set'
    }

    // Todo:
    //        literal (boolean, number, string), enum subgroups
    //        any, unknown, never, catch,
    //        effect (and preset examples like -0, Infinity, -Infinity,
    //          classes: Blob, Boolean, DOMException, Error, FileList,
    //          File, noneditable?, Number, RegExp, String; subtypes:
    //          BlobHTML; supertypes (including inner items): BufferSource,
    //          DOMMatrix, DOMPoint, DOMRect, Errors, SpecialNumber)

    // 'literal',
    // 'enum',
    // 'any',
    // 'unknown',
    // 'never',
    // 'catch',
    // 'effect'
  ]
};

const keyPathNotExpectedTypeChoices = await formatAndTypeChoices({
  hasKeyPath: false,
  typeNamespace: 'demo-keypath-not-expected',
  schemas: ['Zodex schema', 'def'],
  getSchemaContent (schema) {
    if (schema === 'Zodex schema') {
      return zodexSchemaJSON;
    }
    return {};
  }
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
            // eslint-disable-next-line @stylistic/max-len -- Long
            await keyPathNotExpectedTypeChoices.formats.getControlsForFormatAndValue(
              keyPathNotExpectedTypeChoices.types,
              'structuredCloning',
              keyPathNotExpectedTypeChoices.getValue(),
              {
                readonly: true
              }
            );
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
          await keyPathNotExpectedTypeChoices.setValue(42);
        }
      }
    }, ['Initialize with a value']]
  ], body);
}, 500);
