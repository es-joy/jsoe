import {getFormatAndSchemaChoices} from '#jsoe/formatAndTypeChoices.js';

describe('getFormatAndSchemaChoices', function () {
  it(
    'preselects "Arbitrary JavaScript Object" when a schema is also ' +
      'available but not itself preselected',
    () => {
      const options = /** @type {[string, {selected?: boolean}][]} */ (
        /** @type {unknown} */ (
          getFormatAndSchemaChoices({
            schemas: ['schema'],
            arbitraryJS: true,
            preselectSchema: true
          })
        )
      );
      const [, arbitraryJSOpts] = /** @type {[string, {selected?: boolean}]} */ (
        options.find(([text]) => text === 'Arbitrary JavaScript Object')
      );
      expect(arbitraryJSOpts.selected).to.equal(false);
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
