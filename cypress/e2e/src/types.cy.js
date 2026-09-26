import Types, {
  getPropertyValueFromLegend
} from '#jsoe/types.js';
import {formatAndTypeChoices, typeChoices} from '#jsoe/index.js';
import {getTypesForSchema} from '#jsoe/formats/schema.js';

/**
 * @param {ParentNode} root
 * @returns {Promise<void>}
 */
async function whenAllTypeChoicesReady (root) {
  let settledCount = -1;
  for (;;) {
    const choices = [...root.querySelectorAll('select[class*="typeChoices-"]')];
    // eslint-disable-next-line no-await-in-loop -- Each pass may reveal more nested choices
    await Promise.all(choices.map((select) => {
      return /** @type {{ $whenReady?: () => Promise<void> }} */ (
        select
      ).$whenReady?.() ?? Promise.resolve();
    }));
    if (choices.length === settledCount) {
      return;
    }
    settledCount = choices.length;
  }
}

describe('`getPropertyValueFromLegend`', function () {
  beforeEach(() => {
    document.body.replaceChildren();
  });
  it('throws if no property on supplied element', function () {
    const legend = document.createElement('legend');
    document.body.append(legend);

    expect(() => {
      getPropertyValueFromLegend(legend);
    }).to.throw('No property on the supplied legend element');
  });

  it('throws if no property text content is found', function () {
    const legend = document.createElement('legend');
    const span = document.createElement('span');
    span.dataset.prop = 'true';
    legend.append(span);
    document.body.append(legend);
    expect(() => {
      getPropertyValueFromLegend(legend);
    }).to.throw('No property with text present on the supplied legend element');
  });
});

describe('`Types.getTypeForRoot`', function () {
  it('`getTypeForRoot` with null root', function () {
    expect(Types.getTypeForRoot(null)).to.equal('null');
  });
});

