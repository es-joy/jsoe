import dialogs from '#jsoe/utils/dialogs.js';

describe('dialogs', function () {
  describe('makeDialog', function () {
    it('allows close argument', function (done) {
      const dialog = dialogs.makeDialog({
        // eslint-disable-next-line jsdoc/ts-ban-ts-comment -- Sometimes errs
        // @ts-ignore Sometimes errs
        close () {
          done();
        }
      });

      dialog.close();
    });

    // eslint-disable-next-line mocha/handle-done-callback -- Bug
    it('allows true close argument', function (done) {
      const dialog = dialogs.makeDialog({
        // eslint-disable-next-line jsdoc/ts-ban-ts-comment -- Sometimes errs
        // @ts-ignore Sometimes errs
        close: true,
        atts: {
          $on: {
            close () {
              done();
            }
          }
        }
      });

      dialog.close();
    });

    it('can avoid dialog removal', function () {
      const dialog = dialogs.makeDialog({
        remove: false
      });
      dialog.close();
      // The point of this test: with `remove: false`, closing does *not*
      //   remove the dialog from the document (unlike every other case in
      //   this file) — so, uniquely here, cleanup must remove it manually
      //   afterward instead of relying on that close-triggered removal.
      expect(document.body.contains(dialog)).to.equal(true);
      dialog.remove();
    });

    it('allows avoiding children', function () {
      const dialog = dialogs.makeDialog();
      dialog.close();
    });
  });

  describe('makeCancelDialog', function () {
    it('supports a cancel argument', function (done) {
      const dialog = dialogs.makeCancelDialog({
        cancel () {
          setTimeout(() => {
            expect(dialog.open).to.equal(true);
            // The `cancel` callback returning `true` is what keeps this
            //   dialog open (that's the behavior under test), so — unlike
            //   a dialog the `cancel` button itself closes — it's left to
            //   this test to close (and thereby remove; `remove` defaults
            //   to `true`) it afterward.
            dialog.close();
            done();
          }, 0);
          return true;
        }
      });
      /** @type {HTMLElement} */ (dialog.querySelector('.cancel')).click();
    });

    it(
      'supports a cancel argument which returns false to avoid closing',
      function (done) {
        const dialog = dialogs.makeCancelDialog({
          cancel () {
            setTimeout(() => {
              expect(dialog.open).to.equal(false);
              done();
            }, 0);
            return false;
          }
        });
        /** @type {HTMLElement} */ (dialog.querySelector('.cancel')).click();
      }
    );
  });
  describe('confirm', function () {
    it('confirm supports object-based message', function (done) {
      dialogs.confirm({
        atts: {
          id: 'confirmDialog'
        },
        message: {
          message: 'Please confirm'
        }
      });
      setTimeout(() => {
        const dialog = document.querySelector('#confirmDialog');
        if (!dialog) {
          done(new Error('Missing dialog'));
          return;
        }
        const submit = dialog.querySelector(':scope .submit > button');
        console.log('dialog', dialog.outerHTML);
        /** @type {HTMLElement} */ (submit).click();
        expect(dialog.textContent).to.contain('Please confirm');
        done();
      }, 0);
    });
  });

  describe('makeSubmitDialog', function () {
    it('submits', function (done) {
      // eslint-disable-next-line jsdoc/ts-ban-ts-comment -- Sometimes errs
      // @ts-ignore Sometimes errs
      const dialog = dialogs.makeSubmitDialog({
        submit ({e, dialog}) {
          expect(e).to.be.instanceOf(Event);
          expect(dialog).to.be.instanceOf(HTMLDialogElement);
          // Unlike the `cancel` button, the `submit` button never calls
          //   `dialog.close()` itself, so this test must (`remove`
          //   defaults to `true`, so closing also removes it).
          dialog.close();
          done();
        }
      });
      /** @type {HTMLButtonElement} */ (
        dialog.querySelector('button.submit')
      ).click();
    });
  });

  describe('alert', function () {
    it('alerts with simple string', function (done) {
      dialogs.alert('Message1');
      cy.get('dialog[open] button').click();
      cy.get('dialog[open]').should('have.text', 'Message1');
      done();
    });
  });
});
