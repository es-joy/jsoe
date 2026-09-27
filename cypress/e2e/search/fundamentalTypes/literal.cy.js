describe('search: literal spec', () => {
  const sel = '#section-allTypes ';

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
  });

  describe('single-type literal (`values: ["red", "green"]`)', () => {
    beforeEach(() => {
      cy.get(sel + 'select.addPropertySelect').select('literal');
      cy.get(sel + 'button').contains('Add').click();
    });

    it(
      'gets a presence query automatically (the checkbox is pre-checked ' +
        'and disabled), same as `undefined`/`null`/`NaN`',
      () => {
        cy.get(
          sel + 'jsoe-search-literal input[type="checkbox"]'
        ).should('be.checked').and('be.disabled');
        cy.get(sel + '.getQueryButton').click();
        cy.get(sel + '.queryResult').then((elem) => {
          const query = JSON.parse(elem.text());
          expect(query.$and[0]).to.deep.equal({
            kind: 'presence', path: '#/literal', $exists: true
          });
        });
      }
    );

    it(
      'drops the (permanently-checked) presence leaf entirely when ' +
        '"Doesn\'t have" is chosen',
      () => {
        cy.get(sel + 'select[name$="-hasProperty-literal"]').select('false');
        cy.get(sel + '.getQueryButton').click();
        cy.get(sel + '.queryResult').then((elem) => {
          const query = JSON.parse(elem.text());
          expect(query.$and[0]).to.deep.equal({
            kind: 'hasProperty', path: '#/literal', $exists: false
          });
        });
      }
    );
  });

  describe('mixed-type literal (`values: ["a", 1]`)', () => {
    beforeEach(() => {
      cy.get(sel + 'select.addPropertySelect').select('literalMixed');
      cy.get(sel + 'button').contains('Add').click();
    });

    it(
      'labels each type-group option by its own possible value(s), not ' +
        'its type name or a bare array index (deliberately undescribed)',
      () => {
        cy.get(
          sel + 'jsoe-search-literal select.jsoeSearchTypeOf option'
        ).eq(1).should('have.text', 'a');
        cy.get(
          sel + 'jsoe-search-literal select.jsoeSearchTypeOf option'
        ).eq(2).should('have.text', '1');
      }
    );

    it(
      'gets a bare `typeOf` leaf for the chosen type - no further branch ' +
        'widget, since every value of that type is already fully known',
      () => {
        cy.get(sel + 'jsoe-search-literal select.jsoeSearchTypeOf').select('1');
        cy.get(sel + '.getQueryButton').click();
        cy.get(sel + '.queryResult').then((elem) => {
          const query = JSON.parse(elem.text());
          expect(query.$and[0]).to.deep.equal({
            kind: 'typeOf', path: '#/literalMixed', searchType: 'number'
          });
        });
      }
    );

    it('contributes nothing when left at "(any)"', () => {
      cy.get(sel + '.getQueryButton').click();
      cy.get(sel + '.queryResult').then((elem) => {
        const query = JSON.parse(elem.text());
        expect(query.$and).to.deep.equal([]);
      });
    });

    it('round-trips a saved `typeOf` leaf back into the selected option', () => {
      cy.get(sel + '.queryRawEditor .cm-content').type(
        '{selectall}{{}$and: [{{}kind: "typeOf", path: "#/literalMixed", ' +
          'searchType: "string"{}}]{}}'
      );
      cy.get(sel + '.applyQueryButton').click();
      cy.get(sel + '.queryRawEditorError').should('have.text', '');
      cy.get(
        sel + 'jsoe-search-literal select.jsoeSearchTypeOf'
      ).should('have.value', '0');
    });
  });

  describe(
    'mixed-type literal with a same-typed group of several values ' +
      '(`values: ["a", "b", "x".repeat(50), 2]`)',
    () => {
      beforeEach(() => {
        cy.get(sel + 'select.addPropertySelect').select('literalMixedLong');
        cy.get(sel + 'button').contains('Add').click();
      });

      it(
        'comma-joins a group\'s several values and truncates the result ' +
          'once it exceeds the fallback label\'s fixed length',
        () => {
          cy.get(
            sel + 'jsoe-search-literal select.jsoeSearchTypeOf option'
          ).eq(1).should('have.text', `a, b, ${'x'.repeat(34)}…`);
          cy.get(
            sel + 'jsoe-search-literal select.jsoeSearchTypeOf option'
          ).eq(2).should('have.text', '2');
        }
      );
    }
  );
});
