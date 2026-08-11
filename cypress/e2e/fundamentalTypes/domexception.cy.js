describe('DOMException spec', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-instrumented.html', {
      onBeforeLoad (win) {
        cy.stub(win.console, 'log').as('consoleLog');
      }
    });
  });
  it('creates form control', () => {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'domexception'
    );
    cy.get('input[name="demo-keypath-not-expected-domexception-name"]').should(
      'exist'
    );
  });

  it('sets a predefined type', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'domexception'
    );
    cy.clearTypeAndBlur(sel + '.name', 'SyntaxError');
    cy.get(
      sel + 'input[name="demo-keypath-not-expected-domexception-name"]'
    ).should(($input) => {
      expect($input.val()).to.equal('SyntaxError');
    });
  });

  it('gets type', function (done) {
    cy.on('window:alert', (t) => {
      expect(t).to.eq('domexception');
      done();
    });
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'domexception'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-domexception-name"]',
      'someName'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-domexception-message"]',
      'some message'
    );

    cy.get('button#getType').click();
  });

  it('is valid', function (done) {
    cy.on('window:alert', (t) => {
      expect(t).to.eq(true);
      done();
    });
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'domexception'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-domexception-name"]',
      'someName'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-domexception-message"]',
      'some message'
    );

    cy.get('button#isValid').click();
  });

  it('logs value', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'domexception'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-domexception-name"]',
      'someName'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-domexception-message"]',
      'some message'
    );

    cy.get('button#logValue').click();
    cy.get('@consoleLog').should(
      'be.calledWith', new DOMException('some message', 'someName')
    );
  });

  it('views UI', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'domexception'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-domexception-name"]',
      'someName'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-domexception-message"]',
      'some message'
    );

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults div[data-type="domexception"]').should(
      'contain', 'someName'
    );
    cy.get('#viewUIResults div[data-type="domexception"]').should(
      'contain', 'some message'
    );
  });

  describe('getInput()', function () {
    it('Shows the DOMException root form control', function () {
      const sel = '#formatAndTypeChoices ';

      cy.get(
        sel + 'select.typeChoices-demo-keypath-not-expected'
      ).select('domexception');

      cy.get('#showRootFormControl').click();

      cy.get(
        '#formatAndTypeChoices > .typesHolder > .typeContainer > ' +
        'div[data-type="domexception"] input:not([type])'
      ).should(($input) => {
        expect($input[0].style.backgroundColor).to.equal('red');
      });

      // eslint-disable-next-line cypress/no-unnecessary-waiting -- Needed
      cy.wait(3000);

      cy.get(
        '#formatAndTypeChoices > .typesHolder > .typeContainer > ' +
        'div[data-type="domexception"] input:not([type])'
      ).should(($input) => {
        expect($input[0].style.backgroundColor).to.not.equal('red');
      });
    });
  });

  it('gets value', function () {
    cy.clearTypeAndBlur(
      '#getValueForString',
      'DOMException({{}"name":"someName", "message": "some message"})'
    );
    cy.get('@consoleLog').should(
      'be.calledWith', new DOMException('some message', 'someName')
    );
  });

  // For the "Type choices with initial value set" control
  it('gets a value set onload', function () {
    cy.get(
      'input[name="demo-type-choices-only-initial-value-domexception-name"]'
    ).should(($input) => {
      expect($input.val()).to.equal('someName');
    });
  });
});

describe('DOMException spec (schemas)', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-schema-instrumented.html', {
      onBeforeLoad (win) {
        cy.stub(win.console, 'log').as('consoleLog');
      }
    });
  });

  it('views UI', function () {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 2');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'domexception'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-domexception-name"]',
      'someName'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-domexception-message"]',
      'some message'
    );

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults div[data-type="domexception"]').should(
      'contain', 'someName'
    );
    cy.get('#viewUIResults div[data-type="domexception"]').should(
      'contain', 'some message'
    );
    cy.get('#viewUIResults div[data-type="domexception"]').then((elem) => {
      expect(elem.attr('title')).to.equal('A DOMException');
    });
  });
});
