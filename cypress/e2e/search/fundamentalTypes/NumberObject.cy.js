describe('search: number object spec', () => {
  const sel = '#section-allTypes ';

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
    cy.get(sel + 'select.addPropertySelect').select('numberObject');
    cy.get(sel + 'button').contains('Add').click();
  });

  it(
    'gets a range + integer-check query - a boxed `Number` searches ' +
      'exactly like a plain number',
    () => {
      cy.get(sel + 'input[name$="-gte"]').type('5');
      cy.get(sel + 'select[name$="-integer"]').select('true');
      cy.get(sel + '.getQueryButton').click();
      cy.get(sel + '.queryResult').then((elem) => {
        const query = JSON.parse(elem.text());
        const leaf = query.$and[0];
        expect(leaf.$and).to.have.length(2);
        expect(leaf.$and[0]).to.deep.equal({
          kind: 'range', path: '#/numberObject', valueType: 'number', $gte: 5
        });
        expect(leaf.$and[1]).to.deep.equal({
          kind: 'integerCheck', path: '#/numberObject', isInteger: true
        });
      });
    }
  );

  it('contributes nothing with neither a range nor the integer check set', () => {
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and).to.deep.equal([]);
    });
  });

  it(
    'carries its own `NumberObject` search-kind (styled the same as ' +
      '`BooleanObject`/`StringObject` in `jsoe.css`, not sharing plain ' +
      '`number`\'s own attribute value)',
    () => {
      cy.get(sel + 'jsoe-search-number').should(
        'have.attr', 'data-search-kind', 'NumberObject'
      );
    }
  );
});
