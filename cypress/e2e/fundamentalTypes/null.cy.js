describe('null spec', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-instrumented.html', {
      onBeforeLoad (win) {
        cy.stub(win.console, 'log').as('consoleLog');
      }
    });
  });
  it('creates form control', () => {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select('null');
    cy.get('input[name="demo-keypath-not-expected-null"]').should('be.checked');
  });

  it('gets type', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select('null');

    cy.get('button#getType').click();
    cy.get('dialog[open]').should('include.text', 'null');
  });

  it('is valid', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select('null');
    cy.get('button#isValid').click();
    cy.get('dialog[open]').should('include.text', 'true');
  });

  it('logs value', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select('null');

    cy.get('button#logValue').click();
    cy.get('@consoleLog').should('be.calledWith', null);
  });

  it('views UI', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select('null');

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults i[data-type="null"]').should('exist');
  });

  it('gets value', function () {
    cy.clearTypeAndBlur('#getValueForString', 'null');
    cy.get('@consoleLog').should('be.calledWith', null);
  });
});

describe('Null spec (schemas)', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-schema-instrumented.html', {
      onBeforeLoad (win) {
        cy.stub(win.console, 'log').as('consoleLog');
      }
    });
  });

  it('views UI', function () {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 5');

    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'Null (A null)'
    );

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults i[data-type="null"]').should('exist');
    cy.get('#viewUIResults i[data-type="null"]').then((elem) => {
      expect(elem.attr('title')).to.equal('A null');
    });
  });
});
