import {getTypesForSchema} from '#jsoe/index.js';

describe('Demo spec', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-schema-instrumented.html', {
      onBeforeLoad (win) {
        cy.stub(win.console, 'log').as('consoleLog');
      }
    });
  });

  it('Opens non-schema option amidst schema items', function () {
    cy.get('.formatChoices:first').select('JSON only');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'Boolean (true)'
    );
    cy.get('#viewUI').click();
    cy.get('#viewUIResults').should('contain', 'true');
  });

  it('Opens schema object boolean option', function () {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'Object (Boolean)'
    );
    cy.get('#viewUI').click();
    cy.get('#viewUIResults').should('contain', 'boolean');
  });

  it('Opens schema boolean option', function () {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'boolean'
    );
    cy.get('#viewUI').click();
    cy.get('#viewUIResults').should('contain', 'true');
  });

  it('Opens any schema (boolean) option', function () {
    cy.get('.formatChoices:first').select('Schema: any schema');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'boolean'
    );
    cy.get('#viewUI').click();
    cy.get('#viewUIResults').should('contain', 'true');
  });

  it('Omits a never option for any schema', function () {
    cy.get('.formatChoices:first').select('Schema: any schema');
    const sel = '#formatAndTypeChoices ';
    cy.get(
      sel + 'select.typeChoices-demo-keypath-not-expected option'
    ).should('not.contain', 'Never');
  });

  it('Opens unknown schema (boolean) option', function () {
    cy.get('.formatChoices:first').select('Schema: unknown schema');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'boolean'
    );
    cy.get('#viewUI').click();
    cy.get('#viewUIResults').should('contain', 'true');
  });

  it('Initializes a form control with a value', () => {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance');
    cy.get('#initializeWithValue').click();
    cy.get('#formatAndTypeChoices input[type=number]').should(($input) => {
      expect($input.val()).to.equal('42');
    });
  });

  it('sets a schema format', function () {
    const sel = '#formatAndTypeChoicesFirstPreselected ';
    cy.get('#setASchemaFormat').click();
    cy.get(
      sel + '.formatChoices option:selected'
    ).should('have.value', 'schema');
  });

  it('recovers from bad schema format', function () {
    const sel = '#formatAndTypeChoicesFirstPreselected ';
    cy.on('uncaught:exception', (err /* , runnable */) => {
      if (err?.message.includes('Unexpected schema')) {
        // returning false here prevents Cypress from
        // failing the test
        return false;
      }
      return undefined;
    });
    cy.get('#setABadSchemaFormat').click();
    cy.get(
      sel + '.formatChoices option:selected'
    ).should('have.value', 'json');
  });

  it('falls back from `schemaOriginal` to `schemaContent`', function () {
    const sel = '#typeChoicesOnly ';
    cy.get(sel + 'select.typeChoices-demo-type-choices-only').select(
      'number'
    );
    cy.get('[data-type="number"][title="Number"]').should('exist');
  });

  it('renders an `xor` schema as a radio group of branches', function () {
    cy.get('.formatChoices:first').select(
      'Schema: Zodexy schema instance xor'
    );
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'fieldset.xorTypeChoices > legend').should(
      'contain', 'Exactly one of'
    );
    cy.get(sel + 'fieldset.xorTypeChoices label.xorTypeChoice').should(
      'have.length', 3
    );
    // Branch captions come from each option's `description`
    cy.get(sel + 'fieldset.xorTypeChoices label.xorTypeChoice').eq(1).should(
      'contain', 'An email address'
    );
  });

  it('edits the chosen branch of an `xor` schema', function () {
    cy.get('.formatChoices:first').select(
      'Schema: Zodexy schema instance xor'
    );
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'fieldset.xorTypeChoices input[type="radio"]').eq(0).check();
    cy.get(sel + '.typeContainer [data-type="string"]').should('exist');
    cy.get(sel + '.typeContainer textarea:first').type('plain text');
    cy.get('#viewUI').click();
    cy.get('#viewUIResults').should('contain', 'plain text');
  });

  it('captions object-branch `xor` radios from their description', function () {
    cy.get('.formatChoices:first').select(
      'Schema: Zodexy schema instance xor 2'
    );
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'fieldset.xorTypeChoices label.xorTypeChoice').eq(0).should(
      'contain', 'Pay by card'
    );
    cy.get(sel + 'fieldset.xorTypeChoices label.xorTypeChoice').eq(2).should(
      'contain', 'Store credit'
    );
  });

  it('flags an `xor` value that matches more than one branch', function () {
    cy.get('.formatChoices:first').select(
      'Schema: Zodexy schema instance xor'
    );
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'fieldset.xorTypeChoices input[type="radio"]').eq(0).check();
    // `a@b.com` satisfies both the plain-text and the email branch
    cy.get(sel + '.typeContainer textarea:first').type('a@b.com');
    cy.get(sel + 'fieldset.xorTypeChoices .xorMatchStatus').should(
      'have.class', 'xorMatchErr'
    );
    cy.get(sel + 'fieldset.xorTypeChoices .xorMatchStatus').should(
      'contain', 'Matches 2 of 3'
    );
    // A value matching exactly one branch clears the warning
    cy.get(sel + '.typeContainer textarea:first').clear();
    cy.get(sel + '.typeContainer textarea:first').type('plain text');
    cy.get(sel + 'fieldset.xorTypeChoices .xorMatchStatus').should(
      'have.class', 'xorMatchOk'
    );
  });

  it('marks an unfilled `xor` branch invalid so it cannot be submitted', () => {
    cy.get('.formatChoices:first').select(
      'Schema: Zodexy schema instance xor 2'
    );
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'fieldset.xorTypeChoices input[type="radio"]').eq(0).check();
    // Nothing entered yet: the empty object matches no branch
    cy.get(sel + 'fieldset.xorTypeChoices .xorMatchStatus').should(
      'have.class', 'xorMatchErr'
    );
    cy.get(sel + 'fieldset.xorTypeChoices input[type="radio"]:checked').should(
      ($r) => {
        expect(
          /** @type {HTMLInputElement} */ ($r[0]).validationMessage
        ).to.not.equal('');
      }
    );
  });

  it('invalidates a value that misses the chosen `xor` branch', function () {
    cy.get('.formatChoices:first').select(
      'Schema: Zodexy schema instance xor'
    );
    const sel = '#formatAndTypeChoices ';
    // Choose the email branch, leave it empty: `''` matches the plain-text
    //   branch, so the bare count would pass it; the chosen branch does not.
    cy.get(sel + 'fieldset.xorTypeChoices input[type="radio"]').eq(1).check();
    cy.get(sel + 'fieldset.xorTypeChoices .xorMatchStatus').should(
      'have.class', 'xorMatchErr'
    );
    cy.get(sel + 'fieldset.xorTypeChoices .xorMatchStatus').should(
      'contain', 'does not match the selected option'
    );
  });

  it('clears a stale `xor` branch error after switching branches', function () {
    cy.get('.formatChoices:first').select(
      'Schema: Zodexy schema instance xor'
    );
    const sel = '#formatAndTypeChoices ';
    // Make the email branch invalid...
    cy.get(sel + 'fieldset.xorTypeChoices input[type="radio"]').eq(1).check();
    cy.get(sel + '.typeContainer input:first').type('nope');
    cy.get(sel + 'fieldset.xorTypeChoices .xorMatchStatus').should(
      'have.class', 'xorMatchErr'
    );
    // ...then switch to the number branch and enter a valid number
    cy.get(sel + 'fieldset.xorTypeChoices input[type="radio"]').eq(2).check();
    cy.get(sel + '.typeContainer input:first').type('42');
    cy.get(sel + 'fieldset.xorTypeChoices .xorMatchStatus').should(
      'have.class', 'xorMatchOk'
    );
    cy.get(sel + 'fieldset.xorTypeChoices input[type="radio"]').should(
      ($radios) => {
        [...$radios].forEach((r) => {
          expect(
            /** @type {HTMLInputElement} */ (r).validationMessage
          ).to.equal('');
        });
      }
    );
  });

  it('uses `meta.title` for the schema type label', function () {
    cy.get('.formatChoices:first').select(
      'Schema: Zodexy schema instance meta'
    );
    cy.get(
      '#formatAndTypeChoices select.typeChoices-demo-keypath-not-expected ' +
        'option'
    ).should('contain', 'Object (Widget)');
  });

  it('reveals schema `meta` through the read-only info toggle', function () {
    cy.get('.formatChoices:first').select(
      'Schema: Zodexy schema instance meta'
    );
    // The lone `object` type renders directly; its own affordance is appended
    //   last, so it is the object root's direct-child `.schema-meta`.
    const toggle = '#formatAndTypeChoices [data-type="object"] > ' +
      '.schema-meta > .schema-meta-toggle';

    // The toggle carries every metadata row as a plain-text tooltip.
    cy.get(toggle).
      should('have.attr', 'title').
      and('contain', 'ID: widget').
      and('contain', 'Description: A widget');

    // The table is built lazily on first activation.
    cy.get(
      '#formatAndTypeChoices [data-type="object"] > .schema-meta ' +
        '.schema-meta-table'
    ).should('not.exist');
    cy.get(toggle).click();
    cy.get(
      '#formatAndTypeChoices [data-type="object"] > .schema-meta ' +
        '.schema-meta-table'
    ).should('be.visible').and('contain', 'Widget');
  });
});

