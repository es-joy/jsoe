describe('search: promise spec', () => {
  const sel = '#section-allTypes ';

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
    cy.get(sel + 'select.addPropertySelect').select('promise');
    cy.get(sel + 'button').contains('Add').click();
  });

  it('wraps the resolved value\'s own query in a passThrough leaf', () => {
    cy.get(sel + 'jsoe-search-promise input[name$="-gte"]').type('42');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and[0]).to.deep.equal({
        kind: 'passThrough',
        path: '#/promise',
        query: {kind: 'range', path: '#/promise', valueType: 'number', $gte: 42}
      });
    });
  });
});
