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
    cy.get(propSel + 'input.jsoeSearchOptIn--nameLiteral').check();
    cy.get(propSel + 'input.jsoeSearchLiteralValue--name').type('report.pdf');
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
    cy.get(propSel + 'input.jsoeSearchOptIn--typeRegex').check();
    cy.get(propSel + 'input.jsoeSearchRegexValue--type').type('^application/pdf$');
    cy.get(propSel + 'select.jsoeSearchRegexFlags--type').should('not.be.disabled').select(['i']);
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and[0]).to.deep.equal({
        kind: 'regex', path: '#/file/type', $regex: '^application/pdf$', $options: 'i'
      });
    });
  });

  it('contributes nothing with neither name nor type opted into', () => {
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and).to.deep.equal([]);
    });
  });

  it('combines a name literal with a content-type regex under "All of" by default', () => {
    const propSel = sel + '[data-search-path="#/file"] ';
    cy.get(propSel + 'input.jsoeSearchOptIn--name').check();
    cy.get(propSel + 'input.jsoeSearchOptIn--nameLiteral').check();
    cy.get(propSel + 'input.jsoeSearchLiteralValue--name').type('report.pdf');
    cy.get(propSel + 'input.jsoeSearchOptIn--type').check();
    cy.get(propSel + 'input.jsoeSearchOptIn--typeRegex').check();
    cy.get(propSel + 'input.jsoeSearchRegexValue--type').type('^application/pdf$');
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

  it('combines name and content-type under "Any of" once switched, and round-trips it', () => {
    const propSel = sel + '[data-search-path="#/file"] ';
    cy.get(propSel + 'input.jsoeSearchOptIn--name').check();
    cy.get(propSel + 'input.jsoeSearchOptIn--nameLiteral').check();
    cy.get(propSel + 'input.jsoeSearchLiteralValue--name').type('report.pdf');
    cy.get(propSel + 'input.jsoeSearchOptIn--type').check();
    cy.get(propSel + 'input.jsoeSearchOptIn--typeRegex').check();
    cy.get(propSel + 'input.jsoeSearchRegexValue--type').type('^application/pdf$');
    cy.get(propSel + 'select.jsoeSearchCombinator--').select('or');

    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      const leaf = query.$and[0];
      expect(leaf.$or).to.deep.include({
        kind: 'literalSet', path: '#/file/name', $in: ['report.pdf']
      });
      expect(leaf.$or).to.deep.include({
        kind: 'regex', path: '#/file/type', $regex: '^application/pdf$'
      });
    });

    cy.get(sel + '.loadQueryButton').click();
    cy.get(sel + '.applyQueryButton').click();
    cy.get(sel + '.queryRawEditorError').should('have.text', '');
    cy.get(propSel + 'select.jsoeSearchCombinator--').should('have.value', 'or');
    cy.get(propSel + 'input.jsoeSearchOptIn--name').should('be.checked');
    cy.get(propSel + 'input.jsoeSearchLiteralValue--name').should('have.value', 'report.pdf');
    cy.get(propSel + 'input.jsoeSearchOptIn--type').should('be.checked');
    cy.get(propSel + 'input.jsoeSearchRegexValue--type').should(
      'have.value', '^application/pdf$'
    );
  });
});