describe('`typeChoices`', function () {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it('uses the supplied specific schema when setting type programmatically', function () {
    const schemaContent = /**
                           * @type {import('zodexy').SzUnion<[
                           *   import('zodexy').SzType, import('zodexy').SzType
                           * ]>}
                           */ ({
        $defs: {
          secondOnly: {
            type: 'string'
          }
        },
        type: 'union',
        options: [
          {
            meta: {title: 'First branch'},
            type: 'object',
            properties: {
              type: {
                type: 'literal',
                values: ['first']
              }
            }
          },
          {
            meta: {title: 'Second branch'},
            type: 'object',
            properties: {
              type: {
                type: 'literal',
                values: ['second']
              },
              secondOnly: {
                $ref: '#/$defs/secondOnly'
              }
            }
          }
        ]
      });
    const [, secondSchema] = [...getTypesForSchema(
      schemaContent,
      schemaContent
    )];
    const choice = typeChoices({
      format: 'schema',
      typeNamespace: 'specific-schema',
      schemaContent
    });
    document.body.append(...choice.domArray);
    const select = /**
                    * @type {import('../../../src/typeChoices.js').TypeChoicesElementAPI}
                    */ (
        document.querySelector('.typeChoices-specific-schema')
      );

    select.$setType({
      type: 'object',
      specificSchema: secondSchema,
      avoidReport: true
    });

    expect(select.selectedOptions[0].textContent).to.equal(
      'Object (Second branch)'
    );
    expect(document.body.textContent).to.contain('secondOnly');
  });

  it('renders schema record entries when setting an existing schema value', async function () {
    const schemaContent = /** @type {import('zodexy').SzObject} */ ({
      type: 'object',
      properties: {
        type: {
          type: 'literal',
          values: ['object']
        },
        properties: {
          type: 'record',
          key: {
            type: 'string'
          },
          value: {
            type: 'union',
            options: [
              {
                type: 'object',
                properties: {
                  type: {
                    type: 'literal',
                    values: ['boolean']
                  }
                }
              }
            ]
          }
        }
      }
    });
    const {
      formatChoices, typesHolder, setValue, whenReady
    } = await formatAndTypeChoices({
      schemas: ['schema'],
      selectedSchema: 'schema',
      getSchemaContent: () => Promise.resolve(schemaContent),
      hasValue: false,
      singleValue: true,
      typeNamespace: 'existing-schema'
    });
    document.body.append(formatChoices, typesHolder);
    await whenReady;
    await setValue({
      type: 'object',
      properties: {
        abc: {
          type: 'boolean'
        }
      }
    }, {
      readonly: false,
      typeNamespace: 'existing-schema',
      schemaContent
    });
    await whenAllTypeChoicesReady(typesHolder);

    expect(document.body.textContent).to.contain('abc');
  });

  it(
    'selects the matching branch\'s radio when setting an existing ' +
      '`xor` value',
    async function () {
      const schemaContent = /** @type {import('zodexy').SzXor<any>} */ ({
        type: 'xor',
        options: [
          {description: 'A greeting', type: 'literal', values: ['hi']},
          {description: 'A count', type: 'number'}
        ]
      });
      const {
        formatChoices, typesHolder, setValue, whenReady
      } = await formatAndTypeChoices({
        schemas: ['schema'],
        selectedSchema: 'schema',
        getSchemaContent: () => Promise.resolve(schemaContent),
        hasValue: false,
        singleValue: true,
        typeNamespace: 'xor-existing-value'
      });
      document.body.append(formatChoices, typesHolder);
      await whenReady;
      await setValue(42, {
        readonly: false,
        typeNamespace: 'xor-existing-value',
        schemaContent
      });
      await whenAllTypeChoicesReady(typesHolder);

      const checkedLabel = /** @type {HTMLElement|null} */ (
        typesHolder.querySelector(
          ':scope fieldset.xorTypeChoices input[type="radio"]:checked'
        )?.closest('label')
      );
      expect(checkedLabel?.textContent).to.contain('A count');
    }
  );

  it(
    'reports the "nothing selected yet" defaults from an `xor` radio ' +
      'group\'s shimmed `<select>`-shaped API',
    async function () {
      const schemaContent = /** @type {import('zodexy').SzXor<any>} */ ({
        type: 'xor',
        options: [
          {description: 'A greeting', type: 'literal', values: ['hi']},
          {description: 'A count', type: 'number'}
        ]
      });
      const {formatChoices, typesHolder, whenReady} =
        await formatAndTypeChoices({
          schemas: ['schema'],
          selectedSchema: 'schema',
          getSchemaContent: () => Promise.resolve(schemaContent),
          hasValue: false,
          singleValue: true,
          typeNamespace: 'xor-unselected'
        });
      document.body.append(formatChoices, typesHolder);
      await whenReady;

      const fieldset = /**
                        * @type {HTMLFieldSetElement & {
                        *value: string, selectedIndex: number,
                        *selectedOptions: {value: string}[]
      }} */ (
          typesHolder.querySelector(':scope fieldset.xorTypeChoices')
        );
      expect(fieldset.value).to.equal('');
      expect(fieldset.selectedIndex).to.equal(0);
      expect(fieldset.selectedOptions).to.deep.equal([]);
    }
  );

  it(
    'shows a "cannot add beyond maxSize" dialog for a fixed-arity ' +
      '(no `rest`) function',
    async function () {
      const schemaContent =
        /** @type {import('zodexy').SzFunction<any, any>} */ ({
          type: 'function',
          input: {
            type: 'tuple', items: [{type: 'number'}, {type: 'number'}]
          },
          output: {type: 'boolean'}
        });
      const {
        formatChoices, typesHolder, setValue, whenReady
      } = await formatAndTypeChoices({
        schemas: ['schema'],
        selectedSchema: 'schema',
        getSchemaContent: () => Promise.resolve(schemaContent),
        hasValue: false,
        singleValue: true,
        typeNamespace: 'function-fixed-arity'
      });
      document.body.append(formatChoices, typesHolder);
      await whenReady;
      await setValue(function (/** @type {number} */ a, /** @type {number} */ b) {
        return a < b;
      }, {
        readonly: false,
        typeNamespace: 'function-fixed-arity',
        schemaContent
      });
      await whenAllTypeChoicesReady(typesHolder);

      const addButton = /** @type {HTMLButtonElement} */ (
        typesHolder.querySelector(
          ':scope [data-type="function"] div[data-type="set"] ' +
            '.addArrayElement'
        )
      );
      addButton.click();

      const dialog = document.querySelector('dialog[open]');
      expect(dialog?.textContent).to.contain('maxSize');
    }
  );

  it(
    '`formatChoices.$whenReady()` resolves the same build the returned ' +
      '`whenReady` tracks',
    async function () {
      const {formatChoices, typesHolder, whenReady} =
        await formatAndTypeChoices({
          schemas: [],
          hasValue: false,
          singleValue: true,
          typeNamespace: 'format-choices-when-ready'
        });
      document.body.append(formatChoices, typesHolder);
      await whenReady;
      // Not `.equal(whenReady)`: a later rebuild reassigns the module's
      //   own tracked promise, so this only asserts both currently settle
      //   for the same (already-built) type choices, not identity.
      await /** @type {{$whenReady: () => Promise<void>}} */ (
        /** @type {unknown} */ (formatChoices)
      ).$whenReady();
    }
  );
});

