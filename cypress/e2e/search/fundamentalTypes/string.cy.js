describe('search: string spec', () => {
  const sel = '#section-allTypes ';

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
    cy.get(sel + 'select.addPropertySelect').select('string');
    cy.get(sel + 'button').contains('Add').click();
  });

  it('gets a literalSet query by default', () => {
    const propSel = sel + '[data-search-path="#/string"] ';
    cy.get(propSel + 'input[name$="-value"]').type('abc, def');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and[0]).to.deep.equal({
        kind: 'literalSet', path: '#/string', $in: ['abc', 'def']
      });
    });
  });

  it('gets a regex query when that mode is selected', () => {
    const propSel = sel + '[data-search-path="#/string"] ';
    cy.get(propSel + 'select[name$="-mode"]').select('regex');
    cy.get(propSel + 'input[name$="-value"]').type('^abc$');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and[0]).to.deep.equal({
        kind: 'regex', path: '#/string', $regex: '^abc$'
      });
    });
  });

  it('gets a notContains query when that mode is selected', () => {
    const propSel = sel + '[data-search-path="#/string"] ';
    cy.get(propSel + 'select[name$="-mode"]').select('notContains');
    cy.get(propSel + 'input[name$="-value"]').type('badword');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and[0]).to.deep.equal({
        kind: 'notContains', path: '#/string', value: 'badword'
      });
    });
  });

  it('round-trips a notContains mode/value through "Edit raw"', () => {
    const propSel = sel + '[data-search-path="#/string"] ';
    cy.get(propSel + 'select[name$="-mode"]').select('notContains');
    cy.get(propSel + 'input[name$="-value"]').type('badword');
    cy.get(sel + '.loadQueryButton').click();

    cy.get(propSel + 'select[name$="-mode"]').select('literal');
    cy.get(propSel + 'input[name$="-value"]').clear();

    cy.get(sel + '.applyQueryButton').click();
    cy.get(sel + '.queryRawEditorError').should('have.text', '');
    cy.get(propSel + 'select[name$="-mode"]').should('have.value', 'notContains');
    cy.get(propSel + 'input[name$="-value"]').should('have.value', 'badword');
  });

  it('allows flags once "Matches regex" is chosen, hidden otherwise', () => {
    const propSel = sel + '[data-search-path="#/string"] ';
    cy.get(propSel + 'select.jsoeSearchRegexFlags--').should('not.be.visible');

    cy.get(propSel + 'select[name$="-mode"]').select('regex');
    cy.get(propSel + 'input[name$="-value"]').type('^abc$');
    cy.get(propSel + 'select.jsoeSearchRegexFlags--').should('be.visible').select(['i', 'm']);
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and[0]).to.deep.equal({
        kind: 'regex', path: '#/string', $regex: '^abc$', $options: 'im'
      });
    });
  });
});
