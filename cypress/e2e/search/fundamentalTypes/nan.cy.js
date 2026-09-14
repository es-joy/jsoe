describe('search: nan spec', () => {
  const sel = '#section-allTypes ';

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
    cy.get(sel + 'select.addPropertySelect').select('nan');
    cy.get(sel + 'button').contains('Add').click();
  });

  it('gets a presence query when checked', () => {
    cy.get(sel + 'jsoe-search-nan input[type="checkbox"]').check();
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and[0]).to.deep.equal({
        kind: 'presence', path: '#/nan', $exists: true
      });
    });
  });
});
