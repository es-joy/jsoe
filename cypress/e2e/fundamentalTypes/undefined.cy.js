describe('undefined spec', () => {
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
      'undef'
    );
    cy.get('input[name="demo-keypath-not-expected-undef"]').should(
      'be.checked'
    );
  });

  it('gets type', function (done) {
    cy.on('window:alert', (t) => {
      expect(t).to.eq('undef');
      done();
    });
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'undef'
    );

    cy.get('button#getType').click();
  });

  it('is valid', function (done) {
    cy.on('window:alert', (t) => {
      expect(t).to.eq('true');
      done();
    });
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'undef'
    );
    cy.get('button#isValid').click();
  });

  it('logs value', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'undef'
    );

    cy.get('button#logValue').click();
    cy.get('@consoleLog').should('be.calledWith', undefined);
  });

  it('views UI', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'undef'
    );

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults i[data-type="undef"]').should('exist');
  });

  it('gets value', function () {
    cy.clearTypeAndBlur('#getValueForString', 'undefined');
    cy.get('@consoleLog').should('be.calledWith', undefined);
  });
});

describe('Undefined spec (schemas)', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-schema-instrumented.html', {
      onBeforeLoad (win) {
        cy.stub(win.console, 'log').as('consoleLog');
      }
    });
  });

  it('views UI', function () {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 4');

    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'Explicit undefined (An undefined)'
    );

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults i[data-type="undef"]').should('exist');
    cy.get('#viewUIResults i[data-type="undef"]').then((elem) => {
      expect(elem.attr('title')).to.equal('An undefined');
    });
  });
});
