describe('search: buffersource spec', () => {
  const sel = '#section-allTypes ';

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
    cy.get(sel + 'select.addPropertySelect').select('buffersource');
    cy.get(sel + 'button').contains('Add').click();
  });

  it('contributes nothing with neither bound filled in', () => {
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and).to.deep.equal([]);
    });
  });

  it('gets a byte-length range query', () => {
    cy.get(sel + 'jsoe-search-buffersource input[name$="-gte"]').type('100');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and[0]).to.deep.equal({
        kind: 'range', path: '#/buffersource', valueType: 'buffersource', $gte: 100
      });
    });
  });
});
