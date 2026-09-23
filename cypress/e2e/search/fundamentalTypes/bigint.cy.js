describe('search: bigint spec', () => {
  const sel = '#section-allTypes ';

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
    cy.get(sel + 'select.addPropertySelect').select('bigint');
    cy.get(sel + 'button').contains('Add').click();
  });

  it('gets a range query with decimal-string bounds', () => {
    cy.get(sel + 'input[name$="-gte"]').type('9007199254740993');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and[0]).to.deep.equal({
        kind: 'range', path: '#/bigint', valueType: 'bigint',
        $gte: '9007199254740993'
      });
    });
  });

  it('contributes nothing with neither bound filled in', () => {
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and).to.deep.equal([]);
    });
  });

  it('ignores an unparseable bound rather than throwing', () => {
    cy.get(sel + 'input[name$="-gte"]').type('not-a-bigint');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and).to.deep.equal([]);
    });
  });
});
