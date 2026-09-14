describe('search: undefined spec', () => {
  const sel = '#section-allTypes ';

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
    cy.get(sel + 'select.addPropertySelect').select('undef');
    cy.get(sel + 'button').contains('Add').click();
  });

  it('gets a presence query when checked', () => {
    cy.get(sel + 'jsoe-search-undefined input[type="checkbox"]').check();
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and[0]).to.deep.equal({
        kind: 'presence', path: '#/undef', $exists: true
      });
    });
  });

  it('gets no constraint when unchecked', () => {
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query).to.deep.equal({$and: []});
    });
  });
});
