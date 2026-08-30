describe('number spec', () => {
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
      'number'
    );
    cy.get('input[name="demo-keypath-not-expected-number"]').should(
      'exist'
    );
  });

  it('gets type', function (done) {
    cy.on('window:alert', (t) => {
      expect(t).to.eq('number');
      done();
    });
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'number'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-number"]',
      '123.45'
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
      'number'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-number"]',
      '123.45'
    );
    cy.get('button#isValid').click();
  });

  it('logs value', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'number'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-number"]',
      '123.45'
    );

    cy.get('button#logValue').click();
    cy.get('@consoleLog').should('be.calledWith', 123.45);
  });

  it('views UI', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'number'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-number"]',
      '123.45'
    );

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults i[data-type="number"]').should('exist');
    cy.get('#viewUIResults i[data-type="number"]').should('contain', '123.45');
  });

  it('gets value', function () {
    cy.clearTypeAndBlur('#getValueForString', '123.45');
    cy.get('@consoleLog').should('be.calledWith', 123.45);
  });

  // For the "Type choices with initial value set" control
  it('gets a value set onload', function () {
    cy.get(
      'input[name="demo-type-choices-only-initial-value-number"]'
    ).should(($input) => {
      expect($input.val()).to.equal('42');
    });
  });
});

describe('number spec (schemas)', () => {
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
      'number'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-number"]',
      '123.45'
    );

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults i[data-type="number"]').should('exist');
    cy.get('#viewUIResults i[data-type="number"]').should('contain', '123.45');
    cy.get('#viewUIResults i[data-type="number"]').then((elem) => {
      expect(elem.attr('title')).to.equal('A number');
    });
  });

  it('creates form control (with `defaultValue`)', () => {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 6');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'number'
    );
    cy.get('input[name="demo-keypath-not-expected-number"]').should(
      'have.value', '15'
    );
  });

  it('sets mins and maxes (int)', () => {
    cy.get('.formatChoices:first').select(
      'Schema: Zodexy schema instance mins and maxes'
    );
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'number'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-number"]',
      '400'
    ).then((elem) => {
      expect(elem[0].validity.rangeUnderflow).to.equal(true);
      expect(elem[0].validity.rangeOverflow).to.equal(false);
    });

    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-number"]',
      '700'
    ).then((elem) => {
      expect(elem[0].validity.rangeUnderflow).to.equal(false);
      expect(elem[0].validity.rangeOverflow).to.equal(true);
    });

    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-number"]',
      '603'
    ).then((elem) => {
      expect(elem[0].validity.rangeUnderflow).to.equal(false);
      expect(elem[0].validity.rangeOverflow).to.equal(false);
    });

    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-number"]',
      '444.44'
    ).then((elem) => {
      expect(elem[0].validity.rangeUnderflow).to.equal(false);
      expect(elem[0].validity.rangeOverflow).to.equal(false);
      expect(elem[0].validity.stepMismatch).to.equal(true);
    });
  });

  it('sets mins and maxes (multipleOf, inclusive)', () => {
    cy.get('.formatChoices:first').select(
      'Schema: Zodexy schema instance mins and maxes 2'
    );
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'number'
    );

    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-number"]',
      '399'
    ).then((elem) => {
      expect(elem[0].validity.rangeUnderflow).to.equal(true);
      expect(elem[0].validity.rangeOverflow).to.equal(false);
    });

    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-number"]',
      '400'
    ).then((elem) => {
      expect(elem[0].validity.rangeUnderflow).to.equal(false);
      expect(elem[0].validity.rangeOverflow).to.equal(false);
    });

    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-number"]',
      '700'
    ).then((elem) => {
      expect(elem[0].validity.rangeUnderflow).to.equal(false);
      expect(elem[0].validity.rangeOverflow).to.equal(false);
    });

    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-number"]',
      '701'
    ).then((elem) => {
      expect(elem[0].validity.rangeUnderflow).to.equal(false);
      expect(elem[0].validity.rangeOverflow).to.equal(true);
    });

    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-number"]',
      '603'
    ).then((elem) => {
      expect(elem[0].validity.rangeUnderflow).to.equal(false);
      expect(elem[0].validity.rangeOverflow).to.equal(false);
      expect(elem[0].validity.stepMismatch).to.equal(true);
    });

    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-number"]',
      '444.44'
    ).then((elem) => {
      expect(elem[0].validity.rangeUnderflow).to.equal(false);
      expect(elem[0].validity.rangeOverflow).to.equal(false);
      expect(elem[0].validity.stepMismatch).to.equal(true);
    });
  });

  it('sets mins and maxes (decimal)', () => {
    cy.get('.formatChoices:first').select(
      'Schema: Zodexy schema instance mins and maxes 3'
    );
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'number'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-number"]',
      '400'
    ).then((elem) => {
      expect(elem[0].validity.rangeUnderflow).to.equal(true);
      expect(elem[0].validity.rangeOverflow).to.equal(false);
    });

    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-number"]',
      '400.1'
    ).then((elem) => {
      expect(elem[0].validity.rangeUnderflow).to.equal(false);
      expect(elem[0].validity.rangeOverflow).to.equal(false);
    });

    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-number"]',
      '700'
    ).then((elem) => {
      expect(elem[0].validity.rangeUnderflow).to.equal(false);
      expect(elem[0].validity.rangeOverflow).to.equal(true);
    });

    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-number"]',
      '699.9'
    ).then((elem) => {
      expect(elem[0].validity.rangeUnderflow).to.equal(false);
      expect(elem[0].validity.rangeOverflow).to.equal(false);
    });

    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-number"]',
      '603'
    ).then((elem) => {
      expect(elem[0].validity.rangeUnderflow).to.equal(false);
      expect(elem[0].validity.rangeOverflow).to.equal(false);
    });
  });
});
