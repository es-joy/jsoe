describe('search: SpecialRealNumber spec', () => {
  const sel = '#section-allTypes ';

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
    cy.get(sel + 'select.addPropertySelect').select('specialRealNumber');
    cy.get(sel + 'button').contains('Add').click();
  });

  it('contributes nothing with no value selected', () => {
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and).to.deep.equal([]);
    });
  });

  it('gets a multiSelect query of Infinity/-Infinity/-0', () => {
    cy.get(sel + 'jsoe-search-special-real-number select').select(
      ['Infinity', '-0']
    );
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and[0]).to.deep.equal({
        kind: 'multiSelect', path: '#/specialRealNumber', $in: ['Infinity', '-0']
      });
    });
  });

  it('clears an existing selection when applying a query with no match', () => {
    cy.get(sel + 'jsoe-search-special-real-number select').select(
      ['Infinity', '-0']
    );
    cy.get(sel + '.queryRawEditor .cm-content').type('{selectall}{{}$and: []{}}');
    cy.get(sel + '.applyQueryButton').click();
    cy.get(sel + '.queryRawEditorError').should('have.text', '');
    cy.get(sel + 'jsoe-search-special-real-number select').find('option:selected').should('not.exist');
  });
});
