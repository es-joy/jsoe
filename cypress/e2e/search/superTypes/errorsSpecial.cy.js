describe('search: special errors spec', () => {
  const sel = '#section-allTypes ';

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
    cy.get(sel + 'select.addPropertySelect').select('errors');
    cy.get(sel + 'button').contains('Add').click();
  });

  it('combines a message literal with a columnNumber range', () => {
    cy.get(sel + 'input.jsoeSearchValue--message').type('agg');
    cy.get(sel + 'input.jsoeSearchRangeGte--columnNumber').type('12');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      const leaf = query.$and[0];
      expect(leaf.$and).to.deep.include({
        kind: 'literalSet', path: '#/errors/message', $in: ['agg']
      });
      expect(leaf.$and).to.deep.include({
        kind: 'range', path: '#/errors/columnNumber', valueType: 'number', $gte: 12
      });
    });
  });
});
