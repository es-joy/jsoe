describe('search: object spec', () => {
  const sel = '#section-allTypes ';

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html');
    cy.get(sel + 'select.addPropertySelect').select('object');
    cy.get(sel + 'button').contains('Add').click();
  });

  it('combines a has-property toggle with the nested property\'s own widget', () => {
    const nestedSel = sel + 'jsoe-search-object[data-search-path="#/object"] ';
    cy.get(nestedSel + 'select.addPropertySelect').select('nested');
    cy.get(nestedSel + 'button').contains('Add').click();
    cy.get(nestedSel + 'select[name$="-hasProperty-nested"]').select('true');
    cy.get(nestedSel + 'input[name$="-value"]').type('hello');

    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      const leaf = query.$and[0];
      expect(leaf.$and).to.have.length(2);
      expect(leaf.$and[0]).to.deep.equal({
        kind: 'hasProperty', path: '#/object/nested', $exists: true
      });
      expect(leaf.$and[1]).to.deep.equal({
        kind: 'literalSet', path: '#/object/nested', $in: ['hello']
      });
    });
  });

  it('hides the nested widget while "Doesn\'t have" is chosen', () => {
    const nestedSel = sel + 'jsoe-search-object[data-search-path="#/object"] ';
    cy.get(nestedSel + 'select.addPropertySelect').select('nested');
    cy.get(nestedSel + 'button').contains('Add').click();

    const childSel = nestedSel +
      'jsoe-search-string[data-search-path="#/object/nested"]';
    cy.get(childSel).should('be.visible');

    cy.get(nestedSel + 'select[name$="-hasProperty-nested"]').select('false');
    cy.get(childSel).should('be.hidden');

    cy.get(nestedSel + 'select[name$="-hasProperty-nested"]').select('true');
    cy.get(childSel).should('be.visible');

    cy.get(nestedSel + 'select[name$="-hasProperty-nested"]').select('');
    cy.get(childSel).should('be.visible');
  });

  it(
    'skips the child\'s own query entirely once "Doesn\'t have" is chosen',
    () => {
      const nestedSel = sel + 'jsoe-search-object[data-search-path="#/object"] ';
      cy.get(nestedSel + 'select.addPropertySelect').select('nested');
      cy.get(nestedSel + 'button').contains('Add').click();
      cy.get(nestedSel + 'input[name$="-value"]').type('hello');
      cy.get(nestedSel + 'select[name$="-hasProperty-nested"]').select('false');

      cy.get(sel + '.getQueryButton').click();
      cy.get(sel + '.queryResult').then((elem) => {
        const query = JSON.parse(elem.text());
        expect(query.$and[0]).to.deep.equal({
          kind: 'hasProperty', path: '#/object/nested', $exists: false
        });
      });
    }
  );

  it(
    'does nothing when "Add" is clicked with no property selected yet',
    () => {
      const nestedSel = sel + 'jsoe-search-object[data-search-path="#/object"] ';
      cy.get(nestedSel + 'button').contains('Add').click();
      cy.get(nestedSel + 'jsoe-search-has-property').should('not.exist');
    }
  );

  it('lets an added property be removed and re-added', () => {
    const nestedSel = sel + 'jsoe-search-object[data-search-path="#/object"] ';
    const rowSel = nestedSel +
      'jsoe-search-has-property[data-property-name="nested"]';

    cy.get(nestedSel + 'select.addPropertySelect').select('nested');
    cy.get(nestedSel + 'button').contains('Add').click();
    cy.get(rowSel).should('exist');
    cy.get(nestedSel + 'select.addPropertySelect option[value="nested"]').should('be.disabled');

    cy.get(rowSel + ' button.removePropertyButton').click();
    cy.get(rowSel).should('not.exist');
    cy.get(nestedSel + 'select.addPropertySelect option[value="nested"]').should('not.be.disabled');

    cy.get(nestedSel + 'select.addPropertySelect').select('nested');
    cy.get(nestedSel + 'button').contains('Add').click();
    cy.get(rowSel).should('exist');
  });

  it(
    'gets/applies a query for a nested object with only required ' +
      'properties (no "add property" select to fall back from)',
    () => {
      // `.eq(0)`: the "object" property already added by `beforeEach` has
      //   its own nested "add property" select too - the outer one is
      //   first in document order.
      cy.get(sel + 'select.addPropertySelect').eq(0).select('objectAllRequired');
      cy.get(sel + 'button').contains('Add').click();

      const nestedSel =
        sel + 'jsoe-search-object[data-search-path="#/objectAllRequired"] ';
      cy.get(nestedSel + 'select.addPropertySelect').should('not.exist');

      const rowSel = nestedSel +
        'jsoe-search-required-property[data-property-name="req"] ';
      cy.get(rowSel + 'input.jsoeSearchCheckbox').check();
      cy.get(rowSel + 'input[name$="-value"]').type('hello');

      cy.get(sel + '.getQueryButton').click();
      cy.get(sel + '.queryResult').then((elem) => {
        const query = JSON.parse(elem.text());
        expect(query.$and[0]).to.deep.equal({
          kind: 'literalSet', path: '#/objectAllRequired/req', $in: ['hello']
        });
      });

      cy.get(sel + '.loadQueryButton').click();
      cy.get(sel + '.applyQueryButton').click();
      cy.get(sel + '.queryRawEditorError').should('have.text', '');
      cy.get(rowSel + 'input[name$="-value"]').should('have.value', 'hello');
    }
  );

  it(
    'contributes nothing for an object schema with no properties at all',
    () => {
      cy.get(sel + 'select.addPropertySelect').eq(0).select('objectEmpty');
      cy.get(sel + 'button').contains('Add').click();

      cy.get(sel + '.getQueryButton').click();
      cy.get(sel + '.queryResult').then((elem) => {
        const query = JSON.parse(elem.text());
        expect(query.$and).to.deep.equal([]);
      });
    }
  );

  it('shows a required property\'s own widget directly, disabled until opted into', () => {
    const rowSel = sel + 'jsoe-search-required-property[data-property-name="requiredString"] ';
    const childSel = rowSel + 'jsoe-search-string[data-search-path="#/requiredString"]';
    cy.get(childSel).should('be.visible');
    cy.get(childSel + ' input[name$="-value"]').should('be.disabled');
    cy.get(sel + 'select[name$="-hasProperty-requiredString"]').should('not.exist');
    cy.get(sel + 'select.addPropertySelect option[value="requiredString"]').should('not.exist');

    cy.get(rowSel + 'input.jsoeSearchCheckbox').check();
    cy.get(childSel + ' input[name$="-value"]').should('not.be.disabled');

    cy.get(rowSel + 'input.jsoeSearchCheckbox').uncheck();
    cy.get(childSel + ' input[name$="-value"]').should('be.disabled');
  });
});
