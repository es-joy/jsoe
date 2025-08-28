describe('regexp spec', () => {
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
      'regexp'
    );
    cy.get('input[name="demo-keypath-not-expected-regexp"]').should(
      'exist'
    );
  });

  it('gets type', function (done) {
    cy.on('window:alert', (t) => {
      expect(t).to.eq('regexp');
      done();
    });
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'regexp'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-regexp"]',
      '.*?'
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
      'regexp'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-regexp"]',
      '.*?'
    );
    cy.get('button#isValid').click();
  });

  it('is invalid', function (done) {
    cy.on('window:alert', (t) => {
      expect(t).to.eq(false);
      done();
    });
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'regexp'
    );
    cy.get(sel + 'div[data-type="regexp"] select').select(['u']);
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-regexp"]',
      '{'
    );
    cy.get('button#isValid').click();
  });

  it('logs value', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'regexp'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-regexp"]',
      '.*?'
    );

    cy.get('button#logValue').click();
    // eslint-disable-next-line require-unicode-regexp, sonarjs/no-empty-after-reluctant -- Testing
    cy.get('@consoleLog').should('be.calledWith', /.*?/);
  });

  it('logs value with flags', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'regexp'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-regexp"]',
      '.*?'
    );
    cy.get(sel + 'div[data-type="regexp"] select').select(['u', 'g']);

    cy.get('button#logValue').click();
    // eslint-disable-next-line sonarjs/no-empty-after-reluctant -- Testing
    cy.get('@consoleLog').should('be.calledWith', /.*?/gu);
  });

  it('views UI', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'regexp'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-regexp"]',
      '.*?'
    );

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults i[data-type="regexp"]').should('exist');
    cy.get('#viewUIResults i[data-type="regexp"]').should('contain', '.*?');
  });

  it('gets value', function () {
    cy.clearTypeAndBlur('#getValueForString', '/.*?/');
    // eslint-disable-next-line require-unicode-regexp, sonarjs/no-empty-after-reluctant -- Testing
    cy.get('@consoleLog').should('be.calledWith', /.*?/);
  });

  // For the "Type choices with initial value set" control
  it('gets a value set onload', function () {
    cy.get(
      'input[name="demo-type-choices-only-initial-value-regexp"]'
    ).should(($input) => {
      expect($input.val()).to.equal('.*?');
    });
  });
});

describe('regexp spec (schemas)', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-schema-instrumented.html', {
      onBeforeLoad (win) {
        cy.stub(win.console, 'log').as('consoleLog');
      }
    });
  });

  it('views UI', function () {
    cy.get('.formatChoices:first').select('Schema: Zodex schema instance 2');

    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'RegExp (A RegExp)'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-regexp"]',
      'abc'
    );
    cy.get('[data-type="regexp"] select').select(['g', 'm']);

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults i[data-type="regexp"]').should('exist');
    cy.get('#viewUIResults i[data-type="regexp"]').should(
      'contain', '/abc/gm'
    );
    cy.get('#viewUIResults i[data-type="regexp"]').then((elem) => {
      expect(elem.attr('title')).to.equal('A RegExp');
    });
  });
});
