describe('search: string spec', () => {
  const sel = '#section-allTypes ';

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
    cy.get(sel + 'select.addPropertySelect').select('string');
    cy.get(sel + 'button').contains('Add').click();
  });

  it('gets a literalSet query from the literal facet', () => {
    const propSel = sel + '[data-search-path="#/string"] ';
    cy.get(propSel + 'input.jsoeSearchOptIn--Literal').check();
    cy.get(propSel + 'input.jsoeSearchLiteralValue--').type('abc, def');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and[0]).to.deep.equal({
        kind: 'literalSet', path: '#/string', $in: ['abc', 'def']
      });
    });
  });

  it('gets a regex query from the regex facet', () => {
    const propSel = sel + '[data-search-path="#/string"] ';
    cy.get(propSel + 'input.jsoeSearchOptIn--Regex').check();
    cy.get(propSel + 'input.jsoeSearchRegexValue--').type('^abc$');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and[0]).to.deep.equal({
        kind: 'regex', path: '#/string', $regex: '^abc$'
      });
    });
  });

  it('gets a notContains query from the does-not-contain facet', () => {
    const propSel = sel + '[data-search-path="#/string"] ';
    cy.get(propSel + 'input.jsoeSearchOptIn--NotContains').check();
    cy.get(propSel + 'input.jsoeSearchNotContainsValue--').type('badword');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and[0]).to.deep.equal({
        kind: 'notContains', path: '#/string', value: 'badword'
      });
    });
  });

  it('combines two opted-into facets under "All of" by default, "Any of" once switched', () => {
    const propSel = sel + '[data-search-path="#/string"] ';
    cy.get(propSel + 'input.jsoeSearchOptIn--Literal').check();
    cy.get(propSel + 'input.jsoeSearchLiteralValue--').type('abc');
    cy.get(propSel + 'input.jsoeSearchOptIn--NotContains').check();
    cy.get(propSel + 'input.jsoeSearchNotContainsValue--').type('badword');

    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      const leaf = query.$and[0];
      expect(leaf.$and).to.have.length(2);
      expect(leaf.$and[0]).to.deep.equal({kind: 'literalSet', path: '#/string', $in: ['abc']});
      expect(leaf.$and[1]).to.deep.equal({
        kind: 'notContains', path: '#/string', value: 'badword'
      });
    });

    cy.get(propSel + 'select.jsoeSearchCombinator--').select('or');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      const leaf = query.$and[0];
      expect(leaf.$or).to.have.length(2);
    });
  });

  it(
    'checks (but clears) the literal facet when applying a hand-typed ' +
      'literalSet query that has only `$nin` (no `$in`, which no widget ' +
      'ever produces itself, but a raw-edited query can)',
    () => {
      const propSel = sel + '[data-search-path="#/string"] ';
      cy.get(propSel + 'input.jsoeSearchOptIn--Literal').check();
      cy.get(propSel + 'input.jsoeSearchLiteralValue--').type('stale');
      cy.get(sel + '.queryRawEditor .cm-content').type(
        '{selectall}{{}$and: [{{}kind: "literalSet", path: "#/string", ' +
          '$nin: ["x"]{}}]{}}'
      );
      cy.get(sel + '.applyQueryButton').click();
      cy.get(sel + '.queryRawEditorError').should('have.text', '');
      cy.get(propSel + 'input.jsoeSearchOptIn--Literal').should('be.checked');
      cy.get(propSel + 'input.jsoeSearchLiteralValue--').should('have.value', '');
    }
  );

  it('round-trips a notContains value through "Edit raw", discarding an unopted-into literal typed in meanwhile', () => {
    const propSel = sel + '[data-search-path="#/string"] ';
    cy.get(propSel + 'input.jsoeSearchOptIn--NotContains').check();
    cy.get(propSel + 'input.jsoeSearchNotContainsValue--').type('badword');
    cy.get(sel + '.loadQueryButton').click();

    cy.get(propSel + 'input.jsoeSearchOptIn--Literal').check();
    cy.get(propSel + 'input.jsoeSearchLiteralValue--').type('unsaved');

    cy.get(sel + '.applyQueryButton').click();
    cy.get(sel + '.queryRawEditorError').should('have.text', '');
    cy.get(propSel + 'input.jsoeSearchOptIn--NotContains').should('be.checked');
    cy.get(propSel + 'input.jsoeSearchNotContainsValue--').should('have.value', 'badword');
    cy.get(propSel + 'input.jsoeSearchOptIn--Literal').should('not.be.checked');
  });

  it('allows flags once the regex facet is opted into, disabled otherwise', () => {
    const propSel = sel + '[data-search-path="#/string"] ';
    cy.get(propSel + 'select.jsoeSearchRegexFlags--').should('be.disabled');

    cy.get(propSel + 'input.jsoeSearchOptIn--Regex').check();
    cy.get(propSel + 'input.jsoeSearchRegexValue--').type('^abc$');
    cy.get(propSel + 'select.jsoeSearchRegexFlags--').should('not.be.disabled').select(['i', 'm']);
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and[0]).to.deep.equal({
        kind: 'regex', path: '#/string', $regex: '^abc$', $options: 'im'
      });
    });
  });

  it('contributes nothing with no facet opted into', () => {
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and).to.deep.equal([]);
    });
  });

  it('contributes nothing from a facet opted into but left blank', () => {
    const propSel = sel + '[data-search-path="#/string"] ';
    cy.get(propSel + 'input.jsoeSearchOptIn--Literal').check();
    cy.get(propSel + 'input.jsoeSearchOptIn--Regex').check();
    cy.get(propSel + 'input.jsoeSearchOptIn--NotContains').check();
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and).to.deep.equal([]);
    });
  });

  it('contributes nothing with no facet opted into under "Any of" too', () => {
    const propSel = sel + '[data-search-path="#/string"] ';
    cy.get(propSel + 'select.jsoeSearchCombinator--').select('or');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and).to.deep.equal([]);
    });
  });
});
