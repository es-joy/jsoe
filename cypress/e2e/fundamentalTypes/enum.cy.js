describe('enum spec', () => {
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
      'enum'
    );
    cy.get(sel + 'select[name="demo-keypath-not-expected-enum"]').should(
      'exist'
    );
  });

  it('gets type', function (done) {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 2');
    cy.on('window:alert', (t) => {
      expect(t).to.eq('enum');
      done();
    });
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'enum'
    );

    cy.get('button#getType').click();
  });

  it('is valid', function (done) {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 2');
    cy.on('window:alert', (t) => {
      expect(t).to.eq(true);
      done();
    });
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'enum'
    );
    cy.get('button#isValid').click();
  });

  it('logs value', function () {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 2');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'enum'
    );

    cy.get('button#logValue').click();
    cy.get('@consoleLog').should('be.calledWith', 'def');
  });

  it('views UI', function () {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 2');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'enum'
    );
    cy.get(sel + 'select[name="demo-keypath-not-expected-enum"]').select(
      'ghi'
    );

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults span[data-type="enum"]').should(($span) => {
      expect($span.text()).to.contain('ghi');
      expect($span.attr('title')).to.equal('An enum');
    });
  });

  it('views UI (no description)', function () {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 9');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'enum'
    );
    cy.get(sel + 'select[name="demo-keypath-not-expected-enum"]').select(
      'efgh'
    );

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults span[data-type="enum"]').should(($span) => {
      expect($span.text()).to.contain('efgh');
      expect($span.attr('title')).to.equal('(an enum)');
    });
  });

  it('gets value', function () {
    cy.clearTypeAndBlur('#getValueForString', 'Enum("abc")');
    cy.get('@consoleLog').should('be.calledWith', 'abc');
  });
});
