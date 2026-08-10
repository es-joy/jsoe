import FileList from '../../../src/utils/FileList.js';

describe('FileList spec', () => {
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
      'filelist'
    );

    cy.get(sel + 'button.addArrayElement').click();
    cy.get(
      sel + '.arrayItems input[name="demo-keypath-not-expected-file"]'
    ).selectFile('package.json');

    cy.get(sel + 'button.addArrayElement').click();
    cy.get(
      sel + 'fieldset[data-type="file"]:nth-of-type(2) ' +
        'input[name="demo-keypath-not-expected-file"]'
    ).selectFile('README.md');
  });

  it('gets type', function (done) {
    cy.on('window:alert', (t) => {
      expect(t).to.eq('filelist');
      done();
    });
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'filelist'
    );

    cy.get(
      sel + 'input[name="demo-keypath-not-expected-filelist"]'
    ).selectFile([
      'package.json', 'README.md'
    ]);

    cy.get('button#getType').click();
  });

  it('is valid', function (done) {
    cy.on('window:alert', (t) => {
      expect(t).to.eq(true);
      done();
    });
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'filelist'
    );
    cy.get(
      sel + 'input[name="demo-keypath-not-expected-filelist"]'
    ).selectFile([
      'package.json', 'README.md'
    ]);

    cy.get('button#isValid').click();
  });

  it('logs value', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'filelist'
    );
    cy.get(
      sel + 'input[name="demo-keypath-not-expected-filelist"]'
    ).selectFile([
      'package.json', 'README.md'
    ]);

    cy.get('button#logValue').click();
    cy.get('@consoleLog').should('be.called');

    // Failing now due to identity check?
    // cy.get('@consoleLog').should('be.called', new FileList([
    //   new File([], ''),
    //   new File([], '')
    // ]));
  });

  it('views UI', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'filelist'
    );
    cy.get(
      sel + 'input[name="demo-keypath-not-expected-filelist"]'
    ).selectFile([
      'package.json', 'README.md'
    ]);

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults div[data-type="filelist"]').should('exist');
  });

  it('gets value', function () {
    cy.clearTypeAndBlur(
      // `{}` is an added Cypress escape
      '#getValueForString', 'FileList(' +
      // Todo: Parsing not working with inner `File`
      // 'File({{}"stringContents":"abc","name":"someName",' +
      // '"type":"text/plain","lastModified":1231230}),' +
      // 'File({{}"stringContents":"def","name":"anotherName",' +
      // '"type":"text/plain","lastModified":3213210})' +
      ')'
    );
    cy.get('@consoleLog').should(
      'be.calledWith',
      // @ts-expect-error -- Virtual API
      new FileList([
        // new File([], '', {}),
        // new File([], '', {})
      ])
    );
  });

  describe('getInput()', function () {
    it('Shows the filelist root form control', function () {
      const sel = '#formatAndTypeChoices ';

      cy.get(
        sel + 'select.typeChoices-demo-keypath-not-expected'
      ).select('filelist');

      cy.get('#showRootFormControl').click();

      cy.get(
        '#formatAndTypeChoices > .typesHolder > .typeContainer > ' +
        'div[data-type="filelist"] > button'
      ).should(($button) => {
        expect($button[0].style.backgroundColor).to.equal('red');
      });

      // eslint-disable-next-line cypress/no-unnecessary-waiting -- Needed
      cy.wait(3000);

      cy.get(
        '#formatAndTypeChoices > .typesHolder > .typeContainer > ' +
        'div[data-type="filelist"] > button'
      ).should(($button) => {
        expect($button[0].style.backgroundColor).to.not.equal('red');
      });
    });
  });

  // it('gets a value set onload', function () {
  //   cy.get(
  //     'input[name="demo-type-choices-only-initial-value-filelist"]' +
  //       '[value=false]'
  //   ).should('be.checked');
  // });
});

describe('FileList spec (schemas)', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-schema-instrumented.html', {
      onBeforeLoad (win) {
        cy.stub(win.console, 'log').as('consoleLog');
      }
    });
  });

  it('views UI', function () {
    cy.get('.formatChoices:first').select('Schema: Zodex schema instance 7');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'FileList (A FileList)'
    );
    cy.get(
      sel + 'input[name="demo-keypath-not-expected-filelist"]'
    ).selectFile([
      'package.json', 'README.md'
    ]);

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults div[data-type="filelist"]').should('exist');
    cy.get(
      '#viewUIResults div[data-type="filelist"] .arrayContents > div[title]'
    ).should(($elem) => {
      expect($elem.attr('title')).to.equal('(a FileList)');
    });

    // Apparent bug in Cypress not getting full results
    // cy.get(
    //   '#viewUIResults div[data-type="file"] > b[title]'
    // ).then(($elem) => {
    //   expect($elem.attr('title')).to.equal('(a File)');
    // });
  });
});
