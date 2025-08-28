import {jml, body, $} from '../src/vendor-imports.js';

import {
  formatAndTypeChoices,
  typeChoices,
  Types
} from '../src/index.js';

/**
 * @param {any[]} values
 * @param {import('zodex').SzType} schema
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

        value,
        schemaContent: schema.options[idx],
        schemaOriginal: schema.options[idx]
      }).domArray
    ]];
  })]];
}

const schemaInstanceJSONArbitraryJS = {
  type: 'union',
  options: [
    {
      description: 'A symbol',
      type: 'symbol'
    },
    {
      description: 'A symbol (global)',
      type: 'symbol'
    },
    {
      description: 'A Promise',
      type: 'promise',
      value: {
        type: 'number'
      }
    },

    {
      description: 'A function',
      type: 'function',
      args: {
        type: 'tuple',
        items: [
          {
            type: 'number'
          }
        ],
        rest: {
          type: 'string'
        }
      },
      returns: {
        type: 'boolean'
      }
    }
  ]
};

// Todo: We could prevent UI from allowing 'never' types to be added (we are
//   using a Set not a Tuple for args, so no built-in checks available
//   currently)
const schemaInstanceJSONArbitraryJS2 = {
  type: 'union',
  options: [
    {
      type: 'function',
      description: 'With never',
      args: {
        type: 'tuple',
        items: [
          {
            type: 'never'
          }
        ],
        rest: {
          type: 'never'
        }
      },
      returns: {
        type: 'never'
      }
    }
  ]
};

/**
 * @param {string} schema
 * @throws {Error}
 * @returns {import('zodex').SzType}
 */
function getSchemaContent (schema) {
  switch (schema) {
  case 'Zodex arbitrary JS schema':
    return schemaInstanceJSONArbitraryJS;
  case 'Zodex arbitrary JS schema 2':
    return schemaInstanceJSONArbitraryJS2;
  /* istanbul ignore next -- Guard */
  default:
    /* istanbul ignore next -- Guard */
    throw new Error('Unexpected schema ' + schema);
  }
}

const keyPathNotExpectedTypeChoices = await formatAndTypeChoices({
  hasKeyPath: false,
  arbitraryJS: true,
  preselectSchema: false,
  typeNamespace: 'demo-keypath-not-expected',
  schemas: ['Zodex arbitrary JS schema', 'Zodex arbitrary JS schema 2'],
  getSchemaContent
});

jml('section', {role: 'main'}, [
  ['h1', [
    'Jsoe testing'
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
            $('#formatAndTypeChoices .formatChoices').value,
            keyPathNotExpectedTypeChoices.getValue(),
            {
              readonly: true,
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
        await keyPathNotExpectedTypeChoices.setValue(42);
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
        const types = new Types();
        const value = types.getValueForString(this.value, {
          format: 'arbitraryJS'
        })[0];
        console.log(value);
      }
    }
  }],

  ['h2', [
    'Type choices with initial value set'
  ]],
  (() => {
    const typeSelection = typeChoices({
      format: 'arbitraryJS',
      setValue: true,
      value: [
        Symbol('abcdefg'),
        Symbol.for('abcdefgh'),
        Promise.resolve('aaa'),
        function (a, b, c) {
          console.log(a, b, c);
        }
      ],
      typeNamespace: 'demo-type-choices-only-initial-value1'
    });

    const typeSelectionSymbol = typeChoices({
      format: 'arbitraryJS',
      setValue: true,
      value: Symbol('tuv'),
      typeNamespace: 'demo-type-choices-only-initial-value2'
    });

    const typeSelectionSymbolFor = typeChoices({
      format: 'arbitraryJS',
      setValue: true,
      value: Symbol.for('xyz'),
      typeNamespace: 'demo-type-choices-only-initial-value3'
    });

    const typeSelectionPromise = typeChoices({
      format: 'arbitraryJS',
      setValue: true,
      value: Promise.resolve(123),
      typeNamespace: 'demo-type-choices-only-initial-value4'
    });

    const typeSelectionFunction = typeChoices({
      format: 'arbitraryJS',
      setValue: true,
      value (a, b, c) {
        console.log(a, b, c);
      },
      typeNamespace: 'demo-type-choices-only-initial-value5'
    });

    return ['form', [
      ...typeSelection.domArray,
      ...typeSelectionSymbol.domArray,
      ...typeSelectionSymbolFor.domArray,
      ...typeSelectionPromise.domArray,
      ...typeSelectionFunction.domArray
    ]];
  })(),

  jml('section', {role: 'main'}, [
    ['h1', [
      'Jsoe schema testing'
    ]],
    ['form', [
      ...getTypeChoices([
        Symbol('abcd'),
        Symbol.for('abcde'),
        Promise.resolve(135),
        function (a, b, c) {
          console.log(a, b, c);
        }
      ], schemaInstanceJSONArbitraryJS)
    ]]
  ])
], body);
