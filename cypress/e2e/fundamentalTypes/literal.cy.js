describe('literal (boolean) spec', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-schema-instrumented.html', {
      onBeforeLoad (win) {
        cy.stub(win.console, 'log').as('consoleLog');
      }
    });
  });
  it('creates form control', () => {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 2');

    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'Literal (Literal boolean)'
    );
    cy.get('input[name="demo-keypath-not-expected-boolean1"]').should(
      'exist'
    );
  });

  it('gets type', function (done) {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 2');
    cy.on('window:alert', (t) => {
      expect(t).to.eq('literal');
      done();
    });
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'Literal (Literal boolean)'
    );

    cy.get('button#getType').click();
  });

  it('is valid', function (done) {
    cy.on('window:alert', (t) => {
      expect(t).to.eq(true);
      done();
    });
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 2');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'Literal (Literal boolean)'
    );

    cy.get('button#isValid').click();
  });

  it('logs value', function () {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 2');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'Literal (Literal boolean)'
    );

    cy.get('button#logValue').click();
    cy.get('@consoleLog').should('be.calledWith', false);
  });

  it('views UI', function () {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 2');

    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'Literal (Literal boolean)'
    );

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults span[data-type="literal"]').should('exist');
    cy.get('#viewUIResults span[data-type="literal"]').should(
      'contain', 'false'
    );
    cy.get('#viewUIResults span[data-type="literal"]').then((elem) => {
      expect(elem.attr('title')).to.equal('Literal boolean');
    });
  });

  it('gets value', function () {
    cy.clearTypeAndBlur('#getValueForString', 'Literal(true)');
    cy.get('@consoleLog').should('be.calledWith', true);
  });

  it('gets value (false)', function () {
    cy.clearTypeAndBlur('#getValueForString', 'Literal(false)');
    cy.get('@consoleLog').should('be.calledWith', false);
  });

  // For the "Type choices with initial value set" control
  // it.skip('gets a value set onload', function () {
  //   cy.get(
  //     'input[name="demo-type-choices-only-initial-value-literal"]'
  //   ).should(($input) => {
  //     expect($input.val()).to.equal('135');
  //   });
  // });
});

describe('literal (number) spec', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-schema-instrumented.html', {
      onBeforeLoad (win) {
        cy.stub(win.console, 'log').as('consoleLog');
      }
    });
  });
  it('creates form control', () => {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 2');

    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'Literal (Literal number)'
    );
    cy.get('input[name="demo-keypath-not-expected-number"]').should(
      'exist'
    );
  });

  it('gets type', function (done) {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 2');
    cy.on('window:alert', (t) => {
      expect(t).to.eq('literal');
      done();
    });
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'Literal (Literal number)'
    );

    cy.get('button#getType').click();
  });

  it('is valid', function (done) {
    cy.on('window:alert', (t) => {
      expect(t).to.eq(true);
      done();
    });
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 2');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'Literal (Literal number)'
    );

    cy.get('button#isValid').click();
  });

  it('logs value', function () {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 2');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'Literal (Literal number)'
    );

    cy.get('button#logValue').click();
    cy.get('@consoleLog').should('be.calledWith', 135);
  });

  it('views UI', function () {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 2');

    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'Literal (Literal number)'
    );

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults span[data-type="literal"]').should('exist');
    cy.get('#viewUIResults span[data-type="literal"]').should('contain', '135');
    cy.get('#viewUIResults span[data-type="literal"]').then((elem) => {
      expect(elem.attr('title')).to.equal('Literal number');
    });
  });

  it('views UI (with no description)', function () {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 9');

    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'Literal'
    );

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults span[data-type="literal"]').should('exist');
    cy.get('#viewUIResults span[data-type="literal"]').should('contain', '135');
    cy.get('#viewUIResults span[data-type="literal"]').then((elem) => {
      expect(elem.attr('title')).to.equal('(a literal number)');
    });
  });

  it('gets value', function () {
    cy.clearTypeAndBlur('#getValueForString', 'Literal(123.45)');
    cy.get('@consoleLog').should('be.calledWith', 123.45);
  });

  // For the "Type choices with initial value set" control
  // it.skip('gets a value set onload', function () {
  //   cy.get(
  //     'input[name="demo-type-choices-only-initial-value-literal"]'
  //   ).should(($input) => {
  //     expect($input.val()).to.equal('135');
  //   });
  // });
});

describe('literal (string) spec', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-schema-instrumented.html', {
      onBeforeLoad (win) {
        cy.stub(win.console, 'log').as('consoleLog');
      }
    });
  });
  it('creates form control', () => {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 2');

    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'Literal (Literal string)'
    );
    cy.get('textarea[name="demo-keypath-not-expected-string"]').should(
      'exist'
    );
  });

  it('gets type', function (done) {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 2');
    cy.on('window:alert', (t) => {
      expect(t).to.eq('literal');
      done();
    });
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'Literal (Literal string)'
    );

    cy.get('button#getType').click();
  });

  it('is valid', function (done) {
    cy.on('window:alert', (t) => {
      expect(t).to.eq(true);
      done();
    });
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 2');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'Literal (Literal string)'
    );

    cy.get('button#isValid').click();
  });

  it('logs value', function () {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 2');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'Literal (Literal string)'
    );

    cy.get('button#logValue').click();
    cy.get('@consoleLog').should('be.calledWith', 'abcde');
  });

  it('views UI', function () {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 2');

    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'Literal (Literal string)'
    );

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults span[data-type="literal"]').should('exist');
    cy.get('#viewUIResults span[data-type="literal"]').should(
      'contain', 'abcde'
    );
    cy.get('#viewUIResults span[data-type="literal"]').then((elem) => {
      expect(elem.attr('title')).to.equal('Literal string');
    });
  });

  it('gets value', function () {
    cy.clearTypeAndBlur('#getValueForString', 'Literal("abcde")');
    cy.get('@consoleLog').should('be.calledWith', 'abcde');
  });

  // For the "Type choices with initial value set" control
  // it.skip('gets a value set onload', function () {
  //   cy.get(
  //     'input[name="demo-type-choices-only-initial-value-literal"]'
  //   ).should(($input) => {
  //     expect($input.val()).to.equal('abcde');
  //   });
  // });
});
