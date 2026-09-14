describe('search: regexp spec', () => {
  const sel = '#section-allTypes ';

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
    cy.get(sel + 'select.addPropertySelect').select('regexp');
    cy.get(sel + 'button').contains('Add').click();
  });

  it('combines a source match with selected flags', () => {
    const propSel = sel + '[data-search-path="#/regexp"] ';
    cy.get(propSel + 'input[name$="-value"]').type('abc');
    cy.get(propSel + 'select.jsoeSearchMultiSelect').select(['g', 'i']);
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      const leaf = query.$and[0];
      expect(leaf.$and).to.have.length(2);
      expect(leaf.$and[0]).to.deep.equal({
        kind: 'literalSet', path: '#/regexp', $in: ['abc']
      });
      expect(leaf.$and[1]).to.deep.equal({
        kind: 'multiSelect', path: '#/regexp', $in: ['g', 'i']
      });
    });
  });
});
