describe('search: object spec', () => {
  const sel = '#section-allTypes ';

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
    cy.get(sel + 'select.addPropertySelect').select('object');
    cy.get(sel + 'button').contains('Add').click();
  });

  it('combines a has-property toggle with the nested property\'s own widget', () => {
    const nestedSel = sel + 'jsoe-search-object[data-search-path="#/object"] ';
    cy.get(nestedSel + 'select.addPropertySelect').select('nested');
    cy.get(nestedSel + 'button').contains('Add').click();
    cy.get(nestedSel + 'select[name$="-hasProperty-nested"]').select('true');
    cy.get(nestedSel + 'input[name$="-value"]').type('hello');

    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      const leaf = query.$and[0];
      expect(leaf.$and).to.have.length(2);
      expect(leaf.$and[0]).to.deep.equal({
        kind: 'hasProperty', path: '#/object/nested', $exists: true
      });
      expect(leaf.$and[1]).to.deep.equal({
        kind: 'literalSet', path: '#/object/nested', $in: ['hello']
      });
    });
  });
});
