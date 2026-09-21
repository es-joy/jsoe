describe('search: discriminatedUnion spec', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
  });

  const sel = '#section-discriminatedUnion ';

  it('labels branches by their discriminator value and carries it on the typeOf leaf', () => {
    cy.get(sel + 'select.jsoeSearchTypeOf option').should('have.length', 3);
    cy.get(sel + 'select.jsoeSearchTypeOf option').eq(1).should('have.text', 'event');
    cy.get(sel + 'select.jsoeSearchTypeOf option').eq(2).should('have.text', 'note');

    cy.get(sel + 'select.jsoeSearchTypeOf').select('0');
    cy.get(sel + 'select.addPropertySelect').select('when');
    cy.get(sel + 'button').contains('Add').click();
    cy.get(sel + 'select[name$="-hasProperty-when"]').select('true');

    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      const leaf = query.$and[0];
      expect(leaf.$and[0]).to.deep.equal({
        kind: 'typeOf', path: '#', searchType: 'object', discriminatorValue: 'event'
      });
      expect(leaf.$and[1]).to.deep.equal({
        kind: 'hasProperty', path: '#/when', $exists: true
      });
    });
  });

  it('contributes nothing with no branch selected', () => {
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and).to.deep.equal([]);
    });
  });
});
