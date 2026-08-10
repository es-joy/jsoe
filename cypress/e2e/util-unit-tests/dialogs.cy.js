import dialogs from '../../../instrumented/utils/dialogs.js';
// import dialogs from '../../../src/utils/dialogs.js'; // Test Cypress TS

describe('dialogs', function () {
  describe('makeDialog', function () {
    it('allows close argument', function (done) {
      const dialog = dialogs.makeDialog({
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
      dialogs.makeDialog({
        remove: false
      });
    });

    it('allows avoiding children', function () {
      dialogs.makeDialog();
    });
  });

  describe('makeCancelDialog', function () {
    it('supports a cancel argument', function (done) {
      const dialog = dialogs.makeCancelDialog({
        cancel () {
          setTimeout(() => {
            expect(dialog.open).to.equal(false);
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
              expect(dialog.open).to.equal(true);
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
      // @ts-ignore Sometimes errs
      const dialog = dialogs.makeSubmitDialog({
        submit ({e, dialog}) {
          expect(e).to.be.instanceOf(Event);
          expect(dialog).to.be.instanceOf(HTMLDialogElement);
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
