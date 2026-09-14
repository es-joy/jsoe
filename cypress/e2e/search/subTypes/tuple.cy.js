describe('search: tuple spec', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
  });

  const sel = '#section-tupleRest ';

  it('gets a per-position match combined with the rest length/element match', () => {
    cy.get(sel + 'input.jsoeSearchOptIn--0').check();
    cy.get(sel + '[data-search-path="#/0"] input[name$="-value"]').type('abc');
    cy.get(sel + 'input.jsoeSearchOptIn--1').check();
    cy.get(sel + '[data-search-path="#/1"] input[name$="-gte"]').type('7');
    cy.get(sel + '[data-search-path="#"] input[name$="-size"]').type('4');
    cy.get(sel + 'input.jsoeSearchOptIn--rest').check();
    cy.get(sel + 'jsoe-search-boolean[data-search-path="#/*"] select').select('true');

    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      const leaf = query.$and[0];
      expect(leaf.$and).to.have.length(4);
      expect(leaf.$and).to.deep.include({
        kind: 'literalSet', path: '#/0', $in: ['abc']
      });
      expect(leaf.$and).to.deep.include({
        kind: 'range', path: '#/1', valueType: 'number', $gte: 7
      });
      expect(leaf.$and).to.deep.include({
        kind: 'lengthSize', path: '#', $size: 4
      });
      expect(leaf.$and).to.deep.include({
        kind: 'booleanEquals', path: '#/*', value: true
      });
    });
  });
});
