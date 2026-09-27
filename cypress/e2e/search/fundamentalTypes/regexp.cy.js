describe('search: regexp spec', () => {
  const sel = '#section-allTypes ';

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
    cy.get(sel + 'select.addPropertySelect').select('regexp');
    cy.get(sel + 'button').contains('Add').click();
  });

  it('combines a source regex match with selected flags under "All of" by default (flags shown once the regex facet is opted into)', () => {
    const propSel = sel + '[data-search-path="#/regexp"] ';
    cy.get(propSel + 'select.jsoeSearchMultiSelect').should('be.hidden');

    cy.get(propSel + 'input.jsoeSearchOptIn--Regex').check();
    cy.get(propSel + 'input.jsoeSearchRegexValue--').type('abc');
    cy.get(propSel + 'select.jsoeSearchMultiSelect').should('be.visible').select(['g', 'i']);
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      const leaf = query.$and[0];
      expect(leaf.$and).to.have.length(2);
      expect(leaf.$and[0]).to.deep.equal({
        kind: 'regex', path: '#/regexp', $regex: 'abc'
      });
      expect(leaf.$and[1]).to.deep.equal({
        kind: 'multiSelect', path: '#/regexp', $in: ['g', 'i']
      });
    });
  });

  it('combines source and flags under "Any of" once switched, and round-trips it', () => {
    const propSel = sel + '[data-search-path="#/regexp"] ';
    cy.get(propSel + 'input.jsoeSearchOptIn--Regex').check();
    cy.get(propSel + 'input.jsoeSearchRegexValue--').type('abc');
    cy.get(propSel + 'select.jsoeSearchMultiSelect').select(['g', 'i']);
    cy.get(propSel + 'select.jsoeSearchCombinator--sourceFlags').select('or');

    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      const leaf = query.$and[0];
      expect(leaf.$or).to.have.length(2);
    });

    cy.get(sel + '.loadQueryButton').click();
    cy.get(sel + '.applyQueryButton').click();
    cy.get(sel + '.queryRawEditorError').should('have.text', '');
    cy.get(propSel + 'select.jsoeSearchCombinator--sourceFlags').should('have.value', 'or');
    cy.get(propSel + 'input.jsoeSearchOptIn--Regex').should('be.checked');
    cy.get(propSel + 'input.jsoeSearchRegexValue--').should('have.value', 'abc');
    cy.get(propSel + 'select.jsoeSearchMultiSelect').invoke('val').should('deep.equal', ['g', 'i']);
  });

  it('clears selected flags when applying a query with no match', () => {
    const propSel = sel + '[data-search-path="#/regexp"] ';
    cy.get(propSel + 'input.jsoeSearchOptIn--Regex').check();
    cy.get(propSel + 'input.jsoeSearchRegexValue--').type('abc');
    cy.get(propSel + 'select.jsoeSearchMultiSelect').should('be.visible').select(['g', 'i']);

    cy.get(sel + '.queryRawEditor .cm-content').type('{selectall}{{}$and: []{}}');
    cy.get(sel + '.applyQueryButton').click();
    cy.get(sel + '.queryRawEditorError').should('have.text', '');
    cy.get(propSel + 'select.jsoeSearchMultiSelect option:selected').should('not.exist');
  });

  it(
    'gets a bare literal-source query, ignoring flags while the regex facet ' +
      'is not opted into',
    () => {
      const propSel = sel + '[data-search-path="#/regexp"] ';
      cy.get(propSel + 'input.jsoeSearchOptIn--Literal').check();
      cy.get(propSel + 'input.jsoeSearchLiteralValue--').type('abc');
      cy.get(sel + '.getQueryButton').click();
      cy.get(sel + '.queryResult').then((elem) => {
        const query = JSON.parse(elem.text());
        expect(query.$and[0]).to.deep.equal({
          kind: 'literalSet', path: '#/regexp', $in: ['abc']
        });
      });
    }
  );

  it('contributes nothing with no facet opted into', () => {
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and).to.deep.equal([]);
    });
  });
});
