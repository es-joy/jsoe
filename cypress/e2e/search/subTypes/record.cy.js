describe('search: record/looseRecord spec', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
  });

  it('combines key/value matches under a joint flag (record)', () => {
    const sel = '#section-record ';
    cy.get(sel + 'input.jsoeSearchOptIn--key').check();
    cy.get(sel + 'input[name$="-value"]').type('x');
    cy.get(sel + 'input.jsoeSearchOptIn--value').check();
    cy.get(sel + 'input[name$="-gte"]').type('5');
    cy.get(sel + 'input[name$="-joint"]').check();
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      const leaf = query.$and[0];
      expect(leaf.kind).to.equal('mapRecordJoint');
      expect(leaf.joint).to.equal(true);
      expect(leaf.keyQuery).to.deep.equal({
        kind: 'literalSet', path: '#/*key', $in: ['x']
      });
      expect(leaf.valueQuery).to.deep.equal({
        kind: 'range', path: '#/*value', valueType: 'number', $gte: 5
      });
    });
  });

  it('contributes nothing when neither key nor value is opted into', () => {
    const sel = '#section-record ';
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and).to.deep.equal([]);
    });
  });

  it('shares the same widget for looseRecord', () => {
    const sel = '#section-looseRecord ';
    cy.get(sel + 'input.jsoeSearchOptIn--value').check();
    cy.get(sel + 'input[name$="-gte"]').type('9');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and[0]).to.deep.equal({
        kind: 'mapRecordJoint',
        path: '#',
        joint: false,
        valueQuery: {kind: 'range', path: '#/*value', valueType: 'number', $gte: 9}
      });
    });
  });
});
