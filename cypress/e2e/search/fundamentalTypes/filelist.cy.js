describe('search: FileList/instanceof routing regression', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html', {
      onBeforeLoad (win) {
        cy.stub(win.console, 'log').as('consoleLog');
      }
    });
  });

  it('routes a FileList schema\'s element to fileSearchType\'s UI, not the noneditable escape hatch', () => {
    // The `filelist` property of `schemaInstanceJSONSearchAllTypes` is
    // `{type: 'codec', name: 'filelist', output: {element: {type: 'file'}}}`
    // - `getSchemaType`'s `instanceof`-in-a-FileList routing
    // (`src/formats/schema.js`) only ever gets exercised via that exact
    // codec shape, so this is the one test directly protecting it from
    // regressing.
    cy.get('#section-allTypes select.addPropertySelect').select('filelist');
    cy.get('#section-allTypes button').contains('Add').click();

    cy.get(
      '#section-allTypes jsoe-search-filelist jsoe-search-file'
    ).should('exist');
    cy.get('#section-allTypes jsoe-search-filelist').should(
      'not.contain', 'TODO'
    );
  });
});
