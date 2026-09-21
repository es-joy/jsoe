describe('search: blobHTML spec', () => {
  const sel = '#section-allTypes ';

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
    cy.get(sel + 'select.addPropertySelect').select('blobHTML');
    cy.get(sel + 'button').contains('Add').click();
  });

  it('gets a blobHTML leaf for the selected mode', () => {
    cy.get(sel + 'select.jsoeSearchBlobHTMLMode').select('cssSelector');
    cy.get(sel + 'input.jsoeSearchBlobHTMLValue').should('be.visible').type('.title');
    cy.get(sel + 'textarea.jsoeSearchBlobHTMLValue').should('be.hidden');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and[0]).to.deep.equal({
        kind: 'blobHTML', path: '#/blobHTML', mode: 'cssSelector', value: '.title'
      });
    });
  });

  it('swaps to a textarea for full text search mode only', () => {
    cy.get(sel + 'select.jsoeSearchBlobHTMLMode').select('fullText');
    cy.get(sel + 'input.jsoeSearchBlobHTMLValue').should('be.hidden');
    cy.get(sel + 'textarea.jsoeSearchBlobHTMLValue').should('be.visible').type('welcome text');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and[0]).to.deep.equal({
        kind: 'blobHTML', path: '#/blobHTML', mode: 'fullText', value: 'welcome text'
      });
    });
  });

  it('defaults to "CSS selector" as the first/selected mode option', () => {
    cy.get(sel + 'select.jsoeSearchBlobHTMLMode option').first().should('have.value', 'cssSelector');
    cy.get(sel + 'select.jsoeSearchBlobHTMLMode').should('have.value', 'cssSelector');
    cy.get(sel + 'input.jsoeSearchBlobHTMLValue').should('be.visible');
  });

  it('allows flags for "Regex search of raw HTML", hidden otherwise, folded into $options', () => {
    cy.get(sel + 'select.jsoeSearchBlobHTMLFlags').should('not.be.visible');

    cy.get(sel + 'select.jsoeSearchBlobHTMLMode').select('rawHTMLRegex');
    cy.get(sel + 'input.jsoeSearchBlobHTMLValue').type('^<h1>');
    cy.get(sel + 'select.jsoeSearchBlobHTMLFlags').should('be.visible').select(['i', 's']);
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and[0]).to.deep.equal({
        kind: 'blobHTML', path: '#/blobHTML', mode: 'rawHTMLRegex', value: '^<h1>',
        $options: 'is'
      });
    });
  });

  it('contributes nothing with no value entered', () => {
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and).to.deep.equal([]);
    });
  });
});
