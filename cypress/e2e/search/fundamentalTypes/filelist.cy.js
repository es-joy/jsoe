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

describe('search: filelist spec (getQuery)', () => {
  const sel = '#section-allTypes ';

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
    cy.get(sel + 'select.addPropertySelect').select('filelist');
    cy.get(sel + 'button').contains('Add').click();
  });

  it('gets a bare length constraint with no element match opted into', () => {
    cy.get(sel + 'jsoe-search-filelist input[name$="-size"]').type('2');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and[0]).to.deep.equal({
        kind: 'lengthSize', path: '#/filelist', $size: 2
      });
    });
  });

  it('combines a length constraint with an opted-in element match', () => {
    const filelistSel = sel + 'jsoe-search-filelist ';
    cy.get(filelistSel + 'input[name$="-size"]').type('2');
    cy.get(filelistSel + 'input.jsoeSearchOptIn--').check();
    cy.get(filelistSel + 'jsoe-search-file input.jsoeSearchOptIn--name').check();
    cy.get(
      filelistSel + 'jsoe-search-file input.jsoeSearchValue--name'
    ).type('report.pdf');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      const leaf = query.$and[0];
      expect(leaf.$and).to.deep.include({
        kind: 'lengthSize', path: '#/filelist', $size: 2
      });
      expect(leaf.$and).to.deep.include({
        kind: 'literalSet', path: '#/filelist/*/name', $in: ['report.pdf']
      });
    });
  });

  it('contributes nothing with no size or element match opted into', () => {
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and).to.deep.equal([]);
    });
  });
});
