import {jml, body, $} from '../src/vendor-imports.js';
import dialogs from '../src/utils/dialogs.js';

import {
  formatAndTypeChoices,
  typeChoices,
  Types
} from '../src/index.js';

/**
 * @param {HTMLElement} el
 * @returns {el is HTMLInputElement}
 */
function isInputElement (el) {
  return el.nodeName.toLowerCase() === 'input';
}

/**
 * @param {any[]} values
 * @param {import('zodexy').SzUnion} schema
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

/** @type {import('zodexy').SzUnion<any>} */
const schemaInstanceJSONArbitraryJS = {
  type: 'union',
  options: [
    {
      description: 'A symbol',
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
      input: {
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
      output: {
        type: 'boolean'
      }
    }
  ]
};

// Todo: We could prevent UI from allowing 'never' types to be added (we are
//   using a Set not a Tuple for args, so no built-in checks available
//   currently)
/** @type {import('zodexy').SzUnion<any>} */
const schemaInstanceJSONArbitraryJS2 = {
  type: 'union',
  options: [
    {
      type: 'function',
      description: 'With never',
      input: {
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
      output: {
        type: 'never'
      }
    }
  ]
};

/**
 * @param {string} schema
 * @throws {Error}
 * @returns {Promise<import('zodexy').SzType>}
 */
async function getSchemaContent (schema) {
  switch (schema) {
  case 'Zodexy arbitrary JS schema':
    return await schemaInstanceJSONArbitraryJS;
  case 'Zodexy arbitrary JS schema 2':
    return await schemaInstanceJSONArbitraryJS2;
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
  schemas: ['Zodexy arbitrary JS schema', 'Zodexy arbitrary JS schema 2'],
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
        dialogs.alert(keyPathNotExpectedTypeChoices.getType());
      }
    }
  }, ['Get type']],

  ['button', {
    id: 'isValid',
    $on: {
      click () {
        dialogs.alert(String(
          keyPathNotExpectedTypeChoices.validValuesSet()
        ));
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
            /** @type {import('../src/formats.js').AvailableFormat} */
            (
              /**
               * @type {HTMLSelectElement}
               */
              ($('#formatAndTypeChoices .formatChoices')).value
            ),
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
        $('#viewUIResults')?.firstChild?.remove();
        $('#viewUIResults')?.append(controls);
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
        const root = /** @type {HTMLDivElement} */ ($(
          '#formatAndTypeChoices > .typesHolder > ' +
            '.typeContainer > div[data-type]'
        ));
        const formControl =
          keyPathNotExpectedTypeChoices.types.getFormControlForRoot(root);
        if (!formControl) {
          return;
        }
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
        if (!isInputElement(this)) {
          return;
        }
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
        Promise.resolve('aaa'),
        /**
         * @param {unknown} a
         * @param {unknown} b
         * @param {unknown} c
         * @returns {void}
         */
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
      /**
       * @param {unknown} a
       * @param {unknown} b
       * @param {unknown} c
       * @returns {void}
       */
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
        Promise.resolve(135),
        /**
         * @param {unknown} a
         * @param {unknown} b
         * @param {unknown} c
         * @returns {void}
         */
        function (a, b, c) {
          console.log(a, b, c);
        }
      ], schemaInstanceJSONArbitraryJS)
    ]]
  ])
], body);
