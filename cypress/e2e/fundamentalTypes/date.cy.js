describe('date spec', () => {
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
      'date'
    );
    cy.get('input[name="demo-keypath-not-expected-date"]').should(
      'exist'
    );
  });

  it('creates form control for valid date', () => {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + '.formatChoices').select('indexedDBKey');
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'ValidDate'
    );
    cy.get('input[name="demo-keypath-not-expected-date"]').should(
      'exist'
    );
  });

  it('gets type', function (done) {
    cy.on('window:alert', (t) => {
      expect(t).to.eq('date');
      done();
    });
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'date'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-date"]',
      '1999-01-01T00:00'
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
      'date'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-date"]',
      '1999-01-01T00:00'
    );
    cy.get('button#isValid').click();
  });

  it('logs value', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'date'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-date"]',
      '1999-01-01T00:00'
    );

    cy.get('button#logValue').click();
    cy.get('@consoleLog').should('be.calledWith', new Date('1999-01-01T00:00'));
  });

  it('logs invalid date value', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'date'
    );
    cy.get(
      'input[name="demo-keypath-not-expected-invalidDate"]'
    ).click();

    cy.get('button#logValue').click();
    cy.get('button#logValue').click();
    cy.get('button#logValue').click();
    cy.get('button#logValue').click();
    cy.get('@consoleLog').should('be.calledWith', new Date('Invalid Date'));
  });

  it('views UI', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'date'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-date"]',
      '1999-01-01T20:00'
    );

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults i[data-type="date"]').should('exist');
    cy.get('#viewUIResults i[data-type="date"]').should(
      'contain', '1999-01-01'
    );
  });

  it('views UI for invalid date', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'date'
    );
    cy.get(
      'input[name="demo-keypath-not-expected-invalidDate"]'
    ).click();

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults i[data-type="date"]').should('exist');
    cy.get('#viewUIResults i[data-type="date"]').should(
      'contain', 'InvalidDate'
    );
  });

  it('gets value', function () {
    cy.clearTypeAndBlur('#getValueForString', '1999-01-01T00:00');
    cy.get('@consoleLog').should('be.calledWith', new Date('1999-01-01T00:00'));
  });

  it('gets value for ValidDate', function () {
    cy.get('#useIndexedDBKey').click();
    cy.clearTypeAndBlur('#getValueForString', '1999-01-01T00:00');
    cy.get('@consoleLog').should('be.calledWith', new Date('1999-01-01T00:00'));
  });

  // For the "Type choices with initial value set" control
  it('gets a value set onload', function () {
    cy.get(
      'input[name="demo-type-choices-only-initial-value-date"]'
    ).should(($input) => {
      expect($input.val()).to.contain('1999-01-01');
    });
  });

  it('gets an invalid value set onload', function () {
    cy.get(
      'input[name="demo-type-choices-only-initial-value-invalidDate"]'
    ).should('be.checked');
  });
});

describe('Date spec (schemas)', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-schema-instrumented.html', {
      onBeforeLoad (win) {
        cy.stub(win.console, 'log').as('consoleLog');
      }
    });
  });

  it('views UI', function () {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 3');

    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'Date (A date)'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-date"]',
      '1999-01-01T20:00'
    );

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults i[data-type="date"]').should('exist');
    cy.get('#viewUIResults i[data-type="date"]').should(
      'contain', '1999-01-01'
    );
    cy.get('#viewUIResults i[data-type="date"]').then((elem) => {
      expect(elem.attr('title')).to.equal('A date');
    });
  });

  it('creates form control (with `defaultValue`)', () => {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 6');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'date'
    );
    cy.get('input[name="demo-keypath-not-expected-date"]').should(
      'have.value', '1999-01-01T00:00'
    );
  });

  it('should set mins and maxes', () => {
    cy.get('.formatChoices:first').select(
      'Schema: Zodexy schema instance mins and maxes'
    );
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'date'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-date"]',
      '1995-01-01T00:00'
    ).then((elem) => {
      expect(elem[0].validity.rangeUnderflow).to.equal(true);
      expect(elem[0].validity.rangeOverflow).to.equal(false);
    });

    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-date"]',
      '2005-01-01T00:00'
    ).then((elem) => {
      expect(elem[0].validity.rangeUnderflow).to.equal(false);
      expect(elem[0].validity.rangeOverflow).to.equal(true);
    });

    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-date"]',
      '1999-05-01T00:00'
    ).then((elem) => {
      expect(elem[0].validity.rangeUnderflow).to.equal(false);
      expect(elem[0].validity.rangeOverflow).to.equal(false);
    });
  });
});
