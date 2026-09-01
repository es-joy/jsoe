const typeChoices =
  '#formatAndTypeChoices select.typeChoices-demo-keypath-not-expected';

describe('schema constraints use runtime type editors', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-schema-instrumented.html', {
      onBeforeLoad (win) {
        cy.stub(win.console, 'log').as('consoleLog');
      }
    });
    cy.get('.formatChoices:first').select(
      'Schema: Zodexy schema instance 2'
    );
  });

  it('uses a fixed boolean editor for a boolean literal', function () {
    cy.get(typeChoices).select('Boolean (Literal boolean)');
    cy.get('#formatAndTypeChoices [data-type="boolean"] input:checked').
      should('have.value', 'false');
    cy.get('button#getType').click();
    cy.get('dialog[open]').should('include.text', 'boolean');
  });

  it('uses a number choice for a number literal', () => {
    cy.get(typeChoices).select('Number (Literal number)');
    cy.get(
      '#formatAndTypeChoices ' +
      'select[name="demo-keypath-not-expected-number"]'
    ).should('have.value', '135');
    cy.get('button#logValue').click();
    cy.get('@consoleLog').should('be.calledWith', 135);
  });

  it('uses a string choice for a string literal', () => {
    cy.get(typeChoices).select('String (Literal string)');
    cy.get(
      '#formatAndTypeChoices ' +
      'select[name="demo-keypath-not-expected-string"]'
    ).should('have.value', 'abcde');
    cy.get('button#viewUI').click();
    cy.get('#viewUIResults span[data-type="string"]').should(($span) => {
      expect($span.text()).to.equal('abcde');
      expect($span.attr('title')).to.equal('Literal string');
    });
  });

  it('uses a BigInt choice for a BigInt literal', () => {
    cy.get(typeChoices).select('BigInt (Literal BigInt)');
    cy.get(
      '#formatAndTypeChoices ' +
      'select[name="demo-keypath-not-expected-bigint"]'
    ).should('have.value', '123');
    cy.get('button#logValue').click();
    cy.get('@consoleLog').should('be.calledWith', 123n);
  });

  it('maps null and undefined literals to their runtime types', () => {
    cy.get(typeChoices).select('Null (Literal null)');
    cy.get('#formatAndTypeChoices [data-type="null"]').should('exist');
    cy.get(typeChoices).select('Explicit undefined (Literal undefined)');
    cy.get('#formatAndTypeChoices [data-type="undef"]').should('exist');
  });

  it('uses primitive choices for string and numeric enum values', () => {
    cy.get(typeChoices).select('String (An enum)');
    cy.get(
      '#formatAndTypeChoices ' +
      'select[name="demo-keypath-not-expected-string"]'
    ).should('have.value', 'def').select('ghi');
    cy.get('button#logValue').click();
    cy.get('@consoleLog').should('be.calledWith', 'ghi');
  });

  it('maps void to explicit undefined', function () {
    cy.get(typeChoices).select('Explicit undefined (A void)');
    cy.get('#formatAndTypeChoices [data-type="undef"]').should('exist');
    cy.get('button#getType').click();
    cy.get('dialog[open]').should('include.text', 'undef');
  });
});

describe('catch schemas expose their output types', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-schema-instrumented.html', {
      onBeforeLoad (win) {
        cy.stub(win.console, 'log').as('consoleLog');
      }
    });
    cy.get('.formatChoices:first').select(
      'Schema: Zodexy schema instance 10'
    );
  });

  it('edits and views a valid inner output as its runtime type', () => {
    cy.get(typeChoices).select('String (An overpassed string and A catch)');
    cy.clearTypeAndBlur(
      '#formatAndTypeChoices ' +
      'textarea[name="demo-keypath-not-expected-string"]',
      'xyz'
    );
    cy.get('button#logValue').click();
    cy.get('@consoleLog').should('be.calledWith', 'xyz');
    cy.get('button#viewUI').click();
    cy.get('#viewUIResults span[data-type="string"]').should(($span) => {
      expect($span.text()).to.equal('xyz');
      expect($span.attr('title')).to.equal(
        'An overpassed string and A catch'
      );
    });
  });

  it('exposes the fallback output as a constrained runtime value', () => {
    cy.get(typeChoices).select('String (A catch)');
    cy.get(
      '#formatAndTypeChoices ' +
      'select[name="demo-keypath-not-expected-string"]'
    ).should('have.value', 'abc');
    cy.get('button#logValue').click();
    cy.get('@consoleLog').should('be.calledWith', 'abc');
  });
});
