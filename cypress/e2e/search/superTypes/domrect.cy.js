describe('search: domrect spec', () => {
  const sel = '#section-allTypes ';

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
    cy.get(sel + 'select.addPropertySelect').select('domrect');
    cy.get(sel + 'button').contains('Add').click();
  });

  it('contributes nothing when nothing is opted in', () => {
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and).to.deep.equal([]);
    });
  });

  it('contributes nothing for a dimension opted in with no bound filled in', () => {
    cy.get(sel + 'input.jsoeSearchOptIn--x').check();
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and).to.deep.equal([]);
    });
  });

  it('includes the lte bound when only it is filled in', () => {
    cy.get(sel + 'input.jsoeSearchOptIn--x').check();
    cy.get(sel + 'input.jsoeSearchRangeLte--x').type('10');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      const leaf = query.$and[0];
      expect(leaf.dimensions.x).to.deep.equal({
        kind: 'range', path: '#/domrect/x', valueType: 'number', $lte: 10
      });
    });
  });

  it('combines a dimension range with the readonly toggle into one domShape leaf', () => {
    cy.get(sel + 'input.jsoeSearchOptIn--x').check();
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
