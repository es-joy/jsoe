describe('NumberObject spec', () => {
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
      'NumberObject'
    );
    cy.get('input[name="demo-keypath-not-expected-NumberObject"]').should(
      'exist'
    );
  });

  it('gets type', function (done) {
    cy.on('window:alert', (t) => {
      expect(t).to.eq('NumberObject');
      done();
    });
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'NumberObject'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-NumberObject"]',
      '123.45'
    );

    cy.get('button#getType').click();
  });

  it('is valid', function (done) {
    cy.on('window:alert', (t) => {
      expect(t).to.eq(true);
      done();
    });
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'NumberObject'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-NumberObject"]',
      '123.45'
    );
    cy.get('button#isValid').click();
  });

  it('logs value', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'NumberObject'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-NumberObject"]',
      '123.45'
    );

    cy.get('button#logValue').click();
    // eslint-disable-next-line no-new-wrappers, unicorn/new-for-builtins -- Testing
    cy.get('@consoleLog').should('be.calledWith', new Number(123.45));
  });

  it('views UI', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'NumberObject'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-NumberObject"]',
      '123.45'
    );

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults i[data-type="NumberObject"]').should('exist');
    cy.get('#viewUIResults i[data-type="NumberObject"]').should(
      'contain', '123.45'
    );
  });

  it('gets value', function () {
    cy.clearTypeAndBlur('#getValueForString', '123.45');
    cy.get('@consoleLog').should('be.calledWith', 123.45);
  });

  // For the "Type choices with initial value set" control
  it('gets a value set onload', function () {
    cy.get(
      'input[name="demo-type-choices-only-initial-value-NumberObject"]'
    ).should(($input) => {
      expect($input.val()).to.equal('42');
    });
  });
});

describe('NumberObject spec (schemas)', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-schema-instrumented.html', {
      onBeforeLoad (win) {
        cy.stub(win.console, 'log').as('consoleLog');
      }
    });
  });

  it('views UI', function () {
    cy.get('.formatChoices:first').select('Schema: Zodex schema instance 2');

    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'NumberObject'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-NumberObject"]',
      '123.45'
    );

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults i[data-type="NumberObject"]').should('exist');
    cy.get('#viewUIResults i[data-type="NumberObject"]').should(
      'contain', '123.45'
    );
    cy.get('#viewUIResults i[data-type="NumberObject"]').then((elem) => {
      expect(elem.attr('title')).to.equal('A Number object');
    });
  });
});
