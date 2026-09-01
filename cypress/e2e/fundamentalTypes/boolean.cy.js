describe('boolean spec', () => {
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
      'boolean'
    );
    cy.get(sel + 'div[data-type="boolean"] input[value="true"]').should(
      'be.checked'
    );
  });

  it('creates form control (with `defaultValue`)', () => {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 6');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'boolean'
    );
    cy.get(sel + 'div[data-type="boolean"] input[value="false"]').should(
      'be.checked'
    );
  });

  it('gets type', function () {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'boolean'
    );

    cy.get('button#getType').click();
    cy.get('dialog[open]').should('include.text', 'boolean');
  });

  it('is valid', function () {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'boolean'
    );
    cy.get('button#isValid').click();
    cy.get('dialog[open]').should('include.text', 'true');
  });

  it('logs value', function () {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'boolean'
    );

    cy.get('button#logValue').click();
    cy.get('@consoleLog').should('be.calledWith', true);
  });

  it('views UI', function () {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'boolean'
    );

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults i[data-type="boolean"]').should('have.text', 'true');

    cy.get(
      'input[name="demo-keypath-not-expected-boolean1"][value=false]'
    ).click();

    cy.get('button#viewUI').click();
    cy.get(
      '#viewUIResults i[data-type="boolean"]'
    ).should('have.text', 'false');

    cy.get(
      '#viewUIResults i[data-type="boolean"]'
    ).should(($input) => {
      expect($input.attr('title')).to.equal('A boolean');
    });
  });

  it('views UI (no description)', function () {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 9');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'boolean'
    );

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults i[data-type="boolean"]').should('have.text', 'true');

    cy.get(
      'input[name="demo-keypath-not-expected-boolean1"][value=false]'
    ).click();

    cy.get('button#viewUI').click();
    cy.get(
      '#viewUIResults i[data-type="boolean"]'
    ).should('have.text', 'false');

    cy.get(
      '#viewUIResults i[data-type="boolean"]'
    ).should(($input) => {
      expect($input.attr('title')).to.equal('(a boolean)');
    });
  });

  it('gets value', function () {
    cy.clearTypeAndBlur('#getValueForString', 'false');
    cy.get('@consoleLog').should('be.calledWith', false);
  });
});
