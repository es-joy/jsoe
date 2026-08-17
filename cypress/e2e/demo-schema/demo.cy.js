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

  it('Opens any schema (never) option', function () {
    cy.get('.formatChoices:first').select('Schema: any schema');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'Never'
    );

    cy.on('uncaught:exception', (err /* , runnable */) => {
      if (err?.message.includes('Cannot convert to value')) {
        // returning false here prevents Cypress from
        // failing the test
        return false;
      }
      return undefined;
    });

    cy.get('#viewUI').click();

    cy.get('#viewUIResults').should(
      'not.contain', 'Never (no value present here)'
    );
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
});

describe('`getTypesForSchema`', function () {
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
});
