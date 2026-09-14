describe('search: nan spec', () => {
  const sel = '#section-allTypes ';

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
    cy.get(sel + 'select.addPropertySelect').select('nan');
    cy.get(sel + 'button').contains('Add').click();
  });

  it('gets a presence query automatically (the checkbox is pre-checked and disabled)', () => {
    cy.get(sel + 'jsoe-search-nan input[type="checkbox"]').should('be.checked').and('be.disabled');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and[0]).to.deep.equal({
        kind: 'presence', path: '#/nan', $exists: true
      });
    });
  });

  it('drops the (permanently-checked) presence leaf entirely when "Doesn\'t have" is chosen', () => {
    cy.get(sel + 'select[name$="-hasProperty-nan"]').select('false');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and[0]).to.deep.equal({
        kind: 'hasProperty', path: '#/nan', $exists: false
      });
    });
  });
});
