describe('template literal schema spec', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-schema-instrumented.html', {
      onBeforeLoad (win) {
        cy.stub(win.console, 'log').as('consoleLog');
      }
    });
    cy.get('.formatChoices:first').select(
      'Schema: Zodexy schema instance 2'
    );
    cy.get(
      '#formatAndTypeChoices select.typeChoices-demo-keypath-not-expected'
    ).select('String (Template literal)');
  });

  it('uses the string editor with its default value', () => {
    cy.get(
      '#formatAndTypeChoices ' +
      'textarea[name="demo-keypath-not-expected-string"]'
    ).should('have.value', 'item-42');
  });

  it('gets the runtime type', function (done) {
    cy.on('window:alert', (text) => {
      expect(text).to.eq('string');
      done();
    });
    cy.get('button#getType').click();
  });

  it('validates against the template', function () {
    cy.on('window:alert', (text) => {
      expect(text).to.eq('false');
    });
    cy.clearTypeAndBlur(
      '#formatAndTypeChoices ' +
      'textarea[name="demo-keypath-not-expected-string"]',
      'wrong'
    );
    cy.get('button#isValid').click();
  });

  it('logs a matching value', () => {
    cy.clearTypeAndBlur(
      '#formatAndTypeChoices ' +
      'textarea[name="demo-keypath-not-expected-string"]',
      'item-123'
    );
    cy.get('button#logValue').click();
    cy.get('@consoleLog').should('be.calledWith', 'item-123');
  });

  it('views as a string with the schema description', () => {
    cy.get('button#viewUI').click();
    cy.get('#viewUIResults span[data-type="string"]').should(($span) => {
      expect($span.text()).to.equal('item-42');
      expect($span.attr('title')).to.equal('Template literal');
    });
  });
});
