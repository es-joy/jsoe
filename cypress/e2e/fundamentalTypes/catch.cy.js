describe('Catch spec (schemas)', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-schema-instrumented.html', {
      onBeforeLoad (win) {
        cy.stub(win.console, 'log').as('consoleLog');
      }
    });
  });

  it('views UI', function () {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 10');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'Catch (A catch)'
    );

    cy.clearTypeAndBlur(
      sel + 'textarea[name="demo-keypath-not-expected-string"]',
      'xyz'
    );

    cy.get(
      sel + 'div[data-type="catch"]'
    ).should(($elem) => {
      expect($elem.attr('title')).to.equal('A catch');
    });

    cy.get('button#viewUI').click();
    cy.get(
      '#viewUIResults .defaultValue > span'
    ).should(($elem) => {
      expect($elem.text()).to.equal('xyz');
      expect($elem.attr('title')).to.equal('An overpassed string');
    });

    cy.get(
      '#viewUIResults .catchValue > span'
    ).should(($elem) => {
      expect($elem.text()).to.equal('abc');
      expect($elem.attr('title')).to.equal('(catch value)');
    });

    cy.get(
      '#viewUIResults span[data-type="catch"]'
    ).should(($elem) => {
      expect($elem.attr('title')).to.equal('A catch');
    });
  });

  it('views UI (without description)', function () {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 11');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'Catch'
    );

    cy.clearTypeAndBlur(
      sel + 'textarea[name="demo-keypath-not-expected-string"]',
      'xyz'
    );

    cy.get(
      sel + 'div[data-type="catch"]'
    ).should(($elem) => {
      expect($elem.attr('title')).to.equal('(a `catch`)');
    });

    cy.get('button#viewUI').click();
    cy.get(
      '#viewUIResults .defaultValue > span'
    ).should(($elem) => {
      expect($elem.text()).to.equal('xyz');
      expect($elem.attr('title')).to.equal('(a string)');
    });

    cy.get(
      '#viewUIResults .catchValue > span'
    ).should(($elem) => {
      expect($elem.text()).to.equal('abc');
      expect($elem.attr('title')).to.equal('(catch value)');
    });

    cy.get(
      '#viewUIResults span[data-type="catch"]'
    ).should(($elem) => {
      expect($elem.attr('title')).to.equal('(a catch)');
    });
  });

  it('gets value (number)', function () {
    cy.clearTypeAndBlur('#getValueForString', 'catch(123)');
    cy.get('@consoleLog').should('be.calledWith', 123);
  });

  it('gets value (string)', function () {
    cy.clearTypeAndBlur('#getValueForString', 'catch("abc")');
    cy.get('@consoleLog').should('be.calledWith', 'abc');
  });
});
