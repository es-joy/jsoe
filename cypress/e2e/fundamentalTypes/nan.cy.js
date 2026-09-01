describe('NaN spec', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-schema-instrumented.html', {
      onBeforeLoad (win) {
        cy.stub(win.console, 'log').as('consoleLog');
      }
    });
  });
  it('creates form control', () => {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'nan'
    );
    cy.get('input[name="demo-keypath-not-expected-nan"]').should(
      'be.checked'
    );
  });

  it('gets type', function () {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'nan'
    );

    cy.get('button#getType').click();
    cy.get('dialog[open]').should('include.text', 'nan');
  });

  it('is valid', function () {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'nan'
    );
    cy.get('button#isValid').click();
    cy.get('dialog[open]').should('include.text', 'true');
  });

  it('logs value', function () {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'nan'
    );

    cy.get('button#logValue').click();
    cy.get('@consoleLog').should('be.calledWith', NaN);
  });

  it('views UI', function () {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'nan'
    );

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults i[data-type="nan"]').should('exist');
    cy.get('#viewUIResults i[data-type="nan"]').should(($i) => {
      expect($i.attr('title')).to.equal('A NaN');
    });
  });

  it('views UI (without description)', function () {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 9');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'nan'
    );

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults i[data-type="nan"]').should('exist');
    cy.get('#viewUIResults i[data-type="nan"]').should(($i) => {
      expect($i.attr('title')).to.equal('(a `NaN`)');
    });
  });

  it('gets value', function () {
    cy.clearTypeAndBlur('#getValueForString', 'NaN');
    cy.get('@consoleLog').should('be.calledWith', NaN);
  });
});
