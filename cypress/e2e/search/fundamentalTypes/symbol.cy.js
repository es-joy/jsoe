describe('search: symbol spec', () => {
  const sel = '#section-allTypes ';

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
    cy.get(sel + 'select.addPropertySelect').select('symbol');
    cy.get(sel + 'button').contains('Add').click();
  });

  it('gets a literalSet query against the description', () => {
    const propSel = sel + '[data-search-path="#/symbol"] ';
    cy.get(propSel + 'input[name$="-value"]').type('mySymbol');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and[0]).to.deep.equal({
        kind: 'literalSet', path: '#/symbol', $in: ['mySymbol']
      });
    });
  });
});
