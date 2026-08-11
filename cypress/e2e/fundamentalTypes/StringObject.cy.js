describe('StringObject spec', () => {
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
      'StringObject'
    );
    cy.get('textarea[name="demo-keypath-not-expected-StringObject"]').should(
      'exist'
    );
  });

  it('gets type', function (done) {
    cy.on('window:alert', (t) => {
      expect(t).to.eq('StringObject');
      done();
    });
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'StringObject'
    );
    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-StringObject"]',
      'test123'
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
      'StringObject'
    );
    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-StringObject"]',
      'test123'
    );
    cy.get('button#isValid').click();
  });

  it('logs value', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'StringObject'
    );
    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-StringObject"]',
      'test123'
    );

    cy.get('button#logValue').click();
    // eslint-disable-next-line no-new-wrappers, unicorn/new-for-builtins -- Testing
    cy.get('@consoleLog').should('be.calledWith', new String('test123'));
  });

  it('views UI', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'StringObject'
    );
    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-StringObject"]',
      'test123'
    );

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults span[data-type="StringObject"]').should('exist');
    cy.get('#viewUIResults span[data-type="StringObject"]').should(
      'contain', 'test123'
    );
  });

  it('gets value', function () {
    cy.clearTypeAndBlur('#getValueForString', '"test123"');
    cy.get('@consoleLog').should('be.calledWith', 'test123');
  });

  // For the "Type choices with initial value set" control
  it('gets a value set onload', function () {
    cy.get(
      'textarea[name="demo-type-choices-only-initial-value-StringObject"]'
    ).should(($textarea) => {
      expect($textarea.val()).to.equal('test123');
    });
  });
});

describe('StringObject spec (schemas)', () => {
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
      'StringObject'
    );
    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-StringObject"]',
      'test123'
    );

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults span[data-type="StringObject"]').should('exist');
    cy.get('#viewUIResults span[data-type="StringObject"]').should(
      'contain', 'test123'
    );
    cy.get('#viewUIResults span[data-type="StringObject"]').then((elem) => {
      expect(elem.attr('title')).to.equal('A String object');
    });
  });
});
