describe('search: symbol spec', () => {
  const sel = '#section-allTypes ';

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
    cy.get(sel + 'select.addPropertySelect').select('symbol');
    cy.get(sel + 'button').contains('Add').click();
  });

  it('gets a literalSet query against the description', () => {
    const propSel = sel + '[data-search-path="#/symbol"] ';
    cy.get(propSel + 'input.jsoeSearchOptIn--Literal').check();
    cy.get(propSel + 'input.jsoeSearchLiteralValue--').type('mySymbol');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and[0]).to.deep.equal({
        kind: 'literalSet', path: '#/symbol', $in: ['mySymbol']
      });
    });
  });

  it('gets a regex query against the description from the regex facet', () => {
    const propSel = sel + '[data-search-path="#/symbol"] ';
    cy.get(propSel + 'input.jsoeSearchOptIn--Regex').check();
    cy.get(propSel + 'input.jsoeSearchRegexValue--').type('^my');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and[0]).to.deep.equal({
        kind: 'regex', path: '#/symbol', $regex: '^my'
      });
    });
  });

  it('contributes nothing with no facet opted into', () => {
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and).to.deep.equal([]);
    });
  });
});
