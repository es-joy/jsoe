describe('search: blob spec', () => {
  const sel = '#section-allTypes ';

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
    cy.get(sel + 'select.addPropertySelect').select('blob');
    cy.get(sel + 'button').contains('Add').click();
  });

  it('gets a regex query against the MIME type', () => {
    const propSel = sel + '[data-search-path="#/blob"] ';
    cy.get(propSel + 'input.jsoeSearchOptIn--Regex').check();
    cy.get(propSel + 'input.jsoeSearchRegexValue--').type('^image/');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and[0]).to.deep.equal({
        kind: 'regex', path: '#/blob', $regex: '^image/'
      });
    });
  });

  it('allows flags once the regex facet is opted into', () => {
    const propSel = sel + '[data-search-path="#/blob"] ';
    cy.get(propSel + 'input.jsoeSearchOptIn--Regex').check();
    cy.get(propSel + 'input.jsoeSearchRegexValue--').type('^image/');
    cy.get(propSel + 'select.jsoeSearchRegexFlags--').should('not.be.disabled').select(['i']);
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and[0]).to.deep.equal({
        kind: 'regex', path: '#/blob', $regex: '^image/', $options: 'i'
      });
    });
  });

  it('gets a literalSet query against the MIME type', () => {
    const propSel = sel + '[data-search-path="#/blob"] ';
    cy.get(propSel + 'input.jsoeSearchOptIn--Literal').check();
    cy.get(propSel + 'input.jsoeSearchLiteralValue--').type('image/png');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and[0]).to.deep.equal({
        kind: 'literalSet', path: '#/blob', $in: ['image/png']
      });
    });
  });

  it('contributes nothing with no facet opted into', () => {
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and).to.deep.equal([]);
    });
  });
});
