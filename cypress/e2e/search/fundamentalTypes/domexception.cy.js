describe('search: domexception spec', () => {
  const sel = '#section-allTypes ';

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
    cy.get(sel + 'select.addPropertySelect').select('domexception');
    cy.get(sel + 'button').contains('Add').click();
  });

  it('contributes nothing with neither name nor message opted into', () => {
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and).to.deep.equal([]);
    });
  });

  it('combines a predefined-name pull-down with a message literal under "All of" by default', () => {
    const propSel = sel + 'jsoe-search-domexception ';
    cy.get(propSel + 'select.jsoeSearchMultiSelect').select(['NotFoundError']);
    cy.get(propSel + 'input.jsoeSearchOptIn--message').check();
    cy.get(propSel + 'input.jsoeSearchOptIn--messageLiteral').check();
    cy.get(propSel + 'input.jsoeSearchLiteralValue--message').type('missing');
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

  it('combines name and message under "Any of" once switched', () => {
    const propSel = sel + 'jsoe-search-domexception ';
    cy.get(propSel + 'select.jsoeSearchMultiSelect').select(['NotFoundError']);
    cy.get(propSel + 'input.jsoeSearchOptIn--message').check();
    cy.get(propSel + 'input.jsoeSearchOptIn--messageLiteral').check();
    cy.get(propSel + 'input.jsoeSearchLiteralValue--message').type('missing');
    cy.get(propSel + 'select.jsoeSearchCombinator--').select('or');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      const leaf = query.$and[0];
      expect(leaf.$or).to.deep.include({
        kind: 'multiSelect', path: '#/domexception/name', $in: ['NotFoundError']
      });
      expect(leaf.$or).to.deep.include({
        kind: 'literalSet', path: '#/domexception/message', $in: ['missing']
      });
    });
  });

  it('clears an existing name selection when applying a query with no match', () => {
    cy.get(sel + 'jsoe-search-domexception select.jsoeSearchMultiSelect').select(
      ['NotFoundError']
    );
    cy.get(sel + '.queryRawEditor .cm-content').type('{selectall}{{}$and: []{}}');
    cy.get(sel + '.applyQueryButton').click();
    cy.get(sel + '.queryRawEditorError').should('have.text', '');
    cy.get(
      sel + 'jsoe-search-domexception select.jsoeSearchMultiSelect option:selected'
    ).should('not.exist');
  });
});
