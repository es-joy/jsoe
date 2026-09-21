describe('search: catch spec', () => {
  const sel = '#section-allTypes ';

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
    cy.get(sel + 'select.addPropertySelect').select('catch');
    cy.get(sel + 'button').contains('Add').click();
  });

  it('wraps the inner type\'s own query in a passThrough leaf', () => {
    cy.get(sel + 'jsoe-search-catch input[name$="-value"]').type('abc');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and[0]).to.deep.equal({
        kind: 'passThrough',
        path: '#/catch',
        query: {kind: 'literalSet', path: '#/catch', $in: ['abc']}
      });
    });
  });

  it('contributes nothing when the inner type has no query of its own', () => {
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and).to.deep.equal([]);
    });
  });
});
