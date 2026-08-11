describe('nativeEnum spec (schemas)', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-schema-instrumented.html', {
      onBeforeLoad (win) {
        cy.stub(win.console, 'log').as('consoleLog');
      }
    });
  });

  it('views UI', function () {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 8');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'Native enum (A native enum)'
    );

    // First try setting bad value
    cy.get('#initializeWithBadNativeEnumValue').click();

    cy.clearTypeAndBlur(sel + '.nativeEnumKey', '0');

    cy.get(sel + '.nativeEnumKey').should(($input) => {
      expect(/** @type {HTMLInputElement} */ (
        $input[0]
      ).checkValidity()).to.equal(false);
    });

    cy.clearTypeAndBlur(sel + '.nativeEnumKey', 'def');

    cy.get(sel + '.nativeEnumKey').should(($input) => {
      expect(/** @type {HTMLInputElement} */ (
        $input[0]
      ).checkValidity()).to.equal(true);
    });

    cy.get('button#viewUI').click();

    cy.get(
      '#viewUIResults span[data-type="nativeEnum"]'
    ).should(($elem) => {
      expect($elem.text()).to.equal('ghi');
      expect($elem.attr('title')).to.equal('A native enum');
    });
  });

  it('views UI (without description)', function () {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 9');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'Native enum'
    );
    cy.clearTypeAndBlur(sel + '.nativeEnumKey', '0');

    cy.get(sel + '.nativeEnumKey').should(($input) => {
      expect(/** @type {HTMLInputElement} */ (
        $input[0]
      ).checkValidity()).to.equal(false);
    });

    cy.clearTypeAndBlur(sel + '.nativeEnumKey', 'def');

    cy.get(sel + '.nativeEnumKey').should(($input) => {
      expect(/** @type {HTMLInputElement} */ (
        $input[0]
      ).checkValidity()).to.equal(true);
    });

    cy.get('button#viewUI').click();

    cy.get(
      '#viewUIResults span[data-type="nativeEnum"]'
    ).should(($elem) => {
      expect($elem.text()).to.equal('ghi');
      expect($elem.attr('title')).to.equal('(a native enum)');
    });
  });

  it('gets value', function () {
    cy.clearTypeAndBlur('#getValueForString', 'nativeEnum("abc")');
    cy.get('@consoleLog').should('be.calledWith', 0);
  });

  it('gets value (with number key)', function () {
    cy.clearTypeAndBlur('#getValueForString', 'nativeEnum(0)');
    cy.get('@consoleLog').should('be.calledWith', 'abc');
  });
});
