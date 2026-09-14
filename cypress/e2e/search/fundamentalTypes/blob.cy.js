describe('search: blob spec', () => {
  const sel = '#section-allTypes ';

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
    cy.get(sel + 'select.addPropertySelect').select('blob');
    cy.get(sel + 'button').contains('Add').click();
  });

  it('gets a regex query against the MIME type', () => {
    const propSel = sel + '[data-search-path="#/blob"] ';
    cy.get(propSel + 'select[name$="-mode"]').select('regex');
    cy.get(propSel + 'input[name$="-value"]').type('^image/');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and[0]).to.deep.equal({
        kind: 'regex', path: '#/blob', $regex: '^image/'
      });
    });
  });

  it('allows flags once "Matches regex" is chosen', () => {
    const propSel = sel + '[data-search-path="#/blob"] ';
    cy.get(propSel + 'select[name$="-mode"]').select('regex');
    cy.get(propSel + 'input[name$="-value"]').type('^image/');
    cy.get(propSel + 'select.jsoeSearchRegexFlags--').should('be.visible').select(['i']);
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and[0]).to.deep.equal({
        kind: 'regex', path: '#/blob', $regex: '^image/', $options: 'i'
      });
    });
  });
});
