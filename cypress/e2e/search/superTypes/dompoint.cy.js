describe('search: dompoint spec', () => {
  const sel = '#section-allTypes ';

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
    cy.get(sel + 'select.addPropertySelect').select('dompoint');
    cy.get(sel + 'button').contains('Add').click();
  });

  it('gets a domShape leaf for a dimension range', () => {
    cy.get(sel + 'input.jsoeSearchRangeGte--z').type('3');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      const leaf = query.$and[0];
      expect(leaf.kind).to.equal('domShape');
      expect(leaf.dimensions.z).to.deep.equal({
        kind: 'range', path: '#/dompoint/z', valueType: 'number', $gte: 3
      });
    });
  });
});
