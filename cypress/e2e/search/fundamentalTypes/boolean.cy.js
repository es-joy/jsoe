describe('search: boolean spec', () => {
  const sel = '#section-allTypes ';

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
    cy.get(sel + 'select.addPropertySelect').select('boolean');
    cy.get(sel + 'button').contains('Add').click();
  });

  it('gets a booleanEquals query', () => {
    cy.get(sel + 'jsoe-search-boolean select').select('false');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and[0]).to.deep.equal({
        kind: 'booleanEquals', path: '#/boolean', value: false
      });
    });
  });
});
