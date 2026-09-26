describe('search: resurrectable (noneditable escape hatch) spec', () => {
  const sel = '#section-allTypes ';

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
    cy.get(sel + 'select.addPropertySelect').select('resurrectable');
    cy.get(sel + 'button').contains('Add').click();
  });

  it('renders the noneditable stub rather than a real widget', () => {
    cy.get(sel + '[data-search-path="#/resurrectable"]').should(
      'contain', 'TODO: noneditable'
    );
  });

  it(
    'contributes nothing to the query and tolerates an "Edit raw" round ' +
      'trip',
    () => {
      cy.get(sel + '.getQueryButton').click();
      cy.get(sel + '.queryResult').then((elem) => {
        const query = JSON.parse(elem.text());
        expect(query.$and).to.deep.equal([]);
      });

      cy.get(sel + '.loadQueryButton').click();
      cy.get(sel + '.applyQueryButton').click();
      cy.get(sel + '.queryRawEditorError').should('have.text', '');
    }
  );

  it(
    'falls back to the noneditable stub for a schema shape with no ' +
      'registered search type at all',
    () => {
      cy.get(sel + 'select.addPropertySelect').select('unrecognizedCheckedType');
      cy.get(sel + 'button').contains('Add').click();
      cy.get(sel + '[data-search-path="#/unrecognizedCheckedType"]').should(
        'contain', 'TODO: noneditable'
      );
    }
  );
});
