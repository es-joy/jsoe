describe('Non-editable (Resurrectable) spec', () => {
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
      'resurrectable'
    );
    cy.get('button[name="demo-keypath-not-expected-resurrectable"]').should(
      'exist'
    );

    // No-op for coverage
    cy.get(sel + 'div[data-type="resurrectable"] > a').click();

    cy.get('button[name="demo-keypath-not-expected-resurrectable"]').click();

    cy.get('@consoleLog').should('be.calledWith', undefined);
  });

  it('gets type', function (done) {
    cy.on('window:alert', (t) => {
      expect(t).to.eq('resurrectable');
      done();
    });
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'resurrectable'
    );

    cy.get('button#getType').click();
  });

  it('is valid (false)', function (done) {
    cy.on('window:alert', (t) => {
      expect(t).to.eq(false);
      done();
    });
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'resurrectable'
    );

    cy.get('button#isValid').click();
  });

  it('is valid (true)', function (done) {
    cy.on('window:alert', (t) => {
      expect(t).to.eq(true);
      done();
    });
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'resurrectable'
    );

    cy.get('#initializeWithNoneditableValue').click();

    cy.get('button#isValid').click();
  });

  it('logs value', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'resurrectable'
    );

    cy.get('button#logValue').click();
    cy.get('@consoleLog').should('be.calledWith', undefined);
  });

  it('views UI', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'resurrectable'
    );
    cy.get('#initializeWithNoneditableValue').click();

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults div[data-type="resurrectable"]').should('exist');
    cy.get(
      '#viewUIResults div[data-type="resurrectable"]'
    ).should('contain', 'Non-editable');

    // eslint-disable-next-line cypress/no-unnecessary-waiting -- Wait for timeout
    cy.wait(3000);
    cy.get(
      sel + 'div[data-type="resurrectable"]'
    ).should('contain', '(None)');
  });

  // For the "Type choices with initial value set" control
  it('gets a value set onload', function () {
    cy.get(
      'button[name="demo-type-choices-only-initial-value-resurrectable"]'
    ).should(($button) => {
      expect(
        /** @type {HTMLButtonElement & {$value: any}} */ ($button[0]).$value
      ).to.be.a('NonEditableType');
    });
  });
});

describe('Non-Editable spec (schemas)', () => {
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
      'resurrectable'
    );
    // cy.get('#initializeWithNoneditableValue').click();

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults div[data-type="resurrectable"]').should('exist');
    cy.get(
      '#viewUIResults div[data-type="resurrectable"]'
    ).should('contain', 'Non-editable');

    cy.get(
      '#viewUIResults div[data-type="resurrectable"] > .emphasis'
    ).then((elem) => {
      expect(elem.attr('title')).to.equal('(a non-editable Undefined)');
    });
  });
});
