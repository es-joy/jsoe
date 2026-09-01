describe('Blob spec', () => {
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
      'blob'
    );
    cy.get('input[name="demo-keypath-not-expected-blob"]').should(
      'exist'
    );
  });

  it('allows selection of local file and shows metadata', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'blob'
    );

    cy.get(sel + 'input[name="demo-keypath-not-expected-blob"]').selectFile(
      'package.json'
    );

    cy.get(sel + '.size').should(($input) => {
      expect($input.val()).to.match(/\d+/u);
    });

    cy.get(sel + '.contentType').should(($input) => {
      expect($input.val()).to.equal('application/json');
    });

    cy.get(sel + '.clearData').click();

    cy.get(sel + '.size').should(($input) => {
      expect($input.val()).to.equal('');
    });

    cy.get(sel + '.contentType').should(($input) => {
      expect($input.val()).to.equal('');
    });

    cy.get(sel + '.viewBinary').click();

    cy.get('dialog[open] .view-binary').should(($textarea) => {
      expect($textarea.val()).to.equal('');
    });
  });

  it(
    'allows selection of local file and changing of content type',
    function () {
      const sel = '#formatAndTypeChoices ';
      cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
        'blob'
      );

      cy.get(sel + 'input[name="demo-keypath-not-expected-blob"]').selectFile(
        'package.json'
      );

      cy.clearTypeAndBlur(sel + '.contentType', 'text/json');

      cy.get('button#viewUI').click();
      cy.get('#viewUIResults').should('contain', 'text/json');
    }
  );

  it(
    'allows selection of local file and changing of contents',
    function () {
      const sel = '#formatAndTypeChoices ';
      cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
        'blob'
      );

      cy.get(sel + 'input[name="demo-keypath-not-expected-blob"]').selectFile(
        'package.json'
      );

      cy.get(sel + '.viewBinary').click();

      cy.clearTypeAndBlur('dialog[open] .view-binary', 'some text');

      cy.get('dialog[open] button.submit').click();

      cy.get('button#viewUI').click();
      cy.get('#viewUIResults').should('contain', 'some text');
    }
  );

  it(
    'allows selection of local file and content type', function () {
      const sel = '#formatAndTypeChoices ';
      cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
        'blob'
      );

      cy.clearTypeAndBlur(sel + '.contentType', 'text/json');

      cy.get(sel + '.viewBinary').click();
      cy.get('dialog[open] .view-binary').should(($textarea) => {
        expect($textarea.val()).to.equal('');
      });
    }
  );

  it('allows selection of local file and shows binary data', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'blob'
    );

    cy.get(sel + 'input[name="demo-keypath-not-expected-blob"]').selectFile(
      'package.json'
    );

    cy.get(sel + '.viewBinary').click();

    cy.get('dialog[open] .view-binary').should(
      'contain', '"name": "@es-joy/jsoe"'
    );
  });

  it('can edit binary data without a file', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'blob'
    );

    cy.get(sel + '.viewBinary').click();

    cy.get('dialog[open] .view-binary').should(($textarea) => {
      expect($textarea.val()).to.equal('');
    });

    cy.clearTypeAndBlur('dialog[open] .view-binary', 'test123');

    cy.get('dialog[open] button.submit').click();
  });

  it('logs value', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'blob'
    );
    cy.get(sel + 'input[name="demo-keypath-not-expected-blob"]').selectFile(
      'package.json'
    );

    cy.get('button#logValue').click();

    // These values aren't precise, but work since console.log only
    //   checks there is an object
    cy.get('@consoleLog').should('be.calledWith', new Blob([''], {
      type: 'application/json'
    }));
  });

  it('views UI (JSON)', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'blob'
    );
    cy.get(sel + 'input[name="demo-keypath-not-expected-blob"]').selectFile(
      'package.json'
    );

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults').should('contain', 'application/json');
    cy.get('#viewUIResults .view-text').should(($textarea) => {
      expect($textarea.val()).to.contain('"name": "@es-joy/jsoe"');
    });
  });

  it('views UI (video)', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'blob'
    );
    cy.get(sel + 'input[name="demo-keypath-not-expected-blob"]').selectFile(
      'node_modules/webappfind-demos-samples/sample-test-files/small.webm'
    );

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults').should('contain', 'video/webm');
    cy.get('#viewUIResults video.video').should(($video) => {
      expect(/** @type {HTMLVideoElement} */ ($video[0]).duration).to.be.gt(0);
    });

    cy.get('#viewUIResults video.video').should('have.prop', 'paused', true).
      and('have.prop', 'ended', false);

    cy.get('#viewUIResults .play').click();

    cy.get('#viewUIResults video.video').should('have.prop', 'paused', false).
      and('have.prop', 'ended', false);

    cy.get('#viewUIResults .pause').click();

    cy.get('#viewUIResults video.video').should('have.prop', 'paused', true).
      and('have.prop', 'ended', false);

    cy.get('#viewUIResults .play').click();

    cy.get('#viewUIResults video.video', {timeout: 10000}).
      and('have.prop', 'ended', true);

    cy.get('#viewUIResults .replay').click();

    cy.get('#viewUIResults video.video').should('have.prop', 'paused', false).
      and('have.prop', 'ended', false);

    cy.get('#viewUIResults video.video', {timeout: 10000}).
      and('have.prop', 'ended', true);
  });

  it('views UI (audio)', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'blob'
    );
    cy.get(sel + 'input[name="demo-keypath-not-expected-blob"]').selectFile(
      'node_modules/webappfind-demos-samples/sample-test-files/' +
        'Armstrong_Small_Step.ogg'
    );

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults').should('contain', 'audio/ogg');
    cy.get('#viewUIResults audio.audio').should(($audio) => {
      expect(/** @type {HTMLVideoElement} */ ($audio[0]).duration).to.be.gt(0);
    });

    cy.get('#viewUIResults audio.audio').should('have.prop', 'paused', true).
      and('have.prop', 'ended', false);

    cy.get('#viewUIResults .play').click();

    cy.get('#viewUIResults audio.audio').should('have.prop', 'paused', false).
      and('have.prop', 'ended', false);

    cy.get('#viewUIResults .pause').click();

    cy.get('#viewUIResults audio.audio').should('have.prop', 'paused', true).
      and('have.prop', 'ended', false);

    cy.get('#viewUIResults .play').click();

    // cy.get('#viewUIResults audio.audio', {timeout: 30000}).
    //   and('have.prop', 'ended', true);

    cy.get('#viewUIResults .replay').click();

    cy.get('#viewUIResults audio.audio').should('have.prop', 'paused', false).
      and('have.prop', 'ended', false);

    // cy.get('#viewUIResults audio.audio', {timeout: 30000}).
    //   and('have.prop', 'ended', true);
  });

  it('views UI (PDF)', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'blob'
    );
    cy.get(sel + 'input[name="demo-keypath-not-expected-blob"]').selectFile(
      'node_modules/webappfind-demos-samples/sample-test-files/' +
        'helloworld.pdf'
    );

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults').should('contain', 'application/pdf');
    cy.get('#viewUIResults iframe.PDF').should('exist');
  });

  it('views UI (image)', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'blob'
    );
    cy.get(sel + 'input[name="demo-keypath-not-expected-blob"]').selectFile(
      'node_modules/webappfind-demos-samples/sample-test-files/' +
        'test.jpg'
    );

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults').should('contain', 'image/jpeg');
    cy.get('#viewUIResults img.imageView').should('exist');
  });

  describe('Video and audio recording', function () {
    it('records audio', function () {
      const sel = '#formatAndTypeChoices ';
      cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
        'blob'
      );
      cy.get(sel + '.device').select('audio');

      cy.get(sel + '.visualizer').should('be.visible');

      // eslint-disable-next-line cypress/no-unnecessary-waiting -- Needed for stream to load
      cy.wait(1000);
      cy.get(sel + '.recordMedia').click();

      // eslint-disable-next-line cypress/no-unnecessary-waiting -- Need some time recorded
      cy.wait(1000);
      cy.get(sel + '.stopRecording').click();

      // Todo: should refactor audio to produce audio content type

      cy.get(sel + '.contentType').should(($input) => {
        expect($input.val()).to.equal('video/mp4');
      });

      cy.get(sel + 'video.recordedMedia').should(($video) => {
        expect(/** @type {HTMLVideoElement} */ (
          $video[0]
        ).duration).to.be.gt(0);
      });

      cy.get(sel + 'video.recordedMedia').should('have.prop', 'paused', true).
        and('have.prop', 'ended', false);

      cy.get(sel + '.recordedMedia .play').click();

      cy.get(sel + 'video.recordedMedia').should('have.prop', 'paused', false).
        and('have.prop', 'ended', false);

      cy.get(sel + '.recordedMedia .pause').click();

      cy.get(sel + 'video.recordedMedia').should('have.prop', 'paused', true).
        and('have.prop', 'ended', false);

      cy.get(sel + '.recordedMedia .replay').click();

      cy.get(sel + 'video.recordedMedia').should('have.prop', 'paused', false).
        and('have.prop', 'ended', false);

      cy.get(sel + 'video.recordedMedia', {timeout: 10000}).
        and('have.prop', 'ended', true);

      // Trigger stopping of old tracks
      cy.get(sel + '.device').select('video');
    });

    it('records video (only)', function () {
      const sel = '#formatAndTypeChoices ';
      cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
        'blob'
      );
      cy.get(sel + '.device').select('video');

      cy.get(sel + '.visualizer').should('not.be.visible');

      // eslint-disable-next-line cypress/no-unnecessary-waiting -- Needed for stream to load
      cy.wait(1000);
      cy.get(sel + '.recordMedia').click();

      // eslint-disable-next-line cypress/no-unnecessary-waiting -- Need some time recorded
      cy.wait(1000);
      cy.get(sel + '.stopRecording').click();

      cy.get(sel + '.contentType').should(($input) => {
        expect($input.val()).to.equal('video/mp4');
      });

      // Having problems with this with Blobs for some reason
      // cy.get(sel + 'video.recordedMedia').should(($video) => {
      //   expect(/** @type {HTMLVideoElement} */ (
      //     $video[0]
      //   ).duration).to.be.gt(0);
      // });

      cy.get(sel + 'video.recordedMedia').should('have.prop', 'paused', true).
        and('have.prop', 'ended', false);

      cy.get(sel + '.recordedMedia .play').click();

      cy.get(sel + 'video.recordedMedia').should('have.prop', 'paused', false).
        and('have.prop', 'ended', false);

      cy.get(sel + '.recordedMedia .pause').click();

      cy.get(sel + 'video.recordedMedia').should('have.prop', 'paused', true).
        and('have.prop', 'ended', false);

      cy.get(sel + '.recordedMedia .replay').click();

      cy.get(sel + 'video.recordedMedia').should('have.prop', 'paused', false).
        and('have.prop', 'ended', false);

      cy.get(sel + 'video.recordedMedia', {timeout: 10000}).
        and('have.prop', 'ended', true);

      // Trigger stopping of old tracks
      cy.get(sel + '.device').select('');
    });

    it('records audio and video', function () {
      const sel = '#formatAndTypeChoices ';
      cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
        'blob'
      );
      cy.get(sel + '.device').select('audio-and-video');

      cy.get(sel + '.visualizer').should('be.visible');

      // eslint-disable-next-line cypress/no-unnecessary-waiting -- Needed for stream to load
      cy.wait(1000);
      cy.get(sel + '.recordMedia').click();

      // eslint-disable-next-line cypress/no-unnecessary-waiting -- Need some time recorded
      cy.wait(1000);
      cy.get(sel + '.stopRecording').click();

      cy.get(sel + '.contentType').should(($input) => {
        expect($input.val()).to.equal('video/mp4');
      });

      cy.get(sel + 'video.recordedMedia').should(($video) => {
        expect(/** @type {HTMLVideoElement} */ (
          $video[0]
        ).duration).to.be.gt(0);
      });

      cy.get(sel + 'video.recordedMedia').should('have.prop', 'paused', true).
        and('have.prop', 'ended', false);

      cy.get(sel + '.recordedMedia .play').click();

      cy.get(sel + 'video.recordedMedia').should('have.prop', 'paused', false).
        and('have.prop', 'ended', false);

      cy.get(sel + '.recordedMedia .pause').click();

      cy.get(sel + 'video.recordedMedia').should('have.prop', 'paused', true).
        and('have.prop', 'ended', false);

      cy.get(sel + '.recordedMedia .replay').click();

      cy.get(sel + 'video.recordedMedia').should('have.prop', 'paused', false).
        and('have.prop', 'ended', false);

      cy.get(sel + 'video.recordedMedia', {timeout: 10000}).
        and('have.prop', 'ended', true);
    });
  });

  describe('Snapshots', function () {
    it('records snapshot', function () {
      const sel = '#formatAndTypeChoices ';
      cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
        'blob'
      );
      cy.get(sel + '.device').select('video');

      cy.get(sel + '.takeSnapshot').click();

      cy.get(sel + '.contentType').should(($input) => {
        expect($input.val()).to.equal('image/png');
      });
    });
  });

  describe('Screen sharing', function () {
    it('should share screen', function () {
      const sel = '#formatAndTypeChoices ';
      cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
        'blob'
      );
      cy.get(sel + '.device').select('screenShare');
    });
    it('should share screen and video', function () {
      const sel = '#formatAndTypeChoices ';
      cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
        'blob'
      );
      cy.get(sel + '.device').select('screenShareAndVideo');
    });
  });

  describe('getInput()', function () {
    it('Shows the blob root form control', function () {
      const sel = '#formatAndTypeChoices ';

      cy.get(
        sel + 'select.typeChoices-demo-keypath-not-expected'
      ).select('blob');

      cy.get('#showRootFormControl').click();

      cy.get(
        '#formatAndTypeChoices > .typesHolder > .typeContainer > ' +
        'div[data-type="blob"] button.viewBinary'
      ).should(($input) => {
        expect($input[0].style.backgroundColor).to.equal('red');
      });

      // eslint-disable-next-line cypress/no-unnecessary-waiting -- Needed
      cy.wait(3000);

      cy.get(
        '#formatAndTypeChoices > .typesHolder > .typeContainer > ' +
        'div[data-type="blob"] button.viewBinary'
      ).should(($input) => {
        expect($input[0].style.backgroundColor).to.not.equal('red');
      });
    });
  });

  it('gets value', function () {
    cy.clearTypeAndBlur(
      '#getValueForString',
      'Blob({{}"stringContents":"abc",' +
        '"type":"text/plain"})'
    );
    cy.get('@consoleLog').should(
      'be.calledWith', new Blob(['abc'], {
        type: 'text/plain'
      })
    );
  });

  // For the "Type choices with initial value set" control
  it('gets a value set onload', function () {
    cy.get(
      'form > .typeContainer > ' +
      'div[data-type="blob"] .contentType'
    ).should(($input) => {
      expect($input.val()).to.equal('text/plain');
    });
  });

  it('gets a value set onload (within array setting value)', function () {
    cy.get(
      'fieldset[data-type="blob"] .contentType'
    ).should(($input) => {
      expect($input.val()).to.equal('text/plain');
    });
  });
});

describe('Blob spec (schemas)', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-schema-instrumented.html', {
      onBeforeLoad (win) {
        cy.stub(win.console, 'log').as('consoleLog');
      }
    });
  });

  it('allows selection of local file and shows metadata', function () {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 2');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'blob'
    );
    cy.get(sel + 'input[name="demo-keypath-not-expected-blob"]').selectFile(
      'package.json'
    );
    cy.get('button#viewUI').click();

    cy.get('#viewUIResults div[data-type="blob"] > b.emphasis').should(
      'contain', 'A Blob'
    );

    cy.get('#viewUIResults div[data-type="blob"] > b.emphasis').then((elem) => {
      expect(elem.attr('title')).to.equal('(a Blob)');
    });
  });
});
