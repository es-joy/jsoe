describe('search: form validity', () => {
  const sel = '#section-allTypes ';

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
  });

  it('is valid on creation (a required property starts opted out of search), invalid once opted in and left empty, valid once filled', () => {
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Valid');

    const requiredRowSel = sel +
      'jsoe-search-required-property[data-property-name="requiredString"] ';
    cy.get(requiredRowSel + 'input.jsoeSearchCheckbox').check();
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Invalid');

    cy.get(requiredRowSel + 'input[name$="-value"]').type('anything');
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Valid');

    cy.get(requiredRowSel + 'input.jsoeSearchCheckbox').uncheck();
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Valid');
  });

  it('goes invalid when an added literal/regex property is left empty, valid once filled or removed', () => {
    cy.get(sel + 'select.addPropertySelect').select('string');
    cy.get(sel + 'button').contains('Add').click();
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Invalid');

    const addedSel = sel + 'jsoe-search-string[data-search-path="#/string"] input[name$="-value"]';
    cy.get(addedSel).type('abc');
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Valid');

    cy.get(addedSel).clear();
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Invalid');

    cy.get(
      sel + 'jsoe-search-has-property[data-property-name="string"] button.removePropertyButton'
    ).click();
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Valid');
  });

  it('goes invalid when a range\'s end is before its start, valid once fixed', () => {
    cy.get(sel + 'select.addPropertySelect').select('number');
    cy.get(sel + 'button').contains('Add').click();
    const numberSel = sel + 'jsoe-search-number[data-search-path="#/number"] ';
    cy.get(numberSel + 'input.jsoeSearchRangeGte--').type('10');
    cy.get(numberSel + 'input.jsoeSearchRangeLte--').type('5');
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Invalid');

    cy.get(numberSel + 'input.jsoeSearchRangeLte--').clear();
    cy.get(numberSel + 'input.jsoeSearchRangeLte--').type('20');
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Valid');
  });

  it('goes invalid when a date range\'s end is before its start, valid once fixed', () => {
    const dateSel = '#section-date ';
    cy.get(dateSel + 'input[name$="-gte"]').type('2025-06-01T00:00');
    cy.get(dateSel + 'input[name$="-lte"]').type('2024-06-01T00:00');
    cy.get(dateSel + '.checkValidityButton').click();
    cy.get(dateSel + '.validityResult').should('have.text', 'Invalid');

    cy.get(dateSel + 'input[name$="-lte"]').clear();
    cy.get(dateSel + 'input[name$="-lte"]').type('2026-06-01T00:00');
    cy.get(dateSel + '.checkValidityButton').click();
    cy.get(dateSel + '.validityResult').should('have.text', 'Valid');
  });

  it('requires the currently-visible blobHTML value control only, valid once filled', () => {
    cy.get(sel + 'select.addPropertySelect').select('blobHTML');
    cy.get(sel + 'button').contains('Add').click();
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Invalid');

    cy.get(sel + 'input.jsoeSearchBlobHTMLValue').type('.title');
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Valid');

    // Switching to "Full text search" swaps the required control to the
    // (still-empty) textarea, so the form goes invalid again despite the
    // input from a moment ago still holding a value.
    cy.get(sel + 'select.jsoeSearchBlobHTMLMode').select('fullText');
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Invalid');

    cy.get(sel + 'textarea.jsoeSearchBlobHTMLValue').type('welcome');
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Valid');
  });
});
