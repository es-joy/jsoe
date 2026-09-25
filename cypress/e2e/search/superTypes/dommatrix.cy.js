describe('search: dommatrix spec', () => {
  const sel = '#section-allTypes ';

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
    cy.get(sel + 'select.addPropertySelect').select('dommatrix');
    cy.get(sel + 'button').contains('Add').click();
  });

  it('combines a dimension range with readonly and 3d toggles', () => {
    cy.get(sel + 'input.jsoeSearchOptIn--a').check();
    cy.get(sel + 'input.jsoeSearchRangeGte--a').type('1');
    cy.get(sel + 'select.jsoeSearchTriState--readonly').select('false');
    cy.get(sel + 'select.jsoeSearchTriState--dimension').select('true');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      const leaf = query.$and[0];
      expect(leaf.kind).to.equal('domShape');
      expect(leaf.readonlyCheck).to.equal(false);
      expect(leaf.dimensionCheck).to.equal(3);
      expect(leaf.dimensions.a).to.deep.equal({
        kind: 'range', path: '#/dommatrix/a', valueType: 'number', $gte: 1
      });
    });
  });

  it(
    'round-trips a dimension range without touching the 3d toggle',
    () => {
      cy.get(sel + 'input.jsoeSearchOptIn--a').check();
      cy.get(sel + 'input.jsoeSearchRangeGte--a').type('1');

      cy.get(sel + '.loadQueryButton').click();
      cy.get(sel + 'input.jsoeSearchRangeGte--a').clear();
      cy.get(sel + 'input.jsoeSearchRangeGte--a').type('2');
      cy.get(sel + '.applyQueryButton').click();
      cy.get(sel + '.queryRawEditorError').should('have.text', '');

      cy.get(sel + 'input.jsoeSearchRangeGte--a').should('have.value', '1');
      cy.get(
        sel + 'select.jsoeSearchTriState--dimension'
      ).should('have.value', '');
    }
  );
});
