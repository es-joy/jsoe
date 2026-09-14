describe('search: domrect spec', () => {
  const sel = '#section-allTypes ';

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
    cy.get(sel + 'select.addPropertySelect').select('domrect');
    cy.get(sel + 'button').contains('Add').click();
  });

  it('combines a dimension range with the readonly toggle into one domShape leaf', () => {
    cy.get(sel + 'input.jsoeSearchRangeGte--x').type('5');
    cy.get(sel + 'select.jsoeSearchTriState--readonly').select('true');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      const leaf = query.$and[0];
      expect(leaf.kind).to.equal('domShape');
      expect(leaf.readonlyCheck).to.equal(true);
      expect(leaf.dimensions.x).to.deep.equal({
        kind: 'range', path: '#/domrect/x', valueType: 'number', $gte: 5
      });
    });
  });
});