describe('string `stringbool` viewUI', function () {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it(
    'falls back to "(a string boolean)" as the title when the schema ' +
      'has no label',
    function () {
      const types = new Types();
      const root = /** @type {HTMLElement} */ (types.getUIForModeAndType({
        readonly: true,
        typeNamespace: 'stringbool-no-label',
        type: 'string',
        format: 'schema',
        value: 'yes',
        hasValue: true,
        specificSchemaObject: /** @type {import('zodexy').SzType} */ ({
          type: 'pipe',
          inner: {type: 'string'},
          outer: {type: 'boolean'},
          case: 'sensitive',
          truthy: ['yes'],
          falsy: ['no']
        })
      }));
      document.body.append(root);
      expect(root.title).to.equal('(a string boolean)');
    }
  );
});

describe('bigint `literal` editUI', function () {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it('falls back to "BigInt" as the title when the schema has no label',
    function () {
      const types = new Types();
      const root = /** @type {HTMLDivElement} */ (types.getUIForModeAndType({
        readonly: false,
        typeNamespace: 'literal-bigint-no-label',
        type: 'bigint',
        format: 'schema',
        value: undefined,
        hasValue: false,
        specificSchemaObject: /** @type {import('zodexy').SzType} */ ({
          type: 'literal',
          values: [1n, 2n]
        })
      }));
      document.body.append(root);
      expect(root.title).to.equal('BigInt');
    });
});

describe('number `format`-derived min/max', function () {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it(
    'derives HTML min/max bounds from a numeric `format` when the ' +
      'schema gives no explicit min/max',
    function () {
      const types = new Types();
      const root = /** @type {HTMLDivElement} */ (types.getUIForModeAndType({
        readonly: false,
        typeNamespace: 'number-format-bounds',
        type: 'number',
        format: 'schema',
        value: undefined,
        hasValue: false,
        specificSchemaObject: /** @type {import('zodexy').SzType} */ ({
          type: 'number',
          format: 'safeint',
          minInclusive: true,
          maxInclusive: true
        })
      }));
      document.body.append(root);
      const input = /** @type {HTMLInputElement} */ (
        root.querySelector('input')
      );
      expect(Number(input.min)).to.equal(Number.MIN_SAFE_INTEGER);
      expect(Number(input.max)).to.equal(Number.MAX_SAFE_INTEGER);
    }
  );
});

