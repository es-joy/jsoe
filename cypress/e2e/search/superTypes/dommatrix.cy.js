describe('search: dommatrix spec', () => {
  const sel = '#section-allTypes ';

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
    cy.get(sel + 'select.addPropertySelect').select('dommatrix');
    cy.get(sel + 'button').contains('Add').click();
  });

  it('combines a dimension range with readonly and 3d toggles', () => {
    cy.get(sel + 'select.jsoeSearchTriState--dimension').select('true');
    cy.get(sel + 'input.jsoeSearchOptIn--m11').check();
    cy.get(sel + 'input.jsoeSearchRangeGte--m11').type('1');
    cy.get(sel + 'select.jsoeSearchTriState--readonly').select('false');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      const leaf = query.$and[0];
      expect(leaf.kind).to.equal('domShape');
      expect(leaf.readonlyCheck).to.equal(false);
      expect(leaf.dimensionCheck).to.equal(3);
      expect(leaf.dimensions.m11).to.deep.equal({
        kind: 'range', path: '#/dommatrix/m11', valueType: 'number', $gte: 1
      });
    });
  });

  it(
    'round-trips a dimension range without touching the 3d toggle',
    () => {
      cy.get(sel + 'input.jsoeSearchOptIn--a').check();
      cy.get(sel + 'input.jsoeSearchRangeGte--a').type('1');

      cy.get(sel + '.loadQueryButton').click();
      cy.get(sel + 'input.jsoeSearchRangeGte--a').clear();
      cy.get(sel + 'input.jsoeSearchRangeGte--a').type('2');
      cy.get(sel + '.applyQueryButton').click();
      cy.get(sel + '.queryRawEditorError').should('have.text', '');

      cy.get(sel + 'input.jsoeSearchRangeGte--a').should('have.value', '1');
      cy.get(
        sel + 'select.jsoeSearchTriState--dimension'
      ).should('have.value', '');
    }
  );

  it(
    'toggles the 2D/3D-only dimension fields oppositely as "Is 3d" changes',
    () => {
      // Unanswered: defaults to the 2D view (3D-only hidden, 2D-only shown).
      cy.get(sel + '.domShape2dOnlyDims').should('be.visible');
      cy.get(sel + '.domShape3dOnlyDims').should('be.hidden');

      cy.get(sel + 'select.jsoeSearchTriState--dimension').select('false');
      cy.get(sel + '.domShape2dOnlyDims').should('be.visible');
      cy.get(sel + '.domShape3dOnlyDims').should('be.hidden');

      cy.get(sel + 'select.jsoeSearchTriState--dimension').select('true');
      cy.get(sel + '.domShape2dOnlyDims').should('be.hidden');
      cy.get(sel + '.domShape3dOnlyDims').should('be.visible');

      cy.get(sel + 'select.jsoeSearchTriState--dimension').select('');
      cy.get(sel + '.domShape2dOnlyDims').should('be.visible');
      cy.get(sel + '.domShape3dOnlyDims').should('be.hidden');
    }
  );

  it(
    'drops a stale 3D-only dimension\'s range once switched back to ' +
      '"Not 3d", rather than contributing a contradictory constraint',
    () => {
      cy.get(sel + 'select.jsoeSearchTriState--dimension').select('true');
      cy.get(sel + 'input.jsoeSearchOptIn--m11').check();
      cy.get(sel + 'input.jsoeSearchRangeGte--m11').type('1');
      cy.get(sel + 'select.jsoeSearchTriState--dimension').select('false');
      cy.get(sel + '.domShape3dOnlyDims').should('be.hidden');

      cy.get(sel + '.getQueryButton').click();
      cy.get(sel + '.queryResult').then((elem) => {
        const query = JSON.parse(elem.text());
        const leaf = query.$and[0];
        expect(leaf.dimensionCheck).to.equal(2);
        expect(leaf.dimensions).to.deep.equal({});
      });
    }
  );

  it(
    'drops a stale 2D-only dimension\'s range once switched to "3d", ' +
      'rather than contributing a contradictory constraint',
    () => {
      cy.get(sel + 'input.jsoeSearchOptIn--a').check();
      cy.get(sel + 'input.jsoeSearchRangeGte--a').type('1');
      cy.get(sel + 'select.jsoeSearchTriState--dimension').select('true');
      cy.get(sel + '.domShape2dOnlyDims').should('be.hidden');

      cy.get(sel + '.getQueryButton').click();
      cy.get(sel + '.queryResult').then((elem) => {
        const query = JSON.parse(elem.text());
        const leaf = query.$and[0];
        expect(leaf.dimensionCheck).to.equal(3);
        expect(leaf.dimensions).to.deep.equal({});
      });
    }
  );

  it(
    'still reads every dim while "Is 3d" is unanswered, same as a plain ' +
      '`domrect`/`dompoint` widget with no 2D/3D split',
    () => {
      cy.get(sel + 'input.jsoeSearchOptIn--a').check();
      cy.get(sel + 'input.jsoeSearchRangeGte--a').type('1');
      cy.get(sel + '.getQueryButton').click();
      cy.get(sel + '.queryResult').then((elem) => {
        const query = JSON.parse(elem.text());
        const leaf = query.$and[0];
        expect(leaf.dimensionCheck).to.be.undefined;
        expect(leaf.dimensions.a).to.deep.equal({
          kind: 'range', path: '#/dommatrix/a', valueType: 'number', $gte: 1
        });
      });
    }
  );

  it(
    'reveals the 3D-only fields again when applying a saved query whose ' +
      '`dimensionCheck` is 3',
    () => {
      cy.get(sel + '.queryRawEditor .cm-content').type(
        '{selectall}{{}$and: [{{}kind: "domShape", path: "#/dommatrix", ' +
          'dimensions: {{}{}}, dimensionCheck: 3{}}]{}}'
      );
      cy.get(sel + '.applyQueryButton').click();
      cy.get(sel + '.queryRawEditorError').should('have.text', '');
      cy.get(sel + 'select.jsoeSearchTriState--dimension').should(
        'have.value', 'true'
      );
      cy.get(sel + '.domShape3dOnlyDims').should('be.visible');
      cy.get(sel + '.domShape2dOnlyDims').should('be.hidden');
    }
  );
});
