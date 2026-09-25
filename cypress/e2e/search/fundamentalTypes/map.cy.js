describe('search: map spec', () => {
  const sel = '#section-allTypes ';
  const mapSel = sel + 'jsoe-search-map[data-search-path="#/map"] ';

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
    cy.get(sel + 'select.addPropertySelect').select('map');
    cy.get(sel + 'button').contains('Add').click();
  });

  it('contributes nothing with no size, key, or value opted into', () => {
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and).to.deep.equal([]);
    });
  });

  it('combines key/value matches under a joint flag', () => {
    cy.get(mapSel + 'input.jsoeSearchOptIn--key').check();
    cy.get(mapSel + '[data-search-path="#/map/*key"] input[name$="-value"]').type('x');
    cy.get(mapSel + 'input.jsoeSearchOptIn--value').check();
    cy.get(mapSel + '[data-search-path="#/map/*value"] input[name$="-gte"]').type('5');
    cy.get(mapSel + 'input[name$="-joint"]').check();
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      const leaf = query.$and[0];
      expect(leaf.kind).to.equal('mapRecordJoint');
      expect(leaf.joint).to.equal(true);
      expect(leaf.keyQuery).to.deep.equal({
        kind: 'literalSet', path: '#/map/*key', $in: ['x']
      });
      expect(leaf.valueQuery).to.deep.equal({
        kind: 'range', path: '#/map/*value', valueType: 'number', $gte: 5
      });
    });
  });

  it('reports only the key match when the value is not opted into', () => {
    cy.get(mapSel + 'input.jsoeSearchOptIn--key').check();
    cy.get(mapSel + '[data-search-path="#/map/*key"] input[name$="-value"]').type('x');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      const leaf = query.$and[0];
      expect(leaf.kind).to.equal('mapRecordJoint');
      expect(leaf.keyQuery).to.deep.equal({
        kind: 'literalSet', path: '#/map/*key', $in: ['x']
      });
      expect(leaf.valueQuery).to.be.undefined;
    });
  });
});
