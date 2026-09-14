describe('search: blobHTML spec', () => {
  const sel = '#section-allTypes ';

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
    cy.get(sel + 'select.addPropertySelect').select('blobHTML');
    cy.get(sel + 'button').contains('Add').click();
  });

  it('gets a blobHTML leaf for the selected mode', () => {
    cy.get(sel + 'select.jsoeSearchBlobHTMLMode').select('cssSelector');
    cy.get(sel + 'input.jsoeSearchBlobHTMLValue').type('.title');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and[0]).to.deep.equal({
        kind: 'blobHTML', path: '#/blobHTML', mode: 'cssSelector', value: '.title'
      });
    });
  });
});
