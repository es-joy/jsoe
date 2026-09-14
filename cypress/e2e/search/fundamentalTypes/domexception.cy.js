describe('search: domexception spec', () => {
  const sel = '#section-allTypes ';

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
    cy.get(sel + 'select.addPropertySelect').select('domexception');
    cy.get(sel + 'button').contains('Add').click();
  });

  it('combines a predefined-name pull-down with a message literal', () => {
    cy.get(sel + 'jsoe-search-domexception select.jsoeSearchMultiSelect').select(
      ['NotFoundError']
    );
    cy.get(sel + 'input.jsoeSearchValue--message').type('missing');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      const leaf = query.$and[0];
      expect(leaf.$and).to.deep.include({
        kind: 'multiSelect', path: '#/domexception/name', $in: ['NotFoundError']
      });
      expect(leaf.$and).to.deep.include({
        kind: 'literalSet', path: '#/domexception/message', $in: ['missing']
      });
    });
  });
});
