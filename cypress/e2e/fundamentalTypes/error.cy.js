/* eslint-disable unicorn/no-error-property-assignment -- Testing */
describe('error spec', () => {
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
      'error'
    );
    cy.get('input[name="demo-keypath-not-expected-error-message"]').should(
      'exist'
    );
  });

  it('Exposes `cause`', () => {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'error'
    );
    cy.get(sel + 'input.cause[type=checkbox]').click();

    cy.get(
      sel + '.typeContainer > [data-type=error] > .causeHolder > button'
    ).click();
    cy.get(
      sel + '.typeContainer > [data-type=error] > .causeHolder > .causeContents'
    ).should('be.hidden');
    cy.get(
      sel + '.typeContainer > [data-type=error] > .causeHolder > button'
    ).click();
    cy.get(
      sel + '.typeContainer > [data-type=error] > .causeHolder > .causeContents'
    ).should('not.be.hidden');
  });


  it('gets type', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'error'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-error-message"]',
      'message1'
    );

    cy.get('button#getType').click();
    cy.get('dialog[open]').should('include.text', 'error');
  });

  it('is valid', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'error'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-error-message"]',
      'message1'
    );
    cy.get('button#isValid').click();
    cy.get('dialog[open]').should('include.text', 'true');
  });

  it('logs value', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'error'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-error-message"]',
      'message1'
    );

    cy.get('button#logValue').click();
    const err = /**
                 * @type {Error & {
                 *   columnNumber: undefined,
                 *   lineNumber: undefined,
                 *   fileName: string
                 * }}
                 */ (new Error('message1'));
    err.columnNumber = undefined;
    err.lineNumber = undefined;
    err.fileName = ''; // Why defaulting to string?
    err.name = ''; // Why defaulting to string?
    err.stack = ''; // Why defaulting to string?
    cy.get('@consoleLog').should('be.calledWith', err);
  });

  it('views UI', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'error'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-error-message"]',
      'message1'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-error-name"]',
      'name1'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-error-fileName"]',
      'fileName1'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-error-lineNumber"]',
      '123'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-error-columnNumber"]',
      '456'
    );
    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-error-stack"]',
      'stack1'
    );

    // err.cause = undefined;

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults div[data-type="error"]').should('exist');
    cy.get(
      '#viewUIResults div[data-type="error"]'
    ).should('contain', 'message1');
    cy.get(
      '#viewUIResults div[data-type="error"]'
    ).should('contain', 'name1');
    cy.get(
      '#viewUIResults div[data-type="error"]'
    ).should('contain', 'fileName1');
    cy.get(
      '#viewUIResults div[data-type="error"]'
    ).should('contain', '123');
    cy.get(
      '#viewUIResults div[data-type="error"]'
    ).should('contain', '456');
    cy.get(
      '#viewUIResults div[data-type="error"]'
    ).should('contain', 'stack1');
  });

  it('views UI (empty fields)', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'error'
    );
    cy.get(
      sel + 'input.message[type=checkbox]'
    ).click();
    cy.get(
      sel + 'input.name[type=checkbox]'
    ).click();
    cy.get(
      sel + 'input.fileName[type=checkbox]'
    ).click();
    cy.get(
      sel + 'input.stack[type=checkbox]'
    ).click();

    // err.cause = undefined;

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults div[data-type="error"]').should('exist');
  });

  it('views UI (with a cause)', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'error'
    );
    cy.get(sel + 'input[type=checkbox].cause').click();
    cy.clearTypeAndBlur(
      sel + 'div[data-type="error"] div[data-type="error"] ' +
        'input[name=demo-keypath-not-expected-error-message]',
      'Cause message'
    );
    // eslint-disable-next-line cypress/no-unnecessary-waiting -- Wait to load
    cy.wait(500);
    cy.get('button#viewUI').click();

    cy.get(
      '#viewUIResults > [data-type="error"] > ' +
        '.causeHolder > button'
    ).click();
    cy.get(
      '#viewUIResults > [data-type=error] > .causeHolder ' +
        '> .causeContents'
    ).should('be.hidden');

    cy.get(
      '#viewUIResults > [data-type="error"] > ' +
        '.causeHolder > button'
    ).click();
    cy.get(
      '#viewUIResults > [data-type=error] > .causeHolder ' +
        '> .causeContents'
    ).should('not.be.hidden');
  });

  it('gets value', function () {
    cy.clearTypeAndBlur('#getValueForString', 'Error({{}"message": "abc1"})');
    const err = /**
                 * @type {Error & {
                 *   cause: undefined,
                 *   columnNumber: undefined,
                 *   fileName: undefined,
                 *   lineNumber: undefined
                 * }}
                 */ (new Error('abc1'));
    err.stack = '';
    err.cause = undefined;
    err.columnNumber = undefined;
    err.fileName = undefined;
    err.lineNumber = undefined;
    // @ts-expect-error -- Testing
    err.name = undefined;

    cy.get('@consoleLog').should('be.calledWith', err);
  });

  // For the "Type choices with initial value set" control
  it('gets a value set onload', function () {
    cy.get(
      'input[name="demo-type-choices-only-initial-value-error-message"]'
    ).should(($input) => {
      expect($input.val()).to.equal('msg');
    });

    cy.get(
      '[data-type=error] [data-type=error] [data-type=error] ' +
      'input[name="demo-type-choices-only-initial-value-error-message"]'
    ).should(($input) => {
      expect($input.val()).to.equal('some cause');
    });

    cy.get(
      '[data-type=error] [data-type=error] ' +
      'input[name="demo-type-choices-only-initial-value-' +
        'ErrorCause-error-message"]'
    ).should(($input) => {
      expect($input.val()).to.equal('some cause2');
    });
  });

  describe('getInput()', function () {
    it('Shows the error root form control', function () {
      const sel = '#formatAndTypeChoices ';

      cy.get(
        sel + 'select.typeChoices-demo-keypath-not-expected'
      ).select('error');

      cy.get('#showRootFormControl').click();

      cy.get(
        '#formatAndTypeChoices > .typesHolder > .typeContainer > ' +
        'div[data-type="error"] input:not([type])'
      ).should(($input) => {
        expect($input[0].style.backgroundColor).to.equal('red');
      });

      // eslint-disable-next-line cypress/no-unnecessary-waiting -- Needed
      cy.wait(3000);

      cy.get(
        '#formatAndTypeChoices > .typesHolder > .typeContainer > ' +
        'div[data-type="error"] input:not([type])'
      ).should(($input) => {
        expect($input[0].style.backgroundColor).to.not.equal('red');
      });
    });
  });
});

describe('Error spec (schemas)', () => {
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
      'error'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-error-message"]',
      'message1'
    );

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults div[data-type="error"]').should('exist');
    cy.get('#viewUIResults div[data-type="error"] .emphasis').then((elem) => {
      expect(elem.attr('title')).to.equal('(an Error)');
    });
  });
});
