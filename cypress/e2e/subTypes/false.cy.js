describe('false spec', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-instrumented.html', {
      onBeforeLoad (win) {
        cy.stub(win.console, 'log').as('consoleLog');
      }
    });
  });
  it('creates form control', () => {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'false'
    );
    cy.get(sel + 'input[name="demo-keypath-not-expected-false2"]').should(
      'be.checked'
    );
  });

  it('gets type', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'false'
    );

    cy.get('button#getType').click();
    cy.get('dialog[open]').should('include.text', 'false');
  });

  it('is valid', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'false'
    );
    cy.get('button#isValid').click();
    cy.get('dialog[open]').should('include.text', 'true');
  });

  it('logs value', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'false'
    );

    cy.get('button#logValue').click();
    cy.get('@consoleLog').should('be.calledWith', false);
  });

  it('views UI', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'false'
    );

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults i[data-type="false"]').should('exist');
  });

  it('gets value', function () {
    cy.clearTypeAndBlur('#getValueForString', 'false');
    cy.get('@consoleLog').should('be.calledWith', false);
  });
});
