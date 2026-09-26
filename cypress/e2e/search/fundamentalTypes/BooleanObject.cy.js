describe('search: boolean object spec', () => {
  const sel = '#section-allTypes ';

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
    cy.get(sel + 'select.addPropertySelect').select('booleanObject');
    cy.get(sel + 'button').contains('Add').click();
  });

  it('contributes nothing when nothing is opted in', () => {
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and).to.deep.equal([]);
    });
  });

  it(
    'carries its own `BooleanObject` search-kind (styled the same as ' +
      'plain `boolean` in `jsoe.css`, not sharing its literal attribute ' +
      'value)',
    () => {
      cy.get(sel + 'jsoe-search-boolean').should(
        'have.attr', 'data-search-kind', 'BooleanObject'
      );
    }
  );

  it(
    'gets a booleanEquals query - a boxed `Boolean` searches exactly like ' +
      'a plain boolean',
    () => {
      cy.get(sel + 'jsoe-search-boolean select').select('true');
      cy.get(sel + '.getQueryButton').click();
      cy.get(sel + '.queryResult').then((elem) => {
        const query = JSON.parse(elem.text());
        expect(query.$and[0]).to.deep.equal({
          kind: 'booleanEquals', path: '#/booleanObject', value: true
        });
      });
    }
  );
});
