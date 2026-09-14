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
    cy.get(sel + 'textarea.jsoeSearchBlobHTMLValue').should('be.visible')
      .type('welcome text');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and[0]).to.deep.equal({
        kind: 'blobHTML', path: '#/blobHTML', mode: 'fullText', value: 'welcome text'
      });
    });
  });
});
