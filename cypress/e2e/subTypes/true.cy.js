describe('true spec', () => {
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
      'true'
    );
    cy.get(sel + 'input[name="demo-keypath-not-expected-true2"]').should(
      'be.checked'
    );
  });

  it('gets type', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'true'
    );

    cy.get('button#getType').click();
    cy.get('dialog[open]').should('include.text', 'true');
  });

  it('is valid', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'true'
    );
    cy.get('button#isValid').click();
    cy.get('dialog[open]').should('include.text', 'true');
  });

  it('logs value', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'true'
    );

    cy.get('button#logValue').click();
    cy.get('@consoleLog').should('be.calledWith', true);
  });

  it('views UI', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'true'
    );

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults i[data-type="true"]').should('exist');
  });

  it('gets value', function () {
    cy.clearTypeAndBlur('#getValueForString', 'true');
    cy.get('@consoleLog').should('be.calledWith', true);
  });
});
