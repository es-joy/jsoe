describe('search: enum spec', () => {
  const sel = '#section-allTypes ';

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
    cy.get(sel + 'select.addPropertySelect').select('enum');
    cy.get(sel + 'button').contains('Add').click();
  });

  it('contributes nothing with no value selected', () => {
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and).to.deep.equal([]);
    });
  });

  it('gets a multiSelect query of the enum\'s actual values', () => {
    cy.get(sel + 'jsoe-search-enum select').select(['red']);
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and[0]).to.deep.equal({
        kind: 'multiSelect', path: '#/enum', $in: ['red']
      });
    });
  });

  it('clears an existing selection when applying a query with no match', () => {
    cy.get(sel + 'jsoe-search-enum select').select(['red']);
    cy.get(sel + '.queryRawEditor .cm-content').type('{selectall}{{}$and: []{}}');
    cy.get(sel + '.applyQueryButton').click();
    cy.get(sel + '.queryRawEditorError').should('have.text', '');
    cy.get(sel + 'jsoe-search-enum select').find('option:selected').should('not.exist');
  });
});
