describe('search: form validity', () => {
  const sel = '#section-allTypes ';

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
  });

  it('is invalid on creation (the object itself needs an active row, and its required property starts opted out), valid once one is active, invalid again once undone', () => {
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Invalid');

    const requiredRowSel = sel +
      'jsoe-search-required-property[data-property-name="requiredString"] ';
    cy.get(requiredRowSel + 'input.jsoeSearchCheckbox').check();
    cy.get(sel + '.checkValidityButton').click();
    // Opted in (satisfies the object's own "at least one active row"), but
    // its own re-enabled Value input is still empty and `required`.
    cy.get(sel + '.validityResult').should('have.text', 'Invalid');

    cy.get(requiredRowSel + 'input[name$="-value"]').type('anything');
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Valid');

    cy.get(requiredRowSel + 'input.jsoeSearchCheckbox').uncheck();
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Invalid');
  });

  it('goes invalid when an added literal/regex property is left empty, valid once filled, invalid again once removed (the object itself needs an active row)', () => {
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
    // Back to zero active rows.
    cy.get(sel + '.validityResult').should('have.text', 'Invalid');
  });

  it('is invalid the moment a range widget exists, before any interaction, and valid once given a bound', () => {
    cy.get(sel + 'select.addPropertySelect').select('number');
    cy.get(sel + 'button').contains('Add').click();
    // Neither input has been touched yet - `connectedCallback` (not just the
    // `input`/`change` handlers) must be the thing setting the initial
    // custom validity, or this would wrongly read "Valid".
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Invalid');

    const numberSel = sel + 'jsoe-search-number[data-search-path="#/number"] ';
    cy.get(numberSel + 'input.jsoeSearchRangeGte--').type('10');
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

  it('is invalid the moment the bigint range widget exists, before any interaction', () => {
    cy.get(sel + 'select.addPropertySelect').select('bigint');
    cy.get(sel + 'button').contains('Add').click();
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Invalid');

    const bigintSel = sel + 'jsoe-search-bigint[data-search-path="#/bigint"] ';
    cy.get(bigintSel + 'input.jsoeSearchRangeGte--').type('10');
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Valid');
  });

  it('is invalid on load (no interaction), and invalid when a date range\'s end is before its start, valid once fixed', () => {
    const dateSel = '#section-date ';
    // The date demo section has no opt-out (unlike a required object
    // property's checkbox) - it's a standalone `buildSearchChoices` root, so
    // its own range starts invalid the moment the page loads.
    cy.get(dateSel + '.checkValidityButton').click();
    cy.get(dateSel + '.validityResult').should('have.text', 'Invalid');

    cy.get(dateSel + 'input[name$="-gte"]').type('2025-06-01T00:00');
    cy.get(dateSel + 'input[name$="-lte"]').type('2024-06-01T00:00');
    cy.get(dateSel + '.checkValidityButton').click();
    cy.get(dateSel + '.validityResult').should('have.text', 'Invalid');

    cy.get(dateSel + 'input[name$="-lte"]').clear();
    cy.get(dateSel + 'input[name$="-lte"]').type('2026-06-01T00:00');
    cy.get(dateSel + '.checkValidityButton').click();
    cy.get(dateSel + '.validityResult').should('have.text', 'Valid');
  });

  it('is valid when "Valid date" is chosen even with an empty range, invalid again back at "(any)"', () => {
    const dateSel = '#section-date ';
    cy.get(dateSel + 'select[name$="-valid"]').select('true');
    cy.get(dateSel + '.checkValidityButton').click();
    cy.get(dateSel + '.validityResult').should('have.text', 'Valid');

    cy.get(dateSel + 'select[name$="-valid"]').select('');
    cy.get(dateSel + '.checkValidityButton').click();
    cy.get(dateSel + '.validityResult').should('have.text', 'Invalid');
  });

  it('is valid when "Has property" is chosen even with the nested value left empty, still combinable, invalid again back at "(any)"', () => {
    cy.get(sel + 'select.addPropertySelect').select('string');
    cy.get(sel + 'button').contains('Add').click();
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Invalid');

    cy.get(sel + 'select[name$="-hasProperty-string"]').select('true');
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Valid');

    const valueSel = sel + 'jsoe-search-string[data-search-path="#/string"] input[name$="-value"]';
    cy.get(valueSel).type('abc');
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Valid');

    cy.get(valueSel).clear();
    cy.get(sel + 'select[name$="-hasProperty-string"]').select('');
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Invalid');
  });

  it('is valid when "Has property" is chosen for a range-typed (number) property, even with an empty range', () => {
    cy.get(sel + 'select.addPropertySelect').select('number');
    cy.get(sel + 'button').contains('Add').click();
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Invalid');

    cy.get(sel + 'select[name$="-hasProperty-number"]').select('true');
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Valid');

    // Still combinable with an optional range constraint on top.
    const numberSel = sel + 'jsoe-search-number[data-search-path="#/number"] ';
    cy.get(numberSel + 'input.jsoeSearchRangeGte--').type('5');
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Valid');

    cy.get(numberSel + 'input.jsoeSearchRangeGte--').clear();
    cy.get(sel + 'select[name$="-hasProperty-number"]').select('');
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Invalid');
  });

  it('is valid when "Has property" is chosen for a date-typed property, even with an empty range', () => {
    cy.get(sel + 'select.addPropertySelect').select('date');
    cy.get(sel + 'button').contains('Add').click();
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Invalid');

    cy.get(sel + 'select[name$="-hasProperty-date"]').select('true');
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Valid');

    cy.get(sel + 'select[name$="-hasProperty-date"]').select('');
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Invalid');
  });

  it('is invalid with neither length/size nor an element match chosen, valid with either alone', () => {
    cy.get(sel + 'select.addPropertySelect').select('array');
    cy.get(sel + 'button').contains('Add').click();
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Invalid');

    const arraySel = sel + 'jsoe-search-array[data-search-path="#/array"] ';
    cy.get(arraySel + 'input[name$="-size"]').type('3');
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Valid');

    cy.get(arraySel + 'input[name$="-size"]').clear();
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Invalid');

    // Checking the element opt-in satisfies the array's own "at least one"
    // sentinel, but the now-enabled nested number's own range immediately
    // becomes constraint-validation-eligible again too (its own "at least
    // one bound" custom validity was already set while merely disabled),
    // so it also needs a bound.
    cy.get(arraySel + 'input.jsoeSearchOptIn--').check();
    cy.get(arraySel + 'jsoe-search-number input[name$="-gte"]').type('1');
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Valid');
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
