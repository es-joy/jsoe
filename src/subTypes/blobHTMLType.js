/* globals sceditor -- No ESM version yet */
import {jml} from '../vendor-imports.js';
import {$e} from '../utils/templateUtils.js';
import {schemaLabel} from '../utils/schemaMeta.js';

import dialogs from '../utils/dialogs.js';
import {isNullish} from '../utils/types.js';

/**
 * @typedef {HTMLTextAreaElement & {
 *   sceditorInstance: {val: (val?: string) => string|void}
 * }} SCEditorTextarea
 */

/**
 * @type {import('../types.js').TypeObject & {
 *   loadBlob: (blob: Blob) => Promise<string>
 * }}
 */
const blobHTMLType = {
  // Todo (low): Support other content-types
  option: ['Blob (text/html)'],
  stringRegex: /^data:text\/html(?:;base64)?,.*$/u,
  valueMatch: (v) => v && v.type === 'text/html',
  superType: 'blob',
  toValue (s) {
    // Todo (low): `Blob` untested; use https://stackoverflow.com/a/30407840/271577 ?
    /**
     *
     * @param {string} dataURI
     * @returns {Blob}
     */
    function dataURIToBlob (dataURI) {
      // Adapted from https://stackoverflow.com/a/12300351/271577
      const pos = dataURI.indexOf(',');
      const mimeInfo = dataURI.slice(0, pos);
      const bytes = dataURI.slice(pos + 1);
      const [mimeString, encoding] = mimeInfo.split(':', 2)[1].split(';', 2);
      let ab;
      if (encoding === 'base64') {
        const byteString = atob(bytes);
        ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          // eslint-disable-next-line unicorn/prefer-code-point -- Only a byte
          ia[i] = byteString.charCodeAt(i);
        }
      } else {
        ab = bytes;
      }
      return new Blob([ab], {type: mimeString});
    }
    return {
      value: dataURIToBlob(s)
    };
  },
  /* istanbul ignore next -- No dupe keys, array refs, or validation */
  getInput ({root}) {
    return /** @type {HTMLTextAreaElement} */ (
      $e(root, 'textarea[name$=-blobHTML]')
    );
  },
  getValue ({root}) {
    return /** @type {import('../types.js').ToValue} */ (this.toValue)(
      'data:text/html,' + /** @type {SCEditorTextarea} */ (
        this.getInput({root})
      ).sceditorInstance.val()
      // this.getInput({root}).value
    ).value;
  },
  async loadBlob (blob) {
    return await blob.text();
  },
  async setValue ({root, value}) {
    const result = await this.loadBlob(value);
    /** @type {SCEditorTextarea} */ (
      this.getInput({root})
    ).sceditorInstance.val(result);
    // this.getInput({root}).value = result;
  },
  viewUI ({value, specificSchemaObject}) {
    /** @type {string} */
    let val;
    const div = jml('div', {
      dataset: {type: 'blobHTML'},
      title: schemaLabel(specificSchemaObject) ? 'HTML' : undefined
    }, [
      schemaLabel(specificSchemaObject) ?? 'HTML',
      ': ',
      ['button', {$on: {
        click () {
          dialogs.alert({message: ['div', [
            'Source: ',
            ['textarea', {class: 'view-source'}, [val]]
          ]]});
        }
      }}, ['View source']]
    ]);
    // eslint-disable-next-line promise/prefer-await-to-then -- Not an async method
    this.loadBlob(value).then((
      result
    ) => {
      val = result;
      jml('iframe', {
        sandbox: '',
        srcdoc: val
      }, div);
      return undefined;
    // eslint-disable-next-line promise/prefer-await-to-then -- Not an async method
    }).catch(
      /* istanbul ignore next -- How to simulate? */
      // eslint-disable-next-line promise/prefer-await-to-callbacks -- Not async
      (err) => {
        // Todo: Show an error message?
        console.error('Err', err);
      }
    );
    return [div];
    // return ['i', [`data:text/html,${value}`]];
  },
  editUI ({typeNamespace, specificSchemaObject, value}) {
    const textarea =
      /**
       * @type {SCEditorTextarea}
       */ (
        jml('textarea', {name: `${typeNamespace}-blobHTML`})
      );
    textarea.sceditorInstance = {
      /* istanbul ignore next */
      val () {
        throw new Error('Not yet instantiated');
      }
    };

    const root = jml(
      'div',
      {
        dataset: {type: 'blobHTML'},
        title: schemaLabel(specificSchemaObject) ?? 'Blob (HTML)'
      },
      [
        textarea
      ]
    );
    // SCEditor builds a WYSIWYG iframe, which only works once `textarea` is
    //   connected to the document. The caller attaches `root` after the build
    //   pipeline returns, and re-parenting an SCEditor iframe reloads it, so we
    //   wait here for connection rather than initialising eagerly (or letting
    //   the build pipeline await us, which would deadlock).
    let connectionTries = 0;
    const createWhenConnected = () => {
      if (!textarea.isConnected) {
        /* istanbul ignore else -- Bounded guard against a never-attached UI */
        if (connectionTries++ < 250) {
          setTimeout(createWhenConnected, 20);
        }
        return;
      }
      // Push onto these: https://www.sceditor.com/documentation/formats/xhtml/
      // sceditor.formats.xhtml.converters array
      // sceditor.formats.xhtml.allowedAttribs object
      // sceditor.formats.xhtml.disallowedAttribs object
      // sceditor.formats.xhtml.allowedTags array
      // sceditor.formats.xhtml.disallowedTags array
      // console.log(
      //  'sceditor.formats.xhtml.converters',
      //  sceditor.formats.xhtml.converters.map((c) => Object.keys(c.tags))
      // );
      // console.log(
      //   'sceditor.formats.xhtml.converters',
      //   sceditor.formats.xhtml.converters.map((c) => c.conv.toString())
      // );
      sceditor.create(textarea, {
        // Todo (low): "dragdrop" plugin is for file handling (could
        //   treat as Blobs but would need to reference them)
        // "autoyoutube" plugin may be ok
        // toolbarExclude (default of `null` doesn't exclude any)
        // Must also add languages files (after editor files but
        //   before editor creation)
        // locale: 'en',
        // emoticons: {}, icons, //
        // width, height, resizeMinWidth, resizeMinHeight, autoExpand: true,
        // autofocus, autofocusEnd
        // id, spellcheck, toolbarContainer, dropDownCss, fonts, colors
        // disableBlockRemove, parserOptions
        width: '1000px',
        height: '225px',
        // auto-updates original textbox when the editor loses focus
        autoUpdate: true,
        resizeMaxHeight: -1,
        resizeMaxWidth: -1,
        plugins: 'xhtml,plaintext,undo',
        emoticonsRoot: 'node_modules/sceditor/',
        style: '/node_modules/sceditor/minified/themes/content/default.min.css'
      });
      textarea.sceditorInstance = sceditor.instance(textarea);
      if (!isNullish(value)) {
        /** @type {Required<import('../types.js').TypeObject>} */ (
          this
        ).setValue({root, value});
      }
    };
    setTimeout(createWhenConnected, 0);
    return [root];
  }
};

export default blobHTMLType;
