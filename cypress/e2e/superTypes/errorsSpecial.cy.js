/* eslint-disable unicorn/no-error-property-assignment -- Testing */
describe('Special Errors spec', () => {
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
      'errors'
    );
    cy.get('input[name="demo-keypath-not-expected-errors-message"]').should(
      'exist'
    );
  });

  it('Exposes `cause`', () => {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'errors'
    );
    cy.get(sel + 'input.cause[type=checkbox]').click();

    cy.get(
      sel + '.typeContainer > [data-type=errors] > .causeHolder > button'
    ).click();
    cy.get(
      sel + '.typeContainer > [data-type=errors] > .causeHolder ' +
        '> .causeContents'
    ).should('be.hidden');
    cy.get(
      sel + '.typeContainer > [data-type=errors] > .causeHolder > button'
    ).click();
    cy.get(
      sel + '.typeContainer > [data-type=errors] > .causeHolder ' +
        '> .causeContents'
    ).should('not.be.hidden');
  });

  it('Exposes aggregate `errors`', () => {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'errors'
    );
    cy.get(sel + 'select.errorType').select(
      'AggregateError'
    );
    cy.get(sel + 'input.aggregateErrors[type=checkbox]').click();

    cy.get(
      sel + '> .typesHolder > .typeContainer > [data-type=errors] > ' +
        '.aggregateErrorsHolder > button'
    ).click();
    cy.get(
      sel + '> .typesHolder > .typeContainer > [data-type=errors] > ' +
        '.aggregateErrorsHolder > .aggregateErrorsContents'
    ).should('be.hidden');
    cy.get(
      sel + '> .typesHolder > .typeContainer > [data-type=errors] > ' +
        '.aggregateErrorsHolder > button'
    ).click();
    cy.get(
      sel + '> .typesHolder > .typeContainer > [data-type=errors] > ' +
        '.aggregateErrorsHolder > .aggregateErrorsContents'
    ).should('not.be.hidden');
  });

  it('gets type', function (done) {
    cy.on('window:alert', (t) => {
      expect(t).to.eq('errors');
      done();
    });
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'errors'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-errors-message"]',
      'message1'
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
      'errors'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-errors-message"]',
      'message1'
    );
    cy.get('button#isValid').click();
  });

  it('logs value', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'errors'
    );
    cy.get(sel + '.errorType').select('TypeError');
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-errors-message"]',
      'message1'
    );

    cy.get('button#logValue').click();
    const err = /**
    * @type {TypeError & {
    *   columnNumber: undefined,
    *   lineNumber: undefined,
    *   fileName: string
    * }}
    */ (new TypeError('message1'));
    err.columnNumber = undefined;
    err.lineNumber = undefined;
    err.fileName = ''; // Why defaulting to string?
    err.name = ''; // Why defaulting to string?
    err.stack = ''; // Why defaulting to string?
    cy.get('@consoleLog').should('be.calledWith', err);
  });

  it('logs value (AggregateError)', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'errors'
    );
    cy.get(sel + '.errorType').select('AggregateError');
    cy.get(sel + 'input.aggregateErrors[type=checkbox]').click();

    cy.get(
      sel + '[data-type=errors] [data-type=errors] .errorType'
    ).select('TypeError');

    cy.clearTypeAndBlur(
      sel +
      '> .typesHolder > .typeContainer > [data-type=errors] > ' +
      'div:nth-of-type(1) ' +
      'input[name="demo-keypath-not-expected-errors-message"]',
      'agg msg1'
    );

    cy.clearTypeAndBlur(
      sel +
      '[data-type=errors] [data-type=errors] ' +
      'input[name="demo-keypath-not-expected-errors-message"]',
      'message1'
    );

    cy.get('button#logValue').click();
    const aggErr = new TypeError('message1');
    const err = /**
    * @type {AggregateError & {
    *   columnNumber: undefined,
    *   lineNumber: undefined,
    *   fileName: string
    * }}
    */ (new AggregateError([aggErr], 'agg msg1'));
    err.columnNumber = undefined;
    err.lineNumber = undefined;
    err.fileName = ''; // Why defaulting to string?
    err.name = ''; // Why defaulting to string?
    err.stack = ''; // Why defaulting to string?
    cy.get('@consoleLog').should('be.calledWith', err);
  });

  it('logs value (no message AggregateError)', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'errors'
    );
    cy.get(sel + '.errorType').select('AggregateError');
    cy.get(sel + 'input.aggregateErrors[type=checkbox]').click();

    cy.get(
      sel +
        '> .typesHolder > .typeContainer > [data-type=errors] > ' +
        'div:nth-of-type(1) ' +
        'input[type=checkbox].message'
    ).click();

    cy.get(
      sel + '[data-type=errors] [data-type=errors] .errorType'
    ).select('TypeError');

    cy.clearTypeAndBlur(
      sel +
      '[data-type=errors] [data-type=errors] ' +
      'input[name="demo-keypath-not-expected-errors-message"]',
      'message1'
    );

    cy.get('button#logValue').click();
    const aggErr = new TypeError('message1');
    /* eslint-disable unicorn/error-message -- Testing */
    const err = /**
    * @type {AggregateError & {
    *   columnNumber: undefined,
    *   lineNumber: undefined,
    *   fileName: string
    * }}
    */ (new AggregateError([aggErr]));
    /* eslint-enable unicorn/error-message -- Testing */
    err.message = undefined; // Have to force at least in Chrome
    err.columnNumber = undefined;
    err.lineNumber = undefined;
    err.fileName = ''; // Why defaulting to string?
    err.name = ''; // Why defaulting to string?
    err.stack = ''; // Why defaulting to string?
    cy.get('@consoleLog').should('be.calledWith', err);
  });

  it('errs when attempting to log a bad value', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'errors'
    );
    cy.on('uncaught:exception', (err /* , runnable */) => {
      if (err?.message.includes('Bad error type')) {
        // returning false here prevents Cypress from
        // failing the test
        return false;
      }
      return undefined;
    });
    cy.get('button#logValue').click();
    cy.get('@consoleLog').should('not.be.called');
  });

  it('views UI', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'errors'
    );
    cy.get(sel + '.errorType').select('TypeError');

    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-errors-message"]',
      'message1'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-errors-name"]',
      'name1'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-errors-fileName"]',
      'fileName1'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-errors-lineNumber"]',
      '123'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-errors-columnNumber"]',
      '456'
    );
    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-errors-stack"]',
      'stack1'
    );

    // err.cause = undefined;

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults div[data-type="errors"]').should('exist');
    cy.get(
      '#viewUIResults div[data-type="errors"]'
    ).should('contain', 'TypeError');
    cy.get(
      '#viewUIResults div[data-type="errors"]'
    ).should('contain', 'message1');
    cy.get(
      '#viewUIResults div[data-type="errors"]'
    ).should('contain', 'name1');
    cy.get(
      '#viewUIResults div[data-type="errors"]'
    ).should('contain', 'fileName1');
    cy.get(
      '#viewUIResults div[data-type="errors"]'
    ).should('contain', '123');
    cy.get(
      '#viewUIResults div[data-type="errors"]'
    ).should('contain', '456');
    cy.get(
      '#viewUIResults div[data-type="errors"]'
    ).should('contain', 'stack1');
  });

  it('views UI (empty fields)', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'errors'
    );
    cy.get(sel + '.errorType').select('TypeError');
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
    cy.get('#viewUIResults div[data-type="errors"]').should('exist');
  });

  it('views UI (with a cause)', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'errors'
    );
    cy.get(sel + '.errorType').select('TypeError');

    cy.get(sel + 'input[type=checkbox].cause').click();
    cy.clearTypeAndBlur(
      sel + 'div[data-type="errors"] div[data-type="errors"] ' +
        'input[name=demo-keypath-not-expected-errors-message]',
      'Cause message'
    );
    cy.get(
      sel + 'div[data-type="errors"] div[data-type="errors"] .errorType'
    ).select('RangeError');
    // eslint-disable-next-line cypress/no-unnecessary-waiting -- Wait to load
    cy.wait(500);
    cy.get('button#viewUI').click();

    cy.get(
      '#viewUIResults > [data-type="errors"] > ' +
        '.causeHolder > button'
    ).click();
    cy.get(
      '#viewUIResults > [data-type=errors] > .causeHolder ' +
        '> .causeContents'
    ).should('be.hidden');

    cy.get(
      '#viewUIResults > [data-type="errors"] > ' +
        '.causeHolder > button'
    ).click();
    cy.get(
      '#viewUIResults > [data-type=errors] > .causeHolder ' +
        '> .causeContents'
    ).should('not.be.hidden');
  });

  it('views UI (with aggregate errors)', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'errors'
    );
    cy.get(sel + '.errorType').select('AggregateError');
    cy.get(sel + 'input.aggregateErrors[type=checkbox]').click();

    cy.clearTypeAndBlur(
      sel + 'div[data-type="errors"] div[data-type="errors"] ' +
        'input[name=demo-keypath-not-expected-errors-message]',
      'Aggregate errors message'
    );
    cy.get(
      sel + 'div[data-type="errors"] div[data-type="errors"] .errorType'
    ).select('RangeError');
    // eslint-disable-next-line cypress/no-unnecessary-waiting -- Wait to load
    cy.wait(500);
    cy.get('button#viewUI').click();

    cy.get(
      '#viewUIResults > [data-type="errors"] > div >' +
        '.aggregateErrorsHolder > button'
    ).click();
    cy.get(
      '#viewUIResults > [data-type=errors] > div > .aggregateErrorsHolder ' +
        '> .aggregateErrorsContents'
    ).should('be.hidden');

    cy.get(
      '#viewUIResults > [data-type="errors"] > div > ' +
        '.aggregateErrorsHolder > button'
    ).click();
    cy.get(
      '#viewUIResults > [data-type=errors] > div > .aggregateErrorsHolder ' +
        '> .aggregateErrorsContents'
    ).should('not.be.hidden');

    cy.get(
      sel + 'fieldset[data-type=errors] > ' +
        'select.typeChoices-demo-keypath-not-expected'
    ).select('error');
    // eslint-disable-next-line cypress/no-unnecessary-waiting -- Wait to load
    cy.wait(500);
    cy.get('button#viewUI').click();
  });

  it('gets value', function () {
    cy.clearTypeAndBlur(
      '#getValueForString', 'TypeError({{}"message": "abc1"})'
    );
    const err = /**
     * @type {TypeError & {
     *   cause: undefined,
     *   columnNumber: undefined,
     *   fileName: undefined,
     *   lineNumber: undefined
     * }}
     */ (new TypeError('abc1'));
    err.stack = '';
    err.cause = undefined;
    err.columnNumber = undefined;
    err.fileName = undefined;
    err.lineNumber = undefined;
    err.name = undefined;

    cy.get('@consoleLog').should('be.calledWith', err);
  });

  // For the "Type choices with initial value set" controls
  it('gets a value set onload', function () {
    cy.get(
      'fieldset:nth-of-type(19) ' +
        'input[name="demo-type-choices-only-initial-value-errors-message"]'
    ).should(($input) => {
      expect($input.val()).to.equal('agg msg');
    });

    cy.get(
      'fieldset:nth-of-type(19) ' +
      'fieldset[data-type=errors]:nth-of-type(1) [data-type=errors] ' +
      'input[name="demo-type-choices-only-initial-value-errors-message"]'
    ).should(($input) => {
      expect($input.val()).to.equal('agg err1');
    });

    cy.get(
      'fieldset:nth-of-type(19) ' +
      'fieldset[data-type=errors]:nth-of-type(2) [data-type=errors] ' +
      'input[name="demo-type-choices-only-initial-value-errors-message"]'
    ).should(($input) => {
      expect($input.val()).to.equal('agg err2');
    });

    cy.get(
      'fieldset:nth-of-type(19) ' +
      'fieldset[data-type=error]:nth-of-type(3) [data-type=error] ' +
      'input[name="demo-type-choices-only-initial-value-error-message"]'
    ).should(($input) => {
      expect($input.val()).to.equal('agg err3');
    });

    cy.get(
      'fieldset:nth-of-type(18) ' +
        'input[name="demo-type-choices-only-initial-value-errors-message"]'
    ).should(($input) => {
      expect($input.val()).to.equal('msg');
    });

    cy.get(
      'fieldset:nth-of-type(18) ' +
      '[data-type=errors] [data-type=errors] ' +
      'input[name="demo-type-choices-only-initial-value-errors-message"]'
    ).should(($input) => {
      expect($input.val()).to.equal('some cause');
    });

    cy.get(
      '[data-type=errors] [data-type=errors] ' +
      'input[name="demo-type-choices-only-initial-value-' +
        'ErrorsCause-errors-message"]'
    ).should(($input) => {
      expect($input.val()).to.equal('some cause2');
    });

    cy.get(
      '[data-type=errors] ' +
      'input[name="demo-type-choices-only-initial-value-' +
        'ErrorsAggregate-errors-message"]'
    ).should(($input) => {
      expect($input.val()).to.equal('msg2');
    });

    cy.get(
      'fieldset:nth-of-type(1) [data-type=errors] ' +
      'input[name="demo-type-choices-only-initial-value-' +
        'ErrorsAggregate-errors-message"]'
    ).should(($input) => {
      expect($input.val()).to.equal('some err1');
    });

    cy.get(
      'fieldset:nth-of-type(2) [data-type=errors] ' +
      'input[name="demo-type-choices-only-initial-value-' +
        'ErrorsAggregate-errors-message"]'
    ).should(($input) => {
      expect($input.val()).to.equal('some err2');
    });

    cy.get(
      'fieldset:nth-of-type(3) [data-type=error] ' +
      'input[name="demo-type-choices-only-initial-value-' +
        'ErrorsAggregate-error-message"]'
    ).should(($input) => {
      expect($input.val()).to.equal('some err3');
    });
  });

  describe('getInput()', function () {
    it('Shows the errors root form control', function () {
      const sel = '#formatAndTypeChoices ';

      cy.get(
        sel + 'select.typeChoices-demo-keypath-not-expected'
      ).select('errors');

      cy.get('#showRootFormControl').click();

      cy.get(
        '#formatAndTypeChoices > .typesHolder > .typeContainer > ' +
        'div[data-type="errors"] input:not([type])'
      ).should(($input) => {
        expect($input[0].style.backgroundColor).to.equal('red');
      });

      // eslint-disable-next-line cypress/no-unnecessary-waiting -- Needed
      cy.wait(3000);

      cy.get(
        '#formatAndTypeChoices > .typesHolder > .typeContainer > ' +
        'div[data-type="errors"] input:not([type])'
      ).should(($input) => {
        expect($input[0].style.backgroundColor).to.not.equal('red');
      });
    });
  });
});

describe('Errors spec (schemas)', () => {
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
      'errors'
    );
    cy.get(sel + '.errorType').select('TypeError');

    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-errors-message"]',
      'message1'
    );

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults div[data-type="errors"]').should('exist');
    cy.get(
      '#viewUIResults div[data-type="errors"]'
    ).then((elem) => {
      expect(elem.attr('title')).to.equal('(an Error TypeError)');
    });
  });
});
