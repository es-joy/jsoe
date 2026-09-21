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

  it('is valid for a map with just a size, without choosing key or value matches', () => {
    cy.get(sel + 'select.addPropertySelect').select('map');
    cy.get(sel + 'button').contains('Add').click();
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Invalid');

    const mapSel = sel + 'jsoe-search-map[data-search-path="#/map"] ';
    cy.get(mapSel + 'input[name$="-size"]').type('4');
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Valid');

    cy.get(mapSel + 'input[name$="-size"]').clear();
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Invalid');
  });

  it('is invalid with no position/rest/length chosen for a tuple-with-rest, valid with any one alone', () => {
    const tupleSel = '#section-tupleRest ';
    cy.get(tupleSel + '.checkValidityButton').click();
    cy.get(tupleSel + '.validityResult').should('have.text', 'Invalid');

    cy.get(tupleSel + 'input.jsoeSearchOptIn--0').check();
    cy.get(tupleSel + '[data-search-path="#/0"] input[name$="-value"]').type('abc');
    cy.get(tupleSel + '.checkValidityButton').click();
    cy.get(tupleSel + '.validityResult').should('have.text', 'Valid');

    cy.get(tupleSel + 'input.jsoeSearchOptIn--0').uncheck();
    cy.get(tupleSel + '.checkValidityButton').click();
    cy.get(tupleSel + '.validityResult').should('have.text', 'Invalid');

    cy.get(tupleSel + 'input[name$="-size"]').type('5');
    cy.get(tupleSel + '.checkValidityButton').click();
    cy.get(tupleSel + '.validityResult').should('have.text', 'Valid');
  });

  it('is valid when "Has property" is chosen for an array-typed property, even with neither length/size nor an element match', () => {
    cy.get(sel + 'select.addPropertySelect').select('array');
    cy.get(sel + 'button').contains('Add').click();
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Invalid');

    cy.get(sel + 'select[name$="-hasProperty-array"]').select('true');
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Valid');

    cy.get(sel + 'select[name$="-hasProperty-array"]').select('');
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Invalid');
  });

  it('is valid when "Has property" is chosen for an object-typed property, even with no property added inside it', () => {
    cy.get(sel + 'select.addPropertySelect').select('object');
    cy.get(sel + 'button').contains('Add').click();
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Invalid');

    cy.get(sel + 'select[name$="-hasProperty-object"]').select('true');
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Valid');

    cy.get(sel + 'select[name$="-hasProperty-object"]').select('');
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Invalid');
  });

  it('is valid when "Has property" is chosen for a file-typed property, but opting into "Name" still requires its own Value', () => {
    cy.get(sel + 'select.addPropertySelect').select('file');
    cy.get(sel + 'button').contains('Add').click();
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Invalid');

    cy.get(sel + 'select[name$="-hasProperty-file"]').select('true');
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Valid');

    const fileSel = sel + 'jsoe-search-file[data-search-path="#/file"] ';
    cy.get(fileSel + 'input.jsoeSearchOptIn--name').check();
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Invalid');

    cy.get(fileSel + 'input.jsoeSearchValue--name').type('report.pdf');
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Valid');

    cy.get(fileSel + 'input.jsoeSearchOptIn--name').uncheck();
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Valid');
  });

  it('is valid when "Has property" is chosen for a domrect-typed property, but opting into a dimension still requires its own range bound', () => {
    cy.get(sel + 'select.addPropertySelect').select('domrect');
    cy.get(sel + 'button').contains('Add').click();
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Invalid');

    cy.get(sel + 'select[name$="-hasProperty-domrect"]').select('true');
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Valid');

    const domrectSel = sel + 'jsoe-search-domrect[data-search-path="#/domrect"] ';
    cy.get(domrectSel + 'input.jsoeSearchOptIn--x').check();
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Invalid');

    cy.get(domrectSel + 'input.jsoeSearchRangeGte--x').type('5');
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Valid');

    cy.get(domrectSel + 'input.jsoeSearchRangeGte--x').clear();
    cy.get(domrectSel + 'input.jsoeSearchOptIn--x').uncheck();
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Valid');
  });

  it('is valid when "Has property" is chosen for a blobHTML-typed property, and stays valid across a mode switch', () => {
    cy.get(sel + 'select.addPropertySelect').select('blobHTML');
    cy.get(sel + 'button').contains('Add').click();
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Invalid');

    cy.get(sel + 'select[name$="-hasProperty-blobHTML"]').select('true');
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Valid');

    const blobHTMLSel = sel + 'jsoe-search-blob-html[data-search-path="#/blobHTML"] ';
    cy.get(blobHTMLSel + 'select.jsoeSearchBlobHTMLMode').select('fullText');
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Valid');

    cy.get(sel + 'select[name$="-hasProperty-blobHTML"]').select('');
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Invalid');
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

  it('rejects a syntactically invalid CSS selector, XPath expression, and regex for blobHTML', () => {
    cy.get(sel + 'select.addPropertySelect').select('blobHTML');
    cy.get(sel + 'button').contains('Add').click();

    // "CSS selector" is the default mode.
    cy.get(sel + 'input.jsoeSearchBlobHTMLValue').type('[[[');
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Invalid');
    cy.get(sel + 'input.jsoeSearchBlobHTMLValue').clear();
    cy.get(sel + 'input.jsoeSearchBlobHTMLValue').type('.title');
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Valid');

    cy.get(sel + 'select.jsoeSearchBlobHTMLMode').select('xpath');
    cy.get(sel + 'input.jsoeSearchBlobHTMLValue').clear();
    cy.get(sel + 'input.jsoeSearchBlobHTMLValue').type('///');
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Invalid');
    cy.get(sel + 'input.jsoeSearchBlobHTMLValue').clear();
    cy.get(sel + 'input.jsoeSearchBlobHTMLValue').type('//div');
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Valid');

    cy.get(sel + 'select.jsoeSearchBlobHTMLMode').select('rawHTMLRegex');
    cy.get(sel + 'input.jsoeSearchBlobHTMLValue').clear();
    cy.get(sel + 'input.jsoeSearchBlobHTMLValue').type('[[[');
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Invalid');
    cy.get(sel + 'input.jsoeSearchBlobHTMLValue').clear();
    cy.get(sel + 'input.jsoeSearchBlobHTMLValue').type('^abc$');
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Valid');
  });

  it('rejects a regex that is only invalid under the currently-selected blobHTML flags', () => {
    cy.get(sel + 'select.addPropertySelect').select('blobHTML');
    cy.get(sel + 'button').contains('Add').click();

    cy.get(sel + 'select.jsoeSearchBlobHTMLMode').select('rawHTMLRegex');
    cy.get(sel + 'input.jsoeSearchBlobHTMLValue').type(
      String.raw`\p{Foo}`, {parseSpecialCharSequences: false}
    );
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Valid');

    // `\p{Foo}` is just literal text without the `u` flag, but becomes an
    // (here, unrecognized) Unicode property escape once `u` is chosen.
    cy.get(sel + 'select.jsoeSearchBlobHTMLFlags').select(['u']);
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Invalid');
  });

  it('rejects a syntactically invalid regex for string\'s "Matches regex"', () => {
    cy.get(sel + 'select.addPropertySelect').select('string');
    cy.get(sel + 'button').contains('Add').click();

    const propSel = sel + '[data-search-path="#/string"] ';
    cy.get(propSel + 'select[name$="-mode"]').select('regex');
    cy.get(propSel + 'input[name$="-value"]').type('[[[');
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Invalid');

    cy.get(propSel + 'input[name$="-value"]').clear();
    cy.get(propSel + 'input[name$="-value"]').type('^abc$');
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Valid');
  });

  it('rejects a syntactically invalid regex for regexp\'s "Matches regex" source match', () => {
    cy.get(sel + 'select.addPropertySelect').select('regexp');
    cy.get(sel + 'button').contains('Add').click();

    const propSel = sel + '[data-search-path="#/regexp"] ';
    cy.get(propSel + 'select.jsoeSearchMode--').select('regex');
    cy.get(propSel + 'input[name$="-value"]').type('[[[');
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Invalid');

    cy.get(propSel + 'input[name$="-value"]').clear();
    cy.get(propSel + 'input[name$="-value"]').type('^abc$');
    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Valid');
  });

  it(
    'suppresses the native form submit (e.g. from pressing Enter in a ' +
      'value input) instead of navigating away',
    () => {
      cy.get(sel + 'select.addPropertySelect').select('string');
      cy.get(sel + 'button').contains('Add').click();

      const propSel = sel + '[data-search-path="#/string"] ';
      cy.get(propSel + 'input[name$="-value"]').type('abc');
      // A real, unprevented submit would navigate the page away (there is
      //   no `action`, so it re-requests the current URL), wiping this
      //   typed value; asserting the value survives is how a suppressed
      //   submit is told apart from one that merely didn't happen.
      cy.get(sel + 'form.searchChoicesContainer').submit();
      cy.get(propSel + 'input[name$="-value"]').should('have.value', 'abc');
    }
  );
});
