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
