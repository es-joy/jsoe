import {
  getFormatAndSchemaChoices, formatAndTypeChoices
} from '#jsoe/formatAndTypeChoices.js';

describe('getFormatAndSchemaChoices', function () {
  it(
    'preselects "Arbitrary JavaScript Object" when a schema is also ' +
      'available but not itself preselected',
    () => {
      const fragment = getFormatAndSchemaChoices({
        schemas: ['schema'],
        arbitraryJS: true,
        preselectSchema: true
      });
      const arbitraryJSOption = /** @type {HTMLOptionElement} */ (
        [...fragment.children].find(
          (opt) => opt.textContent === 'Arbitrary JavaScript Object'
        )
      );
      expect(arbitraryJSOption.selected).to.equal(false);
    }
  );
});

describe('formatAndTypeChoices spec', function () {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-instrumented.html', {
      onBeforeLoad (win) {
        cy.stub(win.console, 'log').as('consoleLog');
      }
    });
  });

  it('programmatically sets format to JSON', function () {
    cy.get('#programmaticallySetFormatToJSON').click();
    const sel = '#formatAndTypeChoices ';
    cy.get(
      sel +
      'select.typeChoices-demo-keypath-not-expected option[value=string]'
    ).should('exist');
    cy.get(
      sel +
      'select.typeChoices-demo-keypath-not-expected option[value=StringObject]'
    ).should('not.exist');
    cy.get(sel + 'select.formatChoices').should(($select) => {
      expect($select.find('option:selected').val()).to.equal('json');
    });
  });
});

describe('formatAndTypeChoices().validValuesSet', function () {
  it(
    'is false before any type/branch has been chosen (no rendered ' +
      'type root yet to check)',
    async () => {
      const {validValuesSet} = await formatAndTypeChoices({
        hasKeyPath: false,
        arbitraryJS: true,
        preselectSchema: false,
        typeNamespace: 'valid-values-unset-test'
      });
      expect(validValuesSet()).to.equal(false);
    }
  );
});
