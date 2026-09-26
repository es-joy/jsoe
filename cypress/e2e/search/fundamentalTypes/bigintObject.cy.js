describe('search: bigint object spec', () => {
  const sel = '#section-allTypes ';

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
    cy.get(sel + 'select.addPropertySelect').select('bigintObject');
    cy.get(sel + 'button').contains('Add').click();
  });

  it(
    'gets a range query with decimal-string bounds - a boxed `BigInt` ' +
      'searches exactly like a plain bigint',
    () => {
      cy.get(sel + 'input[name$="-gte"]').type('9007199254740993');
      cy.get(sel + '.getQueryButton').click();
      cy.get(sel + '.queryResult').then((elem) => {
        const query = JSON.parse(elem.text());
        expect(query.$and[0]).to.deep.equal({
          kind: 'range', path: '#/bigintObject', valueType: 'bigint',
          $gte: '9007199254740993'
        });
      });
    }
  );

  it('contributes nothing with neither bound filled in', () => {
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and).to.deep.equal([]);
    });
  });

  it(
    'carries its own `bigintObject` search-kind (styled the same as ' +
      'plain `bigint` in `jsoe.css`, not sharing its literal attribute ' +
      'value)',
    () => {
      cy.get(sel + 'jsoe-search-bigint[data-search-path="#/bigintObject"]').
        should('have.attr', 'data-search-kind', 'bigintObject');
    }
  );
});
