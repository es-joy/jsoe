describe('BooleanObject spec', () => {
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
      'BooleanObject'
    );
    cy.get(
      'input[name="demo-keypath-not-expected-BooleanObject3"][value=true]'
    ).should(
      'be.checked'
    );
  });

  it('gets type', function (done) {
    cy.on('window:alert', (t) => {
      expect(t).to.eq('BooleanObject');
      done();
    });
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'BooleanObject'
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
      'BooleanObject'
    );
    cy.get('button#isValid').click();
  });

  it('logs value', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'BooleanObject'
    );

    cy.get('button#logValue').click();
    // eslint-disable-next-line no-new-wrappers, unicorn/new-for-builtins -- Testing
    cy.get('@consoleLog').should('be.calledWith', new Boolean(true));
  });

  it('logs value (false)', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'BooleanObject'
    );
    cy.get(
      'input[name="demo-keypath-not-expected-BooleanObject3"][value=false]'
    ).click();

    cy.get('button#logValue').click();
    // eslint-disable-next-line no-new-wrappers, unicorn/new-for-builtins -- Testing
    cy.get('@consoleLog').should('be.calledWith', new Boolean(false));
  });

  it('views UI', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'BooleanObject'
    );

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults i[data-type="BooleanObject"]').should('exist');
  });

  it('gets value', function () {
    cy.clearTypeAndBlur('#getValueForString', 'Boolean(true)');
    // eslint-disable-next-line no-new-wrappers, unicorn/new-for-builtins -- Testing
    cy.get('@consoleLog').should('be.calledWith', new Boolean(true));
  });

  it('gets a value set onload', function () {
    cy.get(
      'input[name="demo-type-choices-only-initial-value-BooleanObject1"]' +
        '[value=false]'
    ).should('be.checked');
  });
});

describe('BooleanObject spec (schemas)', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-schema-instrumented.html', {
      onBeforeLoad (win) {
        cy.stub(win.console, 'log').as('consoleLog');
      }
    });
  });

  it('views UI', function () {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 2');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'BooleanObject'
    );

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults i[data-type="BooleanObject"]').should('exist');

    cy.get('#viewUIResults i[data-type="BooleanObject"]').then((elem) => {
      expect(elem.attr('title')).to.equal('A Boolean object');
    });
  });
});
