describe('search: file spec', () => {
  const sel = '#section-allTypes ';

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
    cy.get(sel + 'select.addPropertySelect').select('file');
    cy.get(sel + 'button').contains('Add').click();
  });

  it('gets a literalSet query against the name', () => {
    const propSel = sel + '[data-search-path="#/file"] ';
    cy.get(propSel + 'input.jsoeSearchOptIn--name').check();
    cy.get(propSel + 'input.jsoeSearchValue--name').type('report.pdf');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and[0]).to.deep.equal({
        kind: 'literalSet', path: '#/file/name', $in: ['report.pdf']
      });
    });
  });

  it('allows flags on the content-type regex', () => {
    const propSel = sel + '[data-search-path="#/file"] ';
    cy.get(propSel + 'input.jsoeSearchOptIn--type').check();
    cy.get(propSel + 'select.jsoeSearchMode--type').select('regex');
    cy.get(propSel + 'input.jsoeSearchValue--type').type('^application/pdf$');
    cy.get(propSel + 'select.jsoeSearchRegexFlags--type').should('be.visible').select(['i']);
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and[0]).to.deep.equal({
        kind: 'regex', path: '#/file/type', $regex: '^application/pdf$', $options: 'i'
      });
    });
  });

  it('combines a name literal with a content-type regex', () => {
    const propSel = sel + '[data-search-path="#/file"] ';
    cy.get(propSel + 'input.jsoeSearchOptIn--name').check();
    cy.get(propSel + 'input.jsoeSearchValue--name').type('report.pdf');
    cy.get(propSel + 'input.jsoeSearchOptIn--type').check();
    cy.get(propSel + 'select.jsoeSearchMode--type').select('regex');
    cy.get(propSel + 'input.jsoeSearchValue--type').type('^application/pdf$');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      const leaf = query.$and[0];
      expect(leaf.$and).to.deep.include({
        kind: 'literalSet', path: '#/file/name', $in: ['report.pdf']
      });
      expect(leaf.$and).to.deep.include({
        kind: 'regex', path: '#/file/type', $regex: '^application/pdf$'
      });
    });
  });
});
