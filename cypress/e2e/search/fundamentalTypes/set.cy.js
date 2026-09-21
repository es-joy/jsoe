describe('search: set spec', () => {
  const sel = '#section-allTypes ';

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
    cy.get(sel + 'select.addPropertySelect').select('set');
    cy.get(sel + 'button').contains('Add').click();
  });

  it('combines a length constraint with an element-match constraint (no sparse toggle)', () => {
    cy.get(sel + 'jsoe-search-set > label select.jsoeSearchTriState--').should('not.exist');
    cy.get(sel + 'jsoe-search-set input[name$="-size"]').type('4');
    cy.get(sel + 'jsoe-search-set input.jsoeSearchOptIn--').check();
    cy.get(sel + 'jsoe-search-set jsoe-search-number input[name$="-gte"]').type('2');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      const leaf = query.$and[0];
      expect(leaf.$and[0]).to.deep.equal({
        kind: 'lengthSize', path: '#/set', $size: 4
      });
      expect(leaf.$and[1]).to.deep.equal({
        kind: 'range', path: '#/set/*', valueType: 'number', $gte: 2
      });
    });
  });

  it('gets a bare length constraint with no element match opted into', () => {
    cy.get(sel + 'jsoe-search-set input[name$="-size"]').type('4');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and[0]).to.deep.equal({
        kind: 'lengthSize', path: '#/set', $size: 4
      });
    });
  });
});
