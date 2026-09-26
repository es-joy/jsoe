describe('search: number spec', () => {
  const sel = '#section-allTypes ';

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
    cy.get(sel + 'select.addPropertySelect').select('number');
    cy.get(sel + 'button').contains('Add').click();
  });

  it('gets a range + integer-check query', () => {
    cy.get(sel + 'input[name$="-gte"]').type('5');
    cy.get(sel + 'select[name$="-integer"]').select('true');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      const leaf = query.$and[0];
      expect(leaf.$and).to.have.length(2);
      expect(leaf.$and[0]).to.deep.equal({
        kind: 'range', path: '#/number', valueType: 'number', $gte: 5
      });
      expect(leaf.$and[1]).to.deep.equal({
        kind: 'integerCheck', path: '#/number', isInteger: true
      });
    });
  });

  it('gets a bare range query with the integer check left at "(any)"', () => {
    cy.get(sel + 'input[name$="-gte"]').type('5');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and[0]).to.deep.equal({
        kind: 'range', path: '#/number', valueType: 'number', $gte: 5
      });
    });
  });

  it('gets a range query for the lte bound alone', () => {
    cy.get(sel + 'input[name$="-lte"]').type('10');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and[0]).to.deep.equal({
        kind: 'range', path: '#/number', valueType: 'number', $lte: 10
      });
    });
  });

  it('contributes nothing with neither a range nor the integer check set', () => {
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and).to.deep.equal([]);
    });
  });
});
