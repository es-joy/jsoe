describe('bigint spec', () => {
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
      'bigint'
    );
    cy.get('input[name="demo-keypath-not-expected-bigint"]').should(
      'exist'
    );
  });

  it('gets type', function (done) {
    cy.on('window:alert', (t) => {
      expect(t).to.eq('bigint');
      done();
    });
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'bigint'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-bigint"]',
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
      'bigint'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-bigint"]',
      '12345'
    );
    cy.get('button#isValid').click();
  });

  it('logs value', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'bigint'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-bigint"]',
      '12345'
    );

    cy.get('button#logValue').click();
    cy.get('@consoleLog').should('be.calledWith', 12345n);
  });

  it('views UI', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'bigint'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-bigint"]',
      '12345'
    );

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults i[data-type="bigint"]').should('exist');
    cy.get('#viewUIResults i[data-type="bigint"]').should('contain', '12345n');
  });

  it('gets value', function () {
    cy.clearTypeAndBlur('#getValueForString', '12345n');
    cy.get('@consoleLog').should('be.calledWith', 12345n);
  });

  // For the "Type choices with initial value set" control
  it('gets a value set onload', function () {
    cy.get(
      'input[name="demo-type-choices-only-initial-value-bigint"]'
    ).should(($input) => {
      expect($input.val()).to.equal('123');
    });
  });
});

describe('BigInt spec (schemas)', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-schema-instrumented.html', {
      onBeforeLoad (win) {
        cy.stub(win.console, 'log').as('consoleLog');
      }
    });
  });

  it('views UI', function () {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance');

    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'bigint'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-bigint"]',
      '12345'
    );

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults i[data-type="bigint"]').should('exist');
    cy.get('#viewUIResults i[data-type="bigint"]').should('contain', '12345');
    cy.get('#viewUIResults i[data-type="bigint"]').then((elem) => {
      expect(elem.attr('title')).to.equal('A BigInt');
    });
  });

  it('creates form control (with `defaultValue`)', () => {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 6');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'bigint'
    );
    cy.get('input[name="demo-keypath-not-expected-bigint"]').should(
      'have.value', '1234567890'
    );
  });

  it('sets mins and maxes', () => {
    cy.get('.formatChoices:first').select(
      'Schema: Zodexy schema instance mins and maxes'
    );
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'bigint'
    );

    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-bigint"]',
      '300'
    ).then((elem) => {
      expect(elem[0].validity.rangeUnderflow).to.equal(true);
      expect(elem[0].validity.rangeOverflow).to.equal(false);
    });

    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-bigint"]',
      '400'
    ).then((elem) => {
      expect(elem[0].validity.rangeUnderflow).to.equal(true);
      expect(elem[0].validity.rangeOverflow).to.equal(false);
    });

    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-bigint"]',
      '700'
    ).then((elem) => {
      expect(elem[0].validity.rangeUnderflow).to.equal(false);
      expect(elem[0].validity.rangeOverflow).to.equal(true);
    });

    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-bigint"]',
      '800'
    ).then((elem) => {
      expect(elem[0].validity.rangeUnderflow).to.equal(false);
      expect(elem[0].validity.rangeOverflow).to.equal(true);
    });

    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-bigint"]',
      '603'
    ).then((elem) => {
      expect(elem[0].validity.rangeUnderflow).to.equal(false);
      expect(elem[0].validity.rangeOverflow).to.equal(false);
    });
  });

  it('sets mins and maxes (multipleOf, inclusive)', () => {
    cy.get('.formatChoices:first').select(
      'Schema: Zodexy schema instance mins and maxes 2'
    );
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'bigint'
    );

    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-bigint"]',
      '399'
    ).then((elem) => {
      expect(elem[0].validity.rangeUnderflow).to.equal(true);
      expect(elem[0].validity.rangeOverflow).to.equal(false);
    });

    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-bigint"]',
      '400'
    ).then((elem) => {
      expect(elem[0].validity.rangeUnderflow).to.equal(false);
      expect(elem[0].validity.rangeOverflow).to.equal(false);
    });

    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-bigint"]',
      '700'
    ).then((elem) => {
      expect(elem[0].validity.rangeUnderflow).to.equal(false);
      expect(elem[0].validity.rangeOverflow).to.equal(false);
    });

    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-bigint"]',
      '701'
    ).then((elem) => {
      expect(elem[0].validity.rangeUnderflow).to.equal(false);
      expect(elem[0].validity.rangeOverflow).to.equal(true);
    });

    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-bigint"]',
      '603'
    ).then((elem) => {
      expect(elem[0].validity.rangeUnderflow).to.equal(false);
      expect(elem[0].validity.rangeOverflow).to.equal(false);
      expect(elem[0].validity.stepMismatch).to.equal(true);
    });
  });

  it('validates `int64` and `uint64` formats', () => {
    cy.get('.formatChoices:first').select(
      'Schema: Zodexy schema instance BigInt formats'
    );
    const sel = '#formatAndTypeChoices ';
    const input = 'input[name="demo-keypath-not-expected-bigint"]';

    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'bigint (An int64 BigInt)'
    );
    cy.get(input).should('have.attr', 'min', '-9223372036854775808');
    cy.get(input).should('have.attr', 'max', '9223372036854775807');
    cy.clearTypeAndBlur(input, '9223372036854775808').then((elem) => {
      expect(elem[0].validationMessage).to.equal(
        'BigInt must be at most 9223372036854775807'
      );
    });

    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'bigint (A uint64 BigInt)'
    );
    cy.get(input).should('have.attr', 'min', '0');
    cy.get(input).should('have.attr', 'max', '18446744073709551615');
    cy.clearTypeAndBlur(input, '-1').then((elem) => {
      expect(elem[0].validationMessage).to.equal(
        'BigInt must be at least 0'
      );
    });
  });
});
