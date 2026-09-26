describe('search: error spec', () => {
  const sel = '#section-allTypes ';

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
    cy.get(sel + 'select.addPropertySelect').select('error');
    cy.get(sel + 'button').contains('Add').click();
  });

  it('combines a message literal with a lineNumber range', () => {
    cy.get(sel + 'input.jsoeSearchOptIn--message').check();
    cy.get(sel + 'input.jsoeSearchValue--message').type('boom');
    cy.get(sel + 'input.jsoeSearchOptIn--lineNumber').check();
    cy.get(sel + 'input.jsoeSearchRangeGte--lineNumber').type('42');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      const leaf = query.$and[0];
      expect(leaf.$and).to.deep.include({
        kind: 'literalSet', path: '#/error/message', $in: ['boom']
      });
      expect(leaf.$and).to.deep.include({
        kind: 'range', path: '#/error/lineNumber', valueType: 'number', $gte: 42
      });
    });
  });

  it('includes the lte bound when only it is filled in', () => {
    cy.get(sel + 'input.jsoeSearchOptIn--lineNumber').check();
    cy.get(sel + 'input.jsoeSearchRangeLte--lineNumber').type('99');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      const leaf = query.$and[0];
      expect(leaf).to.deep.equal({
        kind: 'range', path: '#/error/lineNumber', valueType: 'number', $lte: 99
      });
    });
  });

  it('contributes nothing for a number property opted in with no bound filled in', () => {
    cy.get(sel + 'input.jsoeSearchOptIn--message').check();
    cy.get(sel + 'input.jsoeSearchValue--message').type('boom');
    cy.get(sel + 'input.jsoeSearchOptIn--lineNumber').check();
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      const leaf = query.$and[0];
      expect(leaf.$and ?? [leaf]).to.deep.include({
        kind: 'literalSet', path: '#/error/message', $in: ['boom']
      });
      expect(JSON.stringify(query)).to.not.contain('lineNumber');
    });
  });

  it(
    'round-trips a saved message query back into the checked opt-in and ' +
      'its value (plain `Error` has no error-class facet to also apply)',
    () => {
      cy.get(sel + '.queryRawEditor .cm-content').type(
        '{selectall}{{}$and: [{{}kind: "literalSet", ' +
          'path: "#/error/message", $in: ["saved"]{}}]{}}'
      );
      cy.get(sel + '.applyQueryButton').click();
      cy.get(sel + '.queryRawEditorError').should('have.text', '');
      cy.get(sel + 'input.jsoeSearchOptIn--message').should('be.checked');
      cy.get(sel + 'input.jsoeSearchValue--message').should(
        'have.value', 'saved'
      );
    }
  );
});
