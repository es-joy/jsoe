describe('SpecialNumber spec', () => {
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
      'SpecialNumber'
    );
    cy.get('select[name="demo-keypath-not-expected-SpecialNumber"]').should(
      'exist'
    );
  });

  it('gets type', function (done) {
    cy.on('window:alert', (t) => {
      expect(t).to.eq('SpecialNumber');
      done();
    });
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'SpecialNumber'
    );
    cy.get(
      sel + 'select[name="demo-keypath-not-expected-SpecialNumber"]'
    ).select('NaN');

    cy.get('button#getType').click();
  });

  it('is valid', function (done) {
    cy.on('window:alert', (t) => {
      expect(t).to.eq(true);
      done();
    });
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'SpecialNumber'
    );
    cy.get(
      sel + 'select[name="demo-keypath-not-expected-SpecialNumber"]'
    ).select('NaN');
    cy.get('button#isValid').click();
  });

  it('logs value', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'SpecialNumber'
    );
    cy.get(
      sel + 'select[name="demo-keypath-not-expected-SpecialNumber"]'
    ).select('NaN');

    cy.get('button#logValue').click();
    cy.get('@consoleLog').should('be.calledWith', NaN);
  });

  it('views UI', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'SpecialNumber'
    );
    cy.get(
      sel + 'select[name="demo-keypath-not-expected-SpecialNumber"]'
    ).select('NaN');

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults i[data-type="SpecialNumber"]').should('exist');
    cy.get('#viewUIResults i[data-type="SpecialNumber"]').should(
      'contain', 'NaN'
    );
  });

  it('views UI (-0)', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'SpecialNumber'
    );
    cy.get(
      sel + 'select[name="demo-keypath-not-expected-SpecialNumber"]'
    ).select('-0');

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults i[data-type="SpecialNumber"]').should('exist');
    cy.get('#viewUIResults i[data-type="SpecialNumber"]').should(
      'contain', '-0'
    );
  });

  it('gets value', function () {
    cy.clearTypeAndBlur('#getValueForString', 'NaN');
    cy.get('@consoleLog').should('be.calledWith', NaN);
  });

  it('gets value (Infinity)', function () {
    cy.clearTypeAndBlur('#getValueForString', 'Infinity');
    cy.get('@consoleLog').should('be.calledWith', Infinity);
  });

  it('gets value (-Infinity)', function () {
    cy.clearTypeAndBlur('#getValueForString', '-Infinity');
    cy.get('@consoleLog').should('be.calledWith', -Infinity);
  });

  // For the "Type choices with initial value set" control
  it('gets a value set onload', function () {
    cy.get(
      'fieldset:nth-child(11) ' +
      'select[name="demo-type-choices-only-initial-value-SpecialNumber"]'
    ).find(':selected').should('have.text', 'NaN');

    cy.get(
      'fieldset:nth-child(12) ' +
      'select[name="demo-type-choices-only-initial-value-SpecialNumber"]'
    ).find(':selected').should('have.text', '-0');
  });
});