describe('`getTypesForSchema`', function () {
  it('merges compatible non-object intersections', function () {
    const schemas = [
      {
        schema: {
          type: 'intersection',
          left: {type: 'bigInt', min: '2'},
          right: {type: 'bigInt', min: '10'}
        },
        expected: {type: 'bigInt', min: '10'}
      },
      {
        schema: {
          type: 'intersection',
          left: {
            type: 'array',
            element: {type: 'string'},
            minLength: 2
          },
          right: {
            type: 'array',
            element: {type: 'string'},
            minLength: 5,
            maxLength: 8
          }
        },
        expected: {
          type: 'array',
          element: {type: 'string'},
          minLength: 5,
          maxLength: 8
        }
      }
    ];

    for (const {schema, expected} of schemas) {
      expect([...getTypesForSchema(
        /** @type {import('zodexy').SzType} */ (schema),
        /** @type {import('zodexy').SzType} */ (schema)
      )]).to.deep.equal([expected]);
    }
  });

  it('errs with duplicate properties', function () {
    const schema = /** @type {import('zodexy').SzIntersection} */ ({
      type: 'intersection',
      left: {
        type: 'object',
        properties: {},
        catchall: {
          type: 'unknown'
        }
      },
      right: {
        type: 'object',
        properties: {},
        catchall: {
          type: 'never'
        }
      }
    });

    expect(
      () => getTypesForSchema(schema, schema)
    // eslint-disable-next-line sonarjs/test-check-exception -- Ok
    ).to.throw();
  });

  it("errs with duplicate properties' properties", function () {
    const schema = /** @type {import('zodexy').SzIntersection} */ ({
      type: 'intersection',
      left: {
        type: 'object',
        properties: {
          a: {
            type: 'string'
          }
        }
      },
      right: {
        type: 'object',
        properties: {
          a: {
            type: 'number'
          }
        }
      }
    });

    expect(
      () => getTypesForSchema(schema, schema)
    // eslint-disable-next-line sonarjs/test-check-exception -- Ok
    ).to.throw();
  });

  it('copies properties from right', function () {
    const schema = /** @type {import('zodexy').SzIntersection} */ ({
      type: 'intersection',
      left: {
        type: 'object',
        properties: {}
      },
      right: {
        type: 'object',
        properties: {},
        catchall: {
          type: 'never'
        }
      }
    });

    expect([...getTypesForSchema(schema, schema)]).to.deep.equal([{
      type: 'object',
      properties: {},
      catchall: {
        type: 'never'
      }
    }]);
  });

  it('copies object properties from right', function () {
    const schema = /** @type {import('zodexy').SzIntersection} */ ({
      type: 'intersection',
      left: {
        type: 'object',
        properties: {}
      },
      right: {
        type: 'object',
        properties: {},
        catcahll: {
          type: 'number'
        }
      }
    });

    expect([...getTypesForSchema(schema, schema)]).to.deep.equal([{
      type: 'object',
      properties: {},
      catcahll: {
        type: 'number'
      }
    }]);
  });

  it('copies `defaultValue` to group items', function () {
    const schema =
      /**
       * @type {import('zodexy').SzUnion<[
       *   import('zodexy').SzType,
       *   ...import('zodexy').SzType[]
       * ]>}
       */ ({
        type: 'union',
        defaultValue: {},
        options: [
          {
            type: 'object',
            properties: {}
          },
          {
            type: 'object',
            properties: {},
            catchall: {
              type: 'never'
            }
          }
        ]
      });

    expect([...getTypesForSchema(schema, schema)]).to.deep.equal([{
      type: 'object',
      properties: {},
      $defaultValue: {},
      $unionGroupID: 1
    }, {
      type: 'object',
      properties: {},
      catchall: {
        type: 'never'
      },
      $defaultValue: {},
      $unionGroupID: 1
    }]);
  });

  it('copies `readonly` to group items', function () {
    const schema =
      /**
       * @type {import('zodexy').SzUnion<[
       *   import('zodexy').SzType,
       *   ...import('zodexy').SzType[]
       * ]>}
       */ ({
        type: 'union',
        readonly: true,
        options: [
          {
            type: 'object',
            properties: {}
          },
          {
            type: 'object',
            properties: {},
            catchall: {
              type: 'never'
            }
          }
        ]
      });

    expect([...getTypesForSchema(schema, schema)]).to.deep.equal([{
      type: 'object',
      properties: {},
      $readonlyParent: true
    }, {
      type: 'object',
      properties: {},
      catchall: {
        type: 'never'
      },
      $readonlyParent: true
    }]);
  });

  it('copies `description` to group items', function () {
    const schema =
      /**
       * @type {import('zodexy').SzUnion<[
       *   import('zodexy').SzType,
       *   ...import('zodexy').SzType[]
       * ]>}
       */ ({
        type: 'union',
        description: 'Union',
        options: [
          {
            description: 'inner1',
            type: 'object',
            properties: {}
          },
          {
            type: 'object',
            properties: {},
            catchall: {
              type: 'never'
            }
          }
        ]
      });

    expect([...getTypesForSchema(schema, schema)]).to.deep.equal([{
      type: 'object',
      properties: {},
      description: 'inner1 and Union'
    }, {
      type: 'object',
      properties: {},
      catchall: {
        type: 'never'
      },
      description: 'Union'
    }]);
  });

  it('copies `discriminator` to group items', function () {
    const schema =
      /**
       * @type {import('zodexy').SzDiscriminatedUnion<'a', any>}
       */ ({
        type: 'discriminatedUnion',
        discriminator: 'a',
        options: [
          {
            type: 'object',
            properties: {
              a: {
                type: 'string'
              },
              b: {
                type: 'number'
              }
            }
          },
          {
            type: 'object',
            properties: {
              a: {
                type: 'string'
              },
              c: {
                type: 'number'
              }
            }
          }
        ]
      });

    expect([...getTypesForSchema(schema, schema)]).to.deep.equal([{
      type: 'object',
      $discriminator: 'a',
      properties: {
        a: {
          type: 'string'
        },
        b: {
          type: 'number'
        }
      }
    }, {
      type: 'object',
      $discriminator: 'a',
      properties: {
        a: {
          type: 'string'
        },
        c: {
          type: 'number'
        }
      }
    }]);
  });

  it('adds `null` type for `isNullable` group items', function () {
    const schema =
      /**
       * @type {import('zodexy').SzUnion<[
       *   import('zodexy').SzType,
       *   ...import('zodexy').SzType[]
       * ]>}
       */ ({
        type: 'union',
        isNullable: true,
        options: [
          {
            type: 'object',
            properties: {}
          },
          {
            type: 'object',
            properties: {},
            catchall: {
              type: 'never'
            }
          }
        ]
      });

    expect([...getTypesForSchema(schema, schema)]).to.deep.equal([{
      type: 'object',
      properties: {}
    }, {
      type: 'object',
      properties: {},
      catchall: {
        type: 'never'
      }
    }, {
      type: 'null'
    }]);
  });

  it('flattens an `xor` (exclusive union) like a `union`', function () {
    const schema = /** @type {import('zodexy').SzType} */ ({
      type: 'xor',
      options: [
        {type: 'string'},
        {type: 'number'}
      ]
    });

    expect([...getTypesForSchema(schema, schema)]).to.deep.equal([
      {type: 'string'},
      {type: 'number'}
    ]);
  });

  it('does not throw on an `xor` with no options', function () {
    const schema = /** @type {import('zodexy').SzType} */ ({
      type: 'xor',
      options: []
    });

    expect([...getTypesForSchema(schema, schema)]).to.deep.equal([]);
  });
});