describe('error `setValue` clears fields absent from a later value',
  function () {
    beforeEach(() => {
      document.body.replaceChildren();
    });

    it(
      'unchecks name/fileName/stack and blanks lineNumber/columnNumber ' +
        'when a later `setValue` omits them',
      function () {
        const types = new Types();
        const root = /** @type {HTMLDivElement} */ (
          types.getUIForModeAndType({
            readonly: false,
            typeNamespace: 'error-clear-fields',
            type: 'error',
            format: 'structuredCloning',
            hasValue: true,
            value: {
              message: 'first',
              name: 'FirstError',
              fileName: 'first.js',
              lineNumber: 1,
              columnNumber: 2,
              stack: 'first stack'
            }
          })
        );
        document.body.append(root);

        types.setValue({type: 'error', root, value: {message: 'second'}});

        expect(
          /** @type {HTMLInputElement} */ (
            root.querySelector('input.name[type=checkbox]')
          ).checked
        ).to.equal(false);
        expect(
          /** @type {HTMLInputElement} */ (
            root.querySelector('input.fileName[type=checkbox]')
          ).checked
        ).to.equal(false);
        expect(
          /** @type {HTMLInputElement} */ (
            root.querySelector('input.stack[type=checkbox]')
          ).checked
        ).to.equal(false);
        expect(
          /** @type {HTMLInputElement} */ (
            root.querySelector('input.lineNumber[type=number]')
          ).value
        ).to.equal('');
        expect(
          /** @type {HTMLInputElement} */ (
            root.querySelector('input.columnNumber[type=number]')
          ).value
        ).to.equal('');
      }
    );

    it(
      'unchecks message and sets name/fileName/lineNumber/columnNumber ' +
        'when a later `setValue` supplies them (the reverse direction)',
      function () {
        const types = new Types();
        const root = /** @type {HTMLDivElement} */ (
          types.getUIForModeAndType({
            readonly: false,
            typeNamespace: 'error-set-fields',
            type: 'error',
            format: 'structuredCloning',
            hasValue: true,
            // `editUI`'s own default-param fill-in only applies when
            //   `value` itself is `undefined`, not for a partial object -
            //   so every field must be given explicitly here.
            value: {
              message: 'only message',
              name: '',
              fileName: '',
              lineNumber: '',
              columnNumber: '',
              stack: ''
            }
          })
        );
        document.body.append(root);

        types.setValue({
          type: 'error',
          root,
          value: {
            name: 'SecondError',
            fileName: 'second.js',
            lineNumber: 3,
            columnNumber: 4
          }
        });

        expect(
          /** @type {HTMLInputElement} */ (
            root.querySelector('input.message[type=checkbox]')
          ).checked
        ).to.equal(false);
        expect(
          /** @type {HTMLInputElement} */ (
            root.querySelector('input.name:not([type])')
          ).value
        ).to.equal('SecondError');
        expect(
          /** @type {HTMLInputElement} */ (
            root.querySelector('input.fileName:not([type])')
          ).value
        ).to.equal('second.js');
        expect(
          /** @type {HTMLInputElement} */ (
            root.querySelector('input.lineNumber[type=number]')
          ).value
        ).to.equal('3');
        expect(
          /** @type {HTMLInputElement} */ (
            root.querySelector('input.columnNumber[type=number]')
          ).value
        ).to.equal('4');
      }
    );
  });

describe('symbol `setValue`', function () {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it(
    'selects "Symbol.for()" and fills the input for a registered symbol',
    function () {
      const types = new Types();
      const root = /** @type {HTMLDivElement} */ (
        types.getUIForModeAndType({
          readonly: false,
          typeNamespace: 'symbol-setvalue-registered',
          type: 'symbol',
          format: 'structuredCloning',
          hasValue: true,
          value: Symbol('first')
        })
      );
      document.body.append(root);

      types.setValue({
        type: 'symbol', root, value: Symbol.for('registered')
      });

      expect(
        /** @type {HTMLInputElement} */ (
          root.querySelector('input[value="Symbol.for"]')
        ).checked
      ).to.equal(true);
      expect(
        /** @type {HTMLInputElement} */ (
          root.querySelector('input.symbolInput')
        ).value
      ).to.equal('registered');
    }
  );

  it('selects "Symbol()" for an unregistered symbol', function () {
    const types = new Types();
    const root = /** @type {HTMLDivElement} */ (types.getUIForModeAndType({
      readonly: false,
      typeNamespace: 'symbol-setvalue-unregistered',
      type: 'symbol',
      format: 'structuredCloning',
      hasValue: true,
      value: Symbol.for('was registered')
    }));
    document.body.append(root);

    types.setValue({type: 'symbol', root, value: Symbol('unregistered')});

    expect(
      /** @type {HTMLInputElement} */ (
        root.querySelector('input[value="Symbol"]')
      ).checked
    ).to.equal(true);
    expect(
      /** @type {HTMLInputElement} */ (
        root.querySelector('input.symbolInput')
      ).value
    ).to.equal('unregistered');
  });
});

