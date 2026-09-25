describe('search: date spec', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-search-instrumented.html', {
      onBeforeLoad (win) {
        cy.stub(win.console, 'log').as('consoleLog');
      }
    });
  });

  const sel = '#section-date ';

  it('creates form control', () => {
    cy.get(sel + 'input[name$="-gte"]').should('exist');
    cy.get(sel + 'input[name$="-lte"]').should('exist');
  });

  it('sets the min/max HTML attributes from the schema', () => {
    // Proves `dateSearchType.js` is actually calling `dateType.js`'s
    // `buildDateInputControl` rather than a drifted re-implementation.
    cy.get(sel + 'input[name$="-gte"]').should(
      'have.attr', 'min', '2020-01-01T00:00'
    );
    cy.get(sel + 'input[name$="-gte"]').should(
      'have.attr', 'max', '2029-12-31T00:00'
    );
    cy.get(sel + 'input[name$="-lte"]').should(
      'have.attr', 'min', '2020-01-01T00:00'
    );
    cy.get(sel + 'input[name$="-lte"]').should(
      'have.attr', 'max', '2029-12-31T00:00'
    );
  });

  it('gets the query for a range typed into both inputs', () => {
    cy.clearTypeAndBlur(sel + 'input[name$="-gte"]', '2021-06-01T00:00');
    cy.clearTypeAndBlur(sel + 'input[name$="-lte"]', '2022-06-01T00:00');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and).to.have.length(1);
      const leaf = query.$and[0];
      expect(leaf.kind).to.equal('range');
      expect(leaf.valueType).to.equal('date');
      expect(leaf.$gte).to.equal(new Date('2021-06-01T00:00').toISOString());
      expect(leaf.$lte).to.equal(new Date('2022-06-01T00:00').toISOString());
    });
  });

  it('gets an empty query when nothing has been entered', () => {
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query).to.deep.equal({$and: []});
    });
  });

  it('gets a validDateCheck leaf (and no range leaf) for "Invalid date"', () => {
    cy.get(sel + 'select.jsoeSearchTriState--valid').select('false');
    cy.get(sel + '.getQueryButton').click();
    cy.get(sel + '.queryResult').then((elem) => {
      const query = JSON.parse(elem.text());
      expect(query.$and).to.deep.equal([
        {kind: 'validDateCheck', path: '#', isValid: false}
      ]);
    });
  });

  it('round-trips a one-sided range (gte only, no lte)', () => {
    cy.clearTypeAndBlur(sel + 'input[name$="-gte"]', '2021-06-01T00:00');
    cy.get(sel + '.loadQueryButton').click();
    cy.get(sel + 'input[name$="-gte"]').clear();
    cy.get(sel + '.applyQueryButton').click();
    cy.get(sel + '.queryRawEditorError').should('have.text', '');
    // The restored value's exact wall-clock display depends on the
    //   machine's local timezone (the round trip re-derives it from the
    //   captured UTC ISO string) - just confirm gte was restored to some
    //   real value and lte stayed clear, rather than pinning an exact
    //   string.
    cy.get(sel + 'input[name$="-gte"]').should(
      'not.have.value', ''
    );
    cy.get(sel + 'input[name$="-lte"]').should('have.value', '');
  });
});
