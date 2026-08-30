/* eslint-disable promise/avoid-new -- Our own API */
import {jml, nbsp, body} from '../vendor-imports.js';
import {$e} from './templateUtils.js';

/**
 * @typedef {{[key: string]: string}} Locale
 */

/** @type {Locale} */
const localeStrings = {
  submit: 'Submit',
  cancel: 'Cancel',
  ok: 'Ok'
};

// Todo: i18nize
const dialogs = {
  /** @type {Locale} */
  localeStrings: {},
  /**
   * @param {Locale} [locale]
   * @returns {void}
   */
  setLocale (locale = {}) {
    this.localeStrings = {...localeStrings, ...locale};
  },

  /**
   * @typedef {object} MakeDialogArgs
   * @property {import('jamilih').JamilihAttributes} [atts={}]
   * @property {import('jamilih').JamilihChildren} [children=[]]
   * @property {import('jamilih').EventHandler|boolean} [close]
   * @property {boolean} [remove=true]
   */
  /**
   * @param {MakeDialogArgs} cfg
   * @returns {HTMLDialogElement}
   */
  makeDialog ({atts = {}, children = [], close, remove = true} = {}) {
    if (close) {
      if (!atts.$on) {
        atts.$on = {};
      }
      if (!('close' in atts.$on)) {
        atts.$on.close = /** @type {import('jamilih').EventHandler} */ (close);
      }
    }
    const dialog = jml('dialog', atts, children, body);
    dialog.showModal();
    if (remove) {
      dialog.addEventListener('close', () => {
        dialog.remove();
      });
    }
    return dialog;
  },
  /**
   * @typedef {object} MakeCancelArgs
   * @property {(
   *   info: {e: Event, dialog: HTMLDialogElement}
   * ) => boolean} [cancel]
   * @property {string} [cancelClass]
   * @property {string} [submitClass]
   * @property {...MakeDialogArgs} [args]
   */
  /**
   * @param {MakeCancelArgs} cfg
   * @returns {HTMLDialogElement}
   */
  makeCancelDialog ({
    cancel,
    cancelClass = 'cancel', submitClass = 'submit',
    ...args
  }) {
    const dialog = this.makeDialog(/** @type {MakeDialogArgs} */ (args));
    jml('div', {class: submitClass}, [
      ['br'], ['br'],
      ['button', {class: cancelClass, $on: {
        click (e) {
          e.preventDefault();
          if (cancel) {
            if (
              cancel.call(
                this, {e, dialog}
              )
            ) {
              return;
            }
          }
          dialog.close();
        }
      }}, [this.localeStrings.cancel]]
    ], dialog);
    return dialog;
  },
  /**
   * @param {object} cfg
   * @param {(info: {e: Event, dialog: HTMLDialogElement}) => void} cfg.submit
   * @param {string} [cfg.submitText]
   * @param {string} [cfg.submitClass]
   * @param {MakeCancelArgs} [cfg.args]
   * @returns {HTMLDialogElement}
   */
  makeSubmitDialog ({submit, submitText, submitClass = 'submit', ...args}) {
    const dialog = this.makeCancelDialog(/** @type {MakeCancelArgs} */ (args));
    $e(dialog, `button.${/** @type {MakeCancelArgs} */ (
      args
    ).cancelClass || 'cancel'}`)?.before(
      jml('button', {
        class: submitClass,
        $on: {
          click (e) {
            submit.call(this, {e, dialog});
          }
        }
      }, [submitText ?? this.localeStrings.submit]),
      nbsp.repeat(2)
    );
    return dialog;
  },
  /**
   * @param {string|{
   *   submitClass?: string,
   *   message: string|import('jamilih').JamilihArray
   * }} message
   * @returns {Promise<void>}
   */
  alert (message) {
    message = typeof message === 'string' ? {message} : message;
    const {submitClass = 'submit'} = message;
    const {message: outputMessage} = message;
    return new Promise((resolve /* , _reject */) => {
      const dialog = jml('dialog', [
        outputMessage,
        ['br'], ['br'],
        ['div', {class: submitClass}, [
          ['button', {$on: {click () {
            dialog.close();
            resolve();
          }}}, [this.localeStrings.ok]]
        ]]
      ], body);
      dialog.showModal();
    });
  },
  /**
   * @param {object} cfg
   * @param {import('jamilih').JamilihAttributes} [cfg.atts]
   * @param {string|{message: string}} cfg.message
   * @param {string} [cfg.submitClass]
   */
  confirm ({atts = {}, message, submitClass = 'submit'}) {
    ({message} = typeof message === 'string' ? {message} : message);
    return new Promise((
      /** @type {(value?: any) => void} */
      resolve,
      reject
    ) => {
      const dialog = jml('dialog', atts, [
        message,
        ['br'], ['br'],
        ['div', {class: submitClass}, [
          ['button', {$on: {click () {
            dialog.close();
            resolve();
          }}}, [this.localeStrings.ok]],
          nbsp.repeat(2),
          ['button', {$on: {click () {
            dialog.close();
            reject(new Error('cancelled'));
          }}}, [this.localeStrings.cancel]]
        ]]
      ], body);
      dialog.showModal();
    });
  }
};

dialogs.setLocale();

export default dialogs;