describe('blob `viewUI` video revokes its object URL on load', function () {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it(
    'calls `URL.revokeObjectURL` once the video fires `loadeddata` ' +
      '(outside Safari/iOS)',
    function () {
      const types = new Types();
      const root = /** @type {HTMLDivElement} */ (types.getUIForModeAndType({
        readonly: true,
        typeNamespace: 'blob-video-revoke',
        type: 'blob',
        format: 'structuredCloning',
        value: new Blob(['fake'], {type: 'video/webm'}),
        hasValue: true
      }));
      document.body.append(root);

      const video = /** @type {HTMLVideoElement} */ (
        root.querySelector('video.video')
      );
      // `cy.stub()` only queues installing the stub; dispatching the event
      //   as plain (non-`cy.`) synchronous code right after would race it,
      //   so the dispatch is itself queued (`cy.then()`) to run after.
      cy.stub(URL, 'revokeObjectURL').as('revokeObjectURL');
      cy.then(() => {
        video.dispatchEvent(new Event('loadeddata'));
      });
      cy.get('@revokeObjectURL').should('have.been.calledOnce');
    }
  );
});

describe('`Types.getFormControlFromRootAncestor`', function () {
  it('`getFormControlFromRootAncestor` with non-root ancestor', function () {
    const types = new Types();
    expect(types.getFormControlFromRootAncestor(
      'missing'
    )).to.be.null;
  });
});

describe(
  '`Types.validate`/`Types.setValue` stale-root guard',
  function () {
    beforeEach(() => {
      document.body.replaceChildren();
    });

    // A `root`'s own `data-type` (read via `Types.getTypeForRoot`) can
    //   stop matching the `type` a caller still holds - e.g. a stale
    //   closure from before a `xor`/union control switched branches - so
    //   both methods guard against acting on a mismatched pair rather than
    //   assuming the caller's `type` is still current.
    it(
      '`validate` returns `true` (skips validating) for a stale `type`',
      function () {
        const types = new Types();
        const root = /** @type {HTMLDivElement} */ (
          types.getUIForModeAndType({
            readonly: false,
            typeNamespace: 'stale-root-validate',
            type: 'string',
            format: 'structuredCloning',
            value: 'hello',
            hasValue: true
          })
        );
        document.body.append(root);
        expect(root.dataset.type).to.equal('string');
        expect(
          types.validate({type: 'number', root, avoidReport: true})
        ).to.equal(true);
      }
    );

    it(
      '`setValue` returns `undefined` (skips setting) for a stale `type`',
      function () {
        const types = new Types();
        const root = /** @type {HTMLDivElement} */ (
          types.getUIForModeAndType({
            readonly: false,
            typeNamespace: 'stale-root-setvalue',
            type: 'string',
            format: 'structuredCloning',
            value: 'hello',
            hasValue: true
          })
        );
        document.body.append(root);
        expect(root.dataset.type).to.equal('string');
        expect(
          types.setValue({type: 'number', root, value: 42})
        ).to.be.undefined;
      }
    );
  }
);

