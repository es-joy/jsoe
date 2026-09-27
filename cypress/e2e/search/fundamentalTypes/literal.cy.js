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

  describe('single-value literal, null (`values: [null]`)', () => {
    beforeEach(() => {
      cy.get(sel + 'select.addPropertySelect').select('literalSingleNull');
      cy.get(sel + 'button').contains('Add').click();
    });

    it('labels the checkbox with the value\'s own `viewUI` ("null")', () => {
      cy.get(sel + 'jsoe-search-literal i[data-type="null"]').should('have.text', 'null');
    });
  });

  describe('single-value literal, undefined (`values: [undefined]`)', () => {
    beforeEach(() => {
      cy.get(sel + 'select.addPropertySelect').select('literalSingleUndefined');
      cy.get(sel + 'button').contains('Add').click();
    });

    it('labels the checkbox with the value\'s own `viewUI` ("undefined")', () => {
      cy.get(sel + 'jsoe-search-literal i[data-type="undef"]').should('have.text', 'undefined');
    });
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

    it('clears all selected options when applying a query with no match', () => {
      cy.get(sel + 'jsoe-search-literal select.jsoeSearchLiteralValues').select(['0']);
      cy.get(sel + '.queryRawEditor .cm-content').type('{selectall}{{}$and: []{}}');
      cy.get(sel + '.applyQueryButton').click();
      cy.get(sel + '.queryRawEditorError').should('have.text', '');
      cy.get(
        sel + 'jsoe-search-literal select.jsoeSearchLiteralValues option:selected'
      ).should('not.exist');
    });
  });

  describe(
    'mixed-type literal (`values: ["a", "x".repeat(50), 1, true, 2n, ' +
      'null, undefined]`)',
    () => {
      beforeEach(() => {
        cy.get(sel + 'select.addPropertySelect').select('literalMixed');
        cy.get(sel + 'button').contains('Add').click();
      });

      it(
        'labels each option distinctly per JS type - a string quoted, a ' +
          'bigint `n`-suffixed, `null`/`undefined` bare, and truncates an ' +
          'over-length value',
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
          cy.get(optSel).eq(5).should('have.text', 'null');
          cy.get(optSel).eq(6).should('have.text', 'undefined');
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

      it(
        'gets a `multiSelect` leaf covering the number/boolean/null/' +
          'undefined values too',
        () => {
          cy.get(
            sel + 'jsoe-search-literal select.jsoeSearchLiteralValues'
          ).select(['2', '3', '5', '6']);
          cy.get(sel + '.getQueryButton').click();
          cy.get(sel + '.queryResult').then((elem) => {
            const query = JSON.parse(elem.text());
            const leaf = query.$and[0];
            expect(leaf.kind).to.equal('multiSelect');
            expect(leaf.path).to.equal('#/literalMixed');
            // `null` and `undefined` both serialize to JSON `null`, so the
            // two are indistinguishable once round-tripped through
            // `JSON.stringify` here - this exercises `decodeLiteralValue`'s
            // own `number`/`boolean`/`null`/`undefined` cases, not their
            // downstream display fidelity.
            expect(leaf.$in).to.deep.equal([1, true, null, null]);
          });
        }
      );
    }
  );
});
