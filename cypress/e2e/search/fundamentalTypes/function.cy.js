describe('search: function spec', () => {
  const sel = '#section-allTypes ';

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
    cy.get(sel + 'select.addPropertySelect').select('function');
    cy.get(sel + 'button').contains('Add').click();
  });

  it('combines an args (tuple) match with an output match', () => {
    cy.get(sel + '[data-search-path="#/function/*args/0"] input[name$="-gte"]').type('3');
    cy.get(sel + '[data-search-path="#/function/*output"] select').select('true');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      const leaf = query.$and[0];
      expect(leaf.$and[0]).to.deep.equal({
        kind: 'range', path: '#/function/*args/0', valueType: 'number', $gte: 3
      });
      expect(leaf.$and[1]).to.deep.equal({
        kind: 'booleanEquals', path: '#/function/*output', value: true
      });
    });
  });
});
