describe('void spec', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-schema-instrumented.html', {
      onBeforeLoad (win) {
        cy.stub(win.console, 'log').as('consoleLog');
      }
    });
  });

  it('creates form control', () => {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 2');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'void'
    );
    cy.get('input[name="demo-keypath-not-expected-void"]').should(
      'be.checked'
    );
  });

  it('gets type', function (done) {
    cy.on('window:alert', (t) => {
      expect(t).to.eq('void');
      done();
    });
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 2');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'void'
    );

    cy.get('button#getType').click();
  });

  it('is valid', function (done) {
    cy.on('window:alert', (t) => {
      expect(t).to.eq(true);
      done();
    });
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 2');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'void'
    );
    cy.get('button#isValid').click();
  });

  it('logs value', function () {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 2');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'void'
    );

    cy.get('button#logValue').click();
    cy.get('@consoleLog').should('be.calledWith', undefined);
  });

  it('views UI', function () {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 2');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'void'
    );

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults i[data-type="void"]').should(($i) => {
      expect($i.attr('title')).to.equal('A void');
    });
  });

  it('views UI (without description)', function () {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 9');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'void'
    );

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults i[data-type="void"]').should(($i) => {
      expect($i.attr('title')).to.equal('(a `void`)');
    });
  });

  it('gets value', function () {
    cy.clearTypeAndBlur('#getValueForString', 'void');
    cy.get('@consoleLog').should('be.calledWith', undefined);
  });
});
