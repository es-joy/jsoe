describe('search: xor spec', () => {
  const sel = '#section-allTypes ';

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
    cy.get(sel + 'select.addPropertySelect').select('xor');
    cy.get(sel + 'button').contains('Add').click();
  });

  it('combines a "has type" leaf with the chosen branch\'s own widget', () => {
    cy.get(sel + 'jsoe-search-xor select.jsoeSearchTypeOf').select('0');
    cy.get(sel + 'jsoe-search-xor select.jsoeSearchTriState--').select('true');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      const leaf = query.$and[0];
      expect(leaf.$and[0]).to.deep.equal({
        kind: 'typeOf', path: '#/xor', searchType: 'boolean'
      });
      expect(leaf.$and[1]).to.deep.equal({
        kind: 'booleanEquals', path: '#/xor', value: true
      });
    });
  });
});
