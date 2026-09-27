describe('search: blobHTML spec', () => {
  const sel = '#section-allTypes ';

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
    cy.get(sel + 'select.addPropertySelect').select('blobHTML');
    cy.get(sel + 'button').contains('Add').click();
  });

  it('gets a blobHTML leaf for the CSS selector facet', () => {
    cy.get(sel + 'input.jsoeSearchOptIn--cssSelector').check();
    cy.get(sel + 'input.jsoeSearchBlobHTMLValue--cssSelector').type('.title');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and[0]).to.deep.equal({
        kind: 'blobHTML', path: '#/blobHTML', mode: 'cssSelector', value: '.title'
      });
    });
  });

  it('gets a blobHTML leaf for the full text search facet (a textarea)', () => {
    cy.get(sel + 'input.jsoeSearchOptIn--fullText').check();
    cy.get(sel + 'textarea.jsoeSearchBlobHTMLValue--fullText').type('welcome text');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and[0]).to.deep.equal({
        kind: 'blobHTML', path: '#/blobHTML', mode: 'fullText', value: 'welcome text'
      });
    });
  });

  it('allows flags for "Regex search of raw HTML", folded into $options', () => {
    cy.get(sel + 'input.jsoeSearchOptIn--rawHTMLRegex').check();
    cy.get(sel + 'input.jsoeSearchBlobHTMLValue--rawHTMLRegex').type('^<h1>');
    cy.get(sel + 'select.jsoeSearchBlobHTMLFlags--rawHTMLRegex').select(['i', 's']);
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and[0]).to.deep.equal({
        kind: 'blobHTML', path: '#/blobHTML', mode: 'rawHTMLRegex', value: '^<h1>',
        $options: 'is'
      });
    });
  });

  it('omits $options for a raw-HTML-regex facet with no flags selected', () => {
    cy.get(sel + 'input.jsoeSearchOptIn--rawHTMLRegex').check();
    cy.get(sel + 'input.jsoeSearchBlobHTMLValue--rawHTMLRegex').type('^<h1>');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and[0]).to.deep.equal({
        kind: 'blobHTML', path: '#/blobHTML', mode: 'rawHTMLRegex', value: '^<h1>'
      });
    });
  });

  it('contributes nothing from a facet opted into but left blank', () => {
    cy.get(sel + 'input.jsoeSearchOptIn--cssSelector').check();
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and).to.deep.equal([]);
    });
  });

  it('combines two opted-into facets under "All of" by default', () => {
    cy.get(sel + 'input.jsoeSearchOptIn--cssSelector').check();
    cy.get(sel + 'input.jsoeSearchBlobHTMLValue--cssSelector').type('.title');
    cy.get(sel + 'input.jsoeSearchOptIn--xpath').check();
    cy.get(sel + 'input.jsoeSearchBlobHTMLValue--xpath').type('//h1');

    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      const leaf = query.$and[0];
      expect(leaf.$and).to.have.length(2);
      expect(leaf.$and[0]).to.deep.equal({
        kind: 'blobHTML', path: '#/blobHTML', mode: 'cssSelector', value: '.title'
      });
      expect(leaf.$and[1]).to.deep.equal({
        kind: 'blobHTML', path: '#/blobHTML', mode: 'xpath', value: '//h1'
      });
    });
  });

  it('combines two opted-into facets under "Any of" once switched', () => {
    cy.get(sel + 'input.jsoeSearchOptIn--cssSelector').check();
    cy.get(sel + 'input.jsoeSearchBlobHTMLValue--cssSelector').type('.title');
    cy.get(sel + 'input.jsoeSearchOptIn--xpath').check();
    cy.get(sel + 'input.jsoeSearchBlobHTMLValue--xpath').type('//h1');
    cy.get(sel + 'jsoe-search-blob-html select.jsoeSearchCombinator--').select('or');

    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      const leaf = query.$and[0];
      expect(leaf.$or).to.have.length(2);
      expect(leaf.$or[0]).to.deep.equal({
        kind: 'blobHTML', path: '#/blobHTML', mode: 'cssSelector', value: '.title'
      });
      expect(leaf.$or[1]).to.deep.equal({
        kind: 'blobHTML', path: '#/blobHTML', mode: 'xpath', value: '//h1'
      });
    });
  });

  it('round-trips a single facet through "Edit raw", discarding an unopted-into one typed in meanwhile', () => {
    cy.get(sel + 'input.jsoeSearchOptIn--fullText').check();
    cy.get(sel + 'textarea.jsoeSearchBlobHTMLValue--fullText').type('welcome text');
    cy.get(sel + '.loadQueryButton').click();

    cy.get(sel + 'input.jsoeSearchOptIn--cssSelector').check();
    cy.get(sel + 'input.jsoeSearchBlobHTMLValue--cssSelector').type('.title');

    cy.get(sel + '.applyQueryButton').click();
    cy.get(sel + '.queryRawEditorError').should('have.text', '');
    cy.get(sel + 'input.jsoeSearchOptIn--fullText').should('be.checked');
    cy.get(sel + 'textarea.jsoeSearchBlobHTMLValue--fullText').should(
      'have.value', 'welcome text'
    );
    cy.get(sel + 'input.jsoeSearchOptIn--cssSelector').should('not.be.checked');
  });

  it('round-trips an OR-combined query of two facets through "Edit raw"', () => {
    cy.get(sel + 'input.jsoeSearchOptIn--cssSelector').check();
    cy.get(sel + 'input.jsoeSearchBlobHTMLValue--cssSelector').type('.title');
    cy.get(sel + 'input.jsoeSearchOptIn--xpath').check();
    cy.get(sel + 'input.jsoeSearchBlobHTMLValue--xpath').type('//h1');
    cy.get(sel + 'jsoe-search-blob-html select.jsoeSearchCombinator--').select('or');
    cy.get(sel + '.loadQueryButton').click();
    cy.get(sel + '.applyQueryButton').click();
    cy.get(sel + '.queryRawEditorError').should('have.text', '');

    cy.get(sel + 'jsoe-search-blob-html select.jsoeSearchCombinator--').should('have.value', 'or');
    cy.get(sel + 'input.jsoeSearchOptIn--cssSelector').should('be.checked');
    cy.get(sel + 'input.jsoeSearchBlobHTMLValue--cssSelector').should('have.value', '.title');
    cy.get(sel + 'input.jsoeSearchOptIn--xpath').should('be.checked');
    cy.get(sel + 'input.jsoeSearchBlobHTMLValue--xpath').should('have.value', '//h1');
  });

  it('clears an existing facet when applying a query with no match', () => {
    cy.get(sel + 'input.jsoeSearchOptIn--fullText').check();
    cy.get(sel + 'textarea.jsoeSearchBlobHTMLValue--fullText').type('welcome text');

    cy.get(sel + '.queryRawEditor .cm-content').type('{selectall}{{}$and: []{}}');
    cy.get(sel + '.applyQueryButton').click();
    cy.get(sel + '.queryRawEditorError').should('have.text', '');
    cy.get(sel + 'input.jsoeSearchOptIn--fullText').should('not.be.checked');
    cy.get(sel + 'textarea.jsoeSearchBlobHTMLValue--fullText').should('have.value', '');
  });

  it('contributes nothing with no facet opted into', () => {
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and).to.deep.equal([]);
    });
  });
});
