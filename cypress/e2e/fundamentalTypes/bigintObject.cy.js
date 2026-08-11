describe('bigintObject spec', () => {
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
      'bigintObject'
    );
    cy.get('input[name="demo-keypath-not-expected-bigintObject"]').should(
      'exist'
    );
  });

  it('gets type', function (done) {
    cy.on('window:alert', (t) => {
      expect(t).to.eq('bigintObject');
      done();
    });
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'bigintObject'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-bigintObject"]',
      '12345'
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
      'bigintObject'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-bigintObject"]',
      '12345'
    );
    cy.get('button#isValid').click();
  });

  it('logs value', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'bigintObject'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-bigintObject"]',
      '12345'
    );

    cy.get('button#logValue').click();
    cy.get('@consoleLog').should('be.calledWith', new Object(12345n));
  });

  it('views UI', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'bigintObject'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-bigintObject"]',
      '12345'
    );

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults i[data-type="bigintObject"]').should('exist');
    cy.get('#viewUIResults i[data-type="bigintObject"]').should(
      'contain', '12345n'
    );
  });

  it('gets value', function () {
    cy.clearTypeAndBlur('#getValueForString', '12345n');
    cy.get('@consoleLog').should('be.calledWith', 12345n);
  });

  // For the "Type choices with initial value set" control
  it('gets a value set onload', function () {
    cy.get(
      'input[name="demo-type-choices-only-initial-value-bigintObject"]'
    ).should(($input) => {
      expect($input.val()).to.equal('123');
    });
  });
});

describe('bigintObject spec (schemas)', () => {
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
      'bigintObject'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-bigintObject"]',
      '12345'
    );

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults i[data-type="bigintObject"]').should('exist');
    cy.get('#viewUIResults i[data-type="bigintObject"]').then((elem) => {
      expect(elem.attr('title')).to.equal('A BigInt object');
    });
  });

  it('gets value', function () {
    cy.clearTypeAndBlur('#getValueForString', 'BigIntObject123n');
    cy.get('@consoleLog').should('be.calledWith', new Object(123n));
  });
});
