describe('SpecialRealNumber spec', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-instrumented.html', {
      onBeforeLoad (win) {
        cy.stub(win.console, 'log').as('consoleLog');
      }
    });
  });
  it('creates form control', () => {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + '.formatChoices').select('indexedDBKey');
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'SpecialRealNumber'
    );
    cy.get('select[name="demo-keypath-not-expected-SpecialRealNumber"]').should(
      'exist'
    );
  });

  it('gets type', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + '.formatChoices').select('indexedDBKey');
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'SpecialRealNumber'
    );
    cy.get(
      sel + 'select[name="demo-keypath-not-expected-SpecialRealNumber"]'
    ).select('-Infinity');

    cy.get('button#getType').click();
    cy.get('dialog[open]').should('include.text', 'SpecialRealNumber');
  });

  it('is valid', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + '.formatChoices').select('indexedDBKey');
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'SpecialRealNumber'
    );
    cy.get(
      sel + 'select[name="demo-keypath-not-expected-SpecialRealNumber"]'
    ).select('-Infinity');
    cy.get('button#isValid').click();
    cy.get('dialog[open]').should('include.text', 'true');
  });

  it('logs value', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + '.formatChoices').select('indexedDBKey');
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'SpecialRealNumber'
    );
    cy.get(
      sel + 'select[name="demo-keypath-not-expected-SpecialRealNumber"]'
    ).select('-Infinity');

    cy.get('button#logValue').click();
    cy.get('@consoleLog').should('be.calledWith', -Infinity);
  });

  it('views UI', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + '.formatChoices').select('indexedDBKey');
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'SpecialRealNumber'
    );
    cy.get(
      sel + 'select[name="demo-keypath-not-expected-SpecialRealNumber"]'
    ).select('-Infinity');

    cy.get('#useIndexedDBKey').click();
    cy.get('button#viewUI').click();
    cy.get('#viewUIResults i[data-type="SpecialRealNumber"]').should('exist');
    cy.get('#viewUIResults i[data-type="SpecialRealNumber"]').should(
      'contain', '-Infinity'
    );
  });

  it('views UI (-0)', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + '.formatChoices').select('indexedDBKey');
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'SpecialRealNumber'
    );
    cy.get(
      sel + 'select[name="demo-keypath-not-expected-SpecialRealNumber"]'
    ).select('-0');

    cy.get('#useIndexedDBKey').click();
    cy.get('button#viewUI').click();
    cy.get('#viewUIResults i[data-type="SpecialRealNumber"]').should('exist');
    cy.get('#viewUIResults i[data-type="SpecialRealNumber"]').should(
      'contain', '-0'
    );
  });

  it('gets value', function () {
    cy.get('#useIndexedDBKey').click();
    cy.clearTypeAndBlur('#getValueForString', '-0');
    cy.get('@consoleLog').should('be.calledWith', -0);
  });

  it('gets value (Infinity)', function () {
    cy.get('#useIndexedDBKey').click();
    cy.clearTypeAndBlur('#getValueForString', 'Infinity');
    cy.get('@consoleLog').should('be.calledWith', Infinity);
  });

  it('gets value (-Infinity)', function () {
    cy.get('#useIndexedDBKey').click();
    cy.clearTypeAndBlur('#getValueForString', '-Infinity');
    cy.get('@consoleLog').should('be.calledWith', -Infinity);
  });

  // For the "Type choices with initial value set" control
  it('gets a value set onload', function () {
    cy.get(
      'fieldset:nth-of-type(1) ' +
      'select[name="demo-type-choices-only-initial-value-SpecialRealNumber"]'
    ).find(':selected').should('have.text', '-0');

    cy.get(
      'fieldset:nth-of-type(2) ' +
      'select[name="demo-type-choices-only-initial-value-SpecialRealNumber"]'
    ).find(':selected').should('have.text', '-Infinity');
  });

  it(
    'checks that valid values were set (using `keySelectClass`)',
    function () {
      cy.get('#validValuesSet').click();
      cy.get('dialog[open]').should('include.text', 'true');
    }
  );
});

describe('SpecialRealNumber spec (schemas)', () => {
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
      'SpecialRealNumber'
    );
    cy.get(
      sel + 'select[name="demo-keypath-not-expected-SpecialRealNumber"]'
    ).select('-Infinity');

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults i[data-type="SpecialRealNumber"]').should('exist');
    cy.get('#viewUIResults i[data-type="SpecialRealNumber"]').should(
      'contain', '-Infinity'
    );
    cy.get('#viewUIResults i[data-type="SpecialRealNumber"]').then((elem) => {
      expect(elem.attr('title')).to.equal('A special real number');
    });
  });

  it('views UI (-0)', function () {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 2');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'SpecialRealNumber'
    );
    cy.get(
      sel + 'select[name="demo-keypath-not-expected-SpecialRealNumber"]'
    ).select('-0');

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults i[data-type="SpecialRealNumber"]').should('exist');
    cy.get('#viewUIResults i[data-type="SpecialRealNumber"]').should(
      'contain', '-0'
    );
    cy.get('#viewUIResults i[data-type="SpecialRealNumber"]').then((elem) => {
      expect(elem.attr('title')).to.equal('A special real number');
    });
  });
});
