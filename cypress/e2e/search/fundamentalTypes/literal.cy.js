describe('search: literal spec', () => {
  const sel = '#section-allTypes ';

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
  });

  describe('single-value literal (`values: ["solo"]`)', () => {
    beforeEach(() => {
      cy.get(sel + 'select.addPropertySelect').select('literalSingle');
      cy.get(sel + 'button').contains('Add').click();
    });

    it(
      'labels the checkbox with the value\'s own `viewUI` (a plain ' +
        '`stringType.js` span), not a generic "present" string',
      () => {
        cy.get(
          sel + 'jsoe-search-literal span[data-type="string"]'
        ).should('have.text', 'solo');
        cy.get(
          sel + 'jsoe-search-literal input[type="checkbox"]'
        ).should('be.checked').and('be.disabled');
      }
    );

    it(
      'gets a presence query automatically, same as `undefined`/`null`/`NaN`',
      () => {
        cy.get(sel + '.getQueryButton').click();
        cy.get(sel + '.queryResult').then((elem) => {
          const query = JSON.parse(elem.text());
          expect(query.$and[0]).to.deep.equal({
            kind: 'presence', path: '#/literalSingle', $exists: true
          });
        });
      }
    );

    it(
      'drops the (permanently-checked) presence leaf entirely when ' +
        '"Doesn\'t have" is chosen',
      () => {
        cy.get(sel + 'select[name$="-hasProperty-literalSingle"]').select('false');
        cy.get(sel + '.getQueryButton').click();
        cy.get(sel + '.queryResult').then((elem) => {
          const query = JSON.parse(elem.text());
          expect(query.$and[0]).to.deep.equal({
            kind: 'hasProperty', path: '#/literalSingle', $exists: false
          });
        });
      }
    );
  });

  describe('multi-value, same-type literal (`values: ["red", "green"]`)', () => {
    beforeEach(() => {
      cy.get(sel + 'select.addPropertySelect').select('literal');
      cy.get(sel + 'button').contains('Add').click();
    });

    it('labels each option with its own quoted string value', () => {
      cy.get(
        sel + 'jsoe-search-literal select.jsoeSearchLiteralValues option'
      ).eq(0).should('have.text', '"red"');
      cy.get(
        sel + 'jsoe-search-literal select.jsoeSearchLiteralValues option'
      ).eq(1).should('have.text', '"green"');
    });

    it(
      'gets a `multiSelect` leaf for one or more chosen values - a ' +
        'particular literal, not a type category',
      () => {
        cy.get(
          sel + 'jsoe-search-literal select.jsoeSearchLiteralValues'
        ).select(['0', '1']);
        cy.get(sel + '.getQueryButton').click();
        cy.get(sel + '.queryResult').then((elem) => {
          const query = JSON.parse(elem.text());
          expect(query.$and[0]).to.deep.equal({
            kind: 'multiSelect', path: '#/literal', $in: ['red', 'green']
          });
        });
      }
    );

    it('contributes nothing when nothing is selected', () => {
      cy.get(sel + '.getQueryButton').click();
      cy.get(sel + '.queryResult').then((elem) => {
        const query = JSON.parse(elem.text());
        expect(query.$and).to.deep.equal([]);
      });
    });

    it('round-trips a saved `multiSelect` leaf back into the selected options', () => {
      cy.get(sel + '.queryRawEditor .cm-content').type(
        '{selectall}{{}$and: [{{}kind: "multiSelect", path: "#/literal", ' +
          '$in: ["green"]{}}]{}}'
      );
      cy.get(sel + '.applyQueryButton').click();
      cy.get(sel + '.queryRawEditorError').should('have.text', '');
      cy.get(
        sel + 'jsoe-search-literal select.jsoeSearchLiteralValues'
      ).invoke('val').should('deep.equal', ['1']);
    });
  });

  describe(
    'mixed-type literal (`values: ["a", "x".repeat(50), 1, true, 2n]`)',
    () => {
      beforeEach(() => {
        cy.get(sel + 'select.addPropertySelect').select('literalMixed');
        cy.get(sel + 'button').contains('Add').click();
      });

      it(
        'labels each option distinctly per JS type - a string quoted, a ' +
          'bigint `n`-suffixed, and truncates an over-length value',
        () => {
          const optSel = sel +
            'jsoe-search-literal select.jsoeSearchLiteralValues option';
          cy.get(optSel).eq(0).should('have.text', '"a"');
          cy.get(optSel).eq(1).should(
            'have.text', `"${'x'.repeat(39)}…`
          );
          cy.get(optSel).eq(2).should('have.text', '1');
          cy.get(optSel).eq(3).should('have.text', 'true');
          cy.get(optSel).eq(4).should('have.text', '2n');
        }
      );

      it(
        'gets a `multiSelect` leaf keeping a selected `bigint` as a ' +
          'decimal string (JSON-serializable, matching `bigintSearchType.js`)',
        () => {
          cy.get(
            sel + 'jsoe-search-literal select.jsoeSearchLiteralValues'
          ).select(['4']);
          cy.get(sel + '.getQueryButton').click();
          cy.get(sel + '.queryResult').then((elem) => {
            const query = JSON.parse(elem.text());
            expect(query.$and[0]).to.deep.equal({
              kind: 'multiSelect', path: '#/literalMixed', $in: ['2']
            });
          });
        }
      );
    }
  );
});
