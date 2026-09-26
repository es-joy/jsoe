describe('search: string object spec', () => {
  const sel = '#section-allTypes ';

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
    cy.get(sel + 'select.addPropertySelect').select('stringObject');
    cy.get(sel + 'button').contains('Add').click();
  });

  it(
    'gets a literalSet query by default - a boxed `String` searches ' +
      'exactly like a plain string',
    () => {
      const propSel = sel + '[data-search-path="#/stringObject"] ';
      cy.get(propSel + 'input[name$="-value"]').type('abc, def');
      cy.get(sel + '.getQueryButton').click();
      cy.get(sel + '.queryResult').then((elem) => {
        const query = JSON.parse(elem.text());
        expect(query.$and[0]).to.deep.equal({
          kind: 'literalSet', path: '#/stringObject', $in: ['abc', 'def']
        });
      });
    }
  );

  it('contributes nothing when nothing is typed in', () => {
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and).to.deep.equal([]);
    });
  });

  it(
    'carries its own `StringObject` search-kind (styled the same as ' +
      '`BooleanObject`/`NumberObject` in `jsoe.css`, not sharing plain ' +
      '`string`\'s own attribute value)',
    () => {
      cy.get(sel + 'jsoe-search-string[data-search-path="#/stringObject"]').should(
        'have.attr', 'data-search-kind', 'StringObject'
      );
    }
  );
});
