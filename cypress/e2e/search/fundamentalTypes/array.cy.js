describe('search: array spec', () => {
  const sel = '#section-allTypes ';

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
    cy.get(sel + 'select.addPropertySelect').select('array');
    cy.get(sel + 'button').contains('Add').click();
  });

  it('combines a length/sparse constraint with an element-match constraint', () => {
    cy.get(sel + 'jsoe-search-array input[name$="-size"]').type('3');
    cy.get(sel + 'jsoe-search-array > label select.jsoeSearchTriState--').select('true');
    cy.get(sel + 'jsoe-search-array jsoe-search-number input[name$="-gte"]').type('7');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      const leaf = query.$and[0];
      expect(leaf.$and).to.have.length(2);
      expect(leaf.$and[0]).to.deep.equal({
        kind: 'lengthSize', path: '#/array', $size: 3, sparseCheck: true
      });
      expect(leaf.$and[1]).to.deep.equal({
        kind: 'range', path: '#/array/*', valueType: 'number', $gte: 7
      });
    });
  });
});
