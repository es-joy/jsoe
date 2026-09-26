describe('search: intersection resolution', () => {
  const sel = '#section-allTypes ';

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
  });

  it(
    'renders a plain widget when the intersection resolves to exactly ' +
      'one type',
    () => {
      cy.get(sel + 'select.addPropertySelect').select('intersectionSingle');
      cy.get(sel + 'button').contains('Add').click();

      cy.get(
        sel + 'jsoe-search-string[data-search-path="#/intersectionSingle"]'
      ).should('exist');

      cy.get(
        sel + '[data-search-path="#/intersectionSingle"] ' +
          'input.jsoeSearchValue--'
      ).type('abc');
      cy.get(sel + '.getQueryButton').click();
      cy.get(sel + '.queryResult').then((elem) => {
        const query = JSON.parse(elem.text());
        expect(query.$and[0]).to.deep.equal({
          kind: 'literalSet', path: '#/intersectionSingle', $in: ['abc']
        });
      });
    }
  );

  it(
    'renders a union widget when the intersection resolves to more than ' +
      'one distinguishable type',
    () => {
      cy.get(sel + 'select.addPropertySelect').select('intersectionMulti');
      cy.get(sel + 'button').contains('Add').click();

      const unionSel = sel +
        'jsoe-search-union[data-search-path="#/intersectionMulti"] ';
      cy.get(unionSel + 'select.jsoeSearchTypeOf option').should(
        'have.length', 3
      );

      cy.get(unionSel + 'select.jsoeSearchTypeOf').select('0');
      cy.get(
        unionSel + 'jsoe-search-required-property[data-property-name="intersectionA"] ' +
          'input.jsoeSearchCheckbox'
      ).check();
      cy.get(
        unionSel + 'jsoe-search-string[data-search-path="#/intersectionMulti/intersectionA"] ' +
          'input.jsoeSearchValue--'
      ).type('xyz');

      cy.get(sel + '.getQueryButton').click();
      cy.get(sel + '.queryResult').then((elem) => {
        const query = JSON.parse(elem.text());
        const leaf = query.$and[0];
        expect(leaf.$and[0]).to.deep.equal({
          kind: 'typeOf', path: '#/intersectionMulti', searchType: 'object'
        });
      });
    }
  );
});
