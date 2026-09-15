describe('search: "Edit raw" apply-query round trip', () => {
  const sel = '#section-allTypes ';

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
  });

  it('round-trips a query through "Load current query into editor" and "Apply query"', () => {
    cy.get(sel + 'select.addPropertySelect').select('string');
    cy.get(sel + 'button').contains('Add').click();

    const propSel = sel + '[data-search-path="#/string"] ';
    cy.get(propSel + 'input[name$="-value"]').type('abc, def');

    // Snapshot the current query into the raw editor (no manual JSON typing
    // - `view.dispatch` sets its content programmatically, avoiding
    // CodeMirror's own bracket auto-closing interfering with typed `{`/`}`).
    cy.get(sel + '.loadQueryButton').click();

    // Change the live control so it no longer matches what was captured.
    cy.get(propSel + 'input[name$="-value"]').clear();
    cy.get(propSel + 'input[name$="-value"]').type('changed');
    cy.get(propSel + 'input[name$="-value"]').should('have.value', 'changed');

    // Re-applying the earlier snapshot should restore the original value.
    cy.get(sel + '.applyQueryButton').click();
    cy.get(sel + '.queryRawEditorError').should('have.text', '');
    cy.get(propSel + 'input[name$="-value"]').should('have.value', 'abc, def');

    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and[0]).to.deep.equal({
        kind: 'literalSet', path: '#/string', $in: ['abc', 'def']
      });
    });
  });

  it('reports a syntax error for invalid JSON6 without throwing', () => {
    cy.get(sel + '.queryRawEditor .cm-content').type(
      '{selectall}not valid json'
    );
    cy.get(sel + '.applyQueryButton').click();
    cy.get(sel + '.queryRawEditorError').should('not.have.text', '');
  });

  it('loads and applies the "one of each type" example query without error', () => {
    cy.get(sel + '.loadExampleQueryButton').click();
    cy.get(sel + '.applyQueryButton').click();
    cy.get(sel + '.queryRawEditorError').should('have.text', '');

    cy.get(sel + '.checkValidityButton').click();
    cy.get(sel + '.validityResult').should('have.text', 'Valid');

    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      // `$getQuery()` wraps the object's own combined result once more
      // (`{$and: [result]}`), and the object's own result (with more than
      // one active row) is itself an `$and` - one clause per property (36:
      // requiredString + 35 optional).
      expect(query.$and).to.have.length(1);
      expect(query.$and[0].$and).to.have.length(36);
    });
  });
});
