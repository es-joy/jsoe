describe('Demo spec', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-instrumented.html', {
      onBeforeLoad (win) {
        cy.stub(win.console, 'log').as('consoleLog');
      }
    });
  });

  it('No-op if re-selecting "Choose a type"', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'true'
    );

    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      ''
    );
  });

  it('Invalid if type missing', function (done) {
    cy.on('window:alert', (t) => {
      expect(t).to.eq('false');
      done();
    });
    cy.get('#validateInitialType').click();
  });

  it('Initializes a form control with a value', () => {
    cy.get('#initializeWithValue').click();
    cy.get('#formatAndTypeChoices input[type=number]').should(($input) => {
      expect($input.val()).to.equal('42');
    });
  });

  it('Initializes a form control with a value (type choices only)', () => {
    cy.get('#typeChoicesOnly-initializeWithValue').click();
    cy.get('#typeChoicesOnly input[type=number]').should(($input) => {
      expect($input.val()).to.equal('42');
    });
  });


  it('gets type', function (done) {
    cy.on('window:alert', (t) => {
      expect(t).to.eq('bigint');
      done();
    });
    const sel = '#typeChoicesOnly ';
    cy.get(sel + 'select.typeChoices-demo-type-choices-only').select(
      'bigint'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-type-choices-only-bigint"]',
      '12345'
    );

    cy.get('button#typeChoicesOnly-getType').click();
  });

  it('is valid', function (done) {
    cy.on('window:alert', (t) => {
      expect(t).to.eq('true');
      done();
    });
    const sel = '#typeChoicesOnly ';
    cy.get(sel + 'select.typeChoices-demo-type-choices-only').select(
      'bigint'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-type-choices-only-bigint"]',
      '12345'
    );
    cy.get('button#typeChoicesOnly-isValid').click();
  });

  it('logs value', function () {
    const sel = '#typeChoicesOnly ';
    cy.get(sel + 'select.typeChoices-demo-type-choices-only').select(
      'bigint'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-type-choices-only-bigint"]',
      '12345'
    );

    cy.get('button#typeChoicesOnly-logValue').click();
    cy.get('@consoleLog').should('be.calledWith', 12345n);
  });

  it('gets value from root ancestor', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'true'
    );
    cy.get('#getValueFromRootAncestor').click();
    cy.get('@consoleLog').should('be.calledWith', true);
  });

  it('shows form control from root ancestor', function () {
    const sel = '#formatAndTypeChoices ';

    cy.get(
      sel + 'select.typeChoices-demo-keypath-not-expected'
    ).select('arrayNonindexKeys');

    cy.get('#showFormControlFromRootAncestor').click();

    cy.get(
      '#formatAndTypeChoices > .typesHolder > .typeContainer > ' +
      'div[data-type="arrayNonindexKeys"] > button'
    ).should(($button) => {
      expect($button[0].style.backgroundColor).to.equal('red');
    });

    // eslint-disable-next-line cypress/no-unnecessary-waiting -- Needed
    cy.wait(3000);

    cy.get(
      '#formatAndTypeChoices > .typesHolder > .typeContainer > ' +
      'div[data-type="arrayNonindexKeys"] > button'
    ).should(($button) => {
      expect($button[0].style.backgroundColor).to.not.equal('red');
    });
  });
});
