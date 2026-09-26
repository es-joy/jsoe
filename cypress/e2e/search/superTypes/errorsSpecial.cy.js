describe('search: special errors spec', () => {
  const sel = '#section-allTypes ';

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
    cy.get(sel + 'select.addPropertySelect').select('errors');
    cy.get(sel + 'button').contains('Add').click();
  });

  it('combines a message literal with a columnNumber range', () => {
    cy.get(sel + 'input.jsoeSearchOptIn--message').check();
    cy.get(sel + 'input.jsoeSearchValue--message').type('agg');
    cy.get(sel + 'input.jsoeSearchOptIn--columnNumber').check();
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

  it(
    'restricts the match to one or more chosen error classes',
    () => {
      cy.get(sel + 'input.jsoeSearchOptIn--errorClass').check();
      cy.get(sel + 'select.jsoeSearchMultiSelect').select(
        ['TypeError', 'RangeError']
      );
      cy.get(sel + '.getQueryButton').click();
      cy.get(sel + '.queryResult').then((elem) => {
        const query = JSON.parse(elem.text());
        expect(query.$and[0]).to.deep.equal({
          kind: 'multiSelect', path: '#/errors/errorClass',
          $in: ['TypeError', 'RangeError']
        });
      });
    }
  );

  it(
    'round-trips a saved error-class query back into the checked opt-in ' +
      'and the selected options',
    () => {
      cy.get(sel + '.queryRawEditor .cm-content').type(
        '{selectall}{{}$and: [{{}kind: "multiSelect", ' +
          'path: "#/errors/errorClass", $in: ["SyntaxError"]{}}]{}}'
      );
      cy.get(sel + '.applyQueryButton').click();
      cy.get(sel + '.queryRawEditorError').should('have.text', '');
      cy.get(sel + 'input.jsoeSearchOptIn--errorClass').should('be.checked');
      cy.get(sel + 'select.jsoeSearchMultiSelect').invoke('val').should(
        'deep.equal', ['SyntaxError']
      );
    }
  );

  it(
    'contributes nothing for the error-class facet opted in with ' +
      'nothing selected',
    () => {
      cy.get(sel + 'input.jsoeSearchOptIn--errorClass').check();
      cy.get(sel + 'input.jsoeSearchOptIn--message').check();
      cy.get(sel + 'input.jsoeSearchValue--message').type('boom');
      cy.get(sel + '.getQueryButton').click();
      cy.get(sel + '.queryResult').then((elem) => {
        const query = JSON.parse(elem.text());
        expect(query.$and[0]).to.deep.equal({
          kind: 'literalSet', path: '#/errors/message', $in: ['boom']
        });
        expect(JSON.stringify(query)).to.not.contain('errorClass');
      });
    }
  );

  it(
    'clears a stale error-class selection when applying a saved query ' +
      'that has no error-class clause at all',
    () => {
      // Stale prior state: opted in with a selection, as a real user might
      //   leave it before loading an unrelated saved query.
      cy.get(sel + 'input.jsoeSearchOptIn--errorClass').check();
      cy.get(sel + 'select.jsoeSearchMultiSelect').select(['URIError']);

      cy.get(sel + '.queryRawEditor .cm-content').type(
        '{selectall}{{}$and: [{{}kind: "literalSet", ' +
          'path: "#/errors/message", $in: ["saved"]{}}]{}}'
      );
      cy.get(sel + '.applyQueryButton').click();
      cy.get(sel + '.queryRawEditorError').should('have.text', '');

      cy.get(sel + 'input.jsoeSearchOptIn--errorClass').should(
        'not.be.checked'
      );
      cy.get(sel + 'select.jsoeSearchMultiSelect').invoke('val').should(
        'deep.equal', []
      );
    }
  );
});
