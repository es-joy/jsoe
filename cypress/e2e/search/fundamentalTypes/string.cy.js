describe('search: string spec', () => {
  const sel = '#section-allTypes ';

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
    cy.get(sel + 'select.addPropertySelect').select('string');
    cy.get(sel + 'button').contains('Add').click();
  });

  it('gets a literalSet query by default', () => {
    const propSel = sel + '[data-search-path="#/string"] ';
    cy.get(propSel + 'input[name$="-value"]').type('abc, def');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and[0]).to.deep.equal({
        kind: 'literalSet', path: '#/string', $in: ['abc', 'def']
      });
    });
  });

  it('gets a regex query when that mode is selected', () => {
    const propSel = sel + '[data-search-path="#/string"] ';
    cy.get(propSel + 'select[name$="-mode"]').select('regex');
    cy.get(propSel + 'input[name$="-value"]').type('^abc$');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and[0]).to.deep.equal({
        kind: 'regex', path: '#/string', $regex: '^abc$'
      });
    });
  });
});