describe('`Types.validate` zodexy error messages', function () {
  /**
   * @param {Types} types
   * @returns {HTMLInputElement}
   */
  function getInvalidNumberInput (types) {
    const root = /** @type {HTMLDivElement} */ (types.getUIForModeAndType({
      readonly: false,
      typeNamespace: 'zodexy-error',
      type: 'number',
      format: 'schema',
      value: undefined,
      hasValue: false,
      specificSchemaObject: {
        type: 'number',
        error: 'Schema validation message'
      }
    }));
    document.body.append(root);
    types.validate({type: 'number', root, avoidReport: true});
    return /** @type {HTMLInputElement} */ (root.querySelector('input'));
  }

  /**
   * @param {Types} types
   * @returns {HTMLTextAreaElement}
   */
  function getInvalidStringInput (types) {
    const root = types.getUIForModeAndType({
      readonly: false,
      typeNamespace: 'zodexy-string-error',
      type: 'string',
      format: 'schema',
      value: 'invalid',
      hasValue: true,
      specificSchemaObject: {
        type: 'string',
        startsWith: 'valid',
        error: 'Schema string message'
      }
    });
    document.body.append(root);
    const textarea = /** @type {HTMLTextAreaElement} */ (
      root.querySelector('textarea')
    );
    textarea.dispatchEvent(new Event('change'));
    return textarea;
  }

  beforeEach(() => {
    document.body.replaceChildren();
  });

  it('uses default validation messages by default', function () {
    const input = getInvalidNumberInput(new Types());
    expect(input.validationMessage).to.equal('Not a valid (finite) number');
  });

  it('uses a zodexy error when enabled', function () {
    const input = getInvalidNumberInput(new Types({
      useZodexyErrorMessages: true
    }));
    expect(input.validationMessage).to.equal('Schema validation message');
  });

  it('overrides schema validation messages set within a type', function () {
    const types = new Types({
      useZodexyErrorMessages: true,
      useZodexyErrorMessagesInTypes: true
    });
    const textarea = getInvalidStringInput(types);
    expect(textarea.validationMessage).to.equal('Schema string message');

    textarea.value = 'valid value';
    textarea.dispatchEvent(new Event('change'));
    expect(textarea.validationMessage).to.equal('');
  });

  it('disables zodexy errors set within types by default', function () {
    const types = new Types({
      useZodexyErrorMessages: true
    });
    expect(getInvalidNumberInput(types).validationMessage).to.equal(
      'Schema validation message'
    );
    expect(getInvalidStringInput(types).validationMessage).to.equal(
      `Value doesn't start with expected: valid`
    );
  });

  it('uses the failing intersection branch error', function () {
    const intersectionSchema =
      /** @type {import('zodexy').SzIntersection} */ ({
        type: 'intersection',
        left: {
          type: 'string',
          min: 5,
          error: 'Minimum length message'
        },
        right: {
          type: 'string',
          max: 7,
          error: 'Maximum length message'
        }
      });
    const [stringSchema] = [...getTypesForSchema(
      intersectionSchema, intersectionSchema
    )];
    expect(stringSchema).to.deep.equal({
      type: 'string',
      min: 5,
      max: 7
    });

    const types = new Types({useZodexyErrorMessages: true});
    const root = /** @type {HTMLDivElement} */ (types.getUIForModeAndType({
      readonly: false,
      typeNamespace: 'zodexy-intersection-error',
      type: 'string',
      format: 'schema',
      value: 'abcdefgh',
      hasValue: true,
      specificSchemaObject: stringSchema
    }));
    document.body.append(root);
    const textarea = /** @type {HTMLTextAreaElement} */ (
      root.querySelector('textarea')
    );

    types.validate({type: 'string', root, avoidReport: true});
    expect(textarea.validationMessage).to.equal('Maximum length message');

    textarea.value = 'abc';
    types.validate({type: 'string', root, avoidReport: true});
    expect(textarea.validationMessage).to.equal('Minimum length message');
  });
});

describe('RegExp type validation', function () {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it('validates source input changes', function () {
    const types = new Types();
    const root = /** @type {HTMLDivElement} */ (types.getUIForModeAndType({
      readonly: false,
      typeNamespace: 'regexp-validation',
      type: 'regexp',
      format: 'structuredCloning',
      value: undefined,
      hasValue: false
    }));
    document.body.append(root);
    const input = /** @type {HTMLInputElement} */ (
      root.querySelector('input[name="regexp-validation-regexp"]')
    );

    input.value = 'abc(';
    input.dispatchEvent(new Event('input'));

    expect(input.validationMessage).to.equal(
      'Invalid regular expression: /abc(/: Unterminated group'
    );
  });
});

describe('`Types.getTypeOptionsForFormatAndState`', function () {
  it(
    '`getTypeOptionsForFormatAndState` with bad states for format',
    function () {
      expect(() => {
        const types = new Types();
        types.getTypeOptionsForFormatAndState(
          'json', 'nonexistent'
        );
      }).to.throw('Unexpected type for format and state');

      expect(() => {
        const types = new Types();
        types.getTypeOptionsForFormatAndState(
          'indexedDBKey', 'nonexistent'
        );
      }).to.throw('Unexpected type for format and state');
    }
  );

  it(
    '`getTypeOptionsForFormatAndState` with schema format and no schema',
    function () {
      expect(() => {
        const types = new Types();
        types.getTypeOptionsForFormatAndState(
          'schema'
        );
      }).to.throw('Missing schema object');
    }
  );
});

describe('`Types.getValueForString`', function () {
  it('`getValueForString` throws with bad state for format', function () {
    expect(() => {
      const types = new Types();
      types.getValueForString('test', {
        format: 'json',
        state: 'badFormat',
        parent: {},
        parentPath: '',
        // @ts-expect-error -- Bad argument
        schemaObject: {},
        // @ts-expect-error -- Bad argument
        schemaOriginal: {}
      });
    }).to.throw('Could not get types for format and state');
  });
});
