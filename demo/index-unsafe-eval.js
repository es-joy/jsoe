import {jml, body} from '../src/vendor-imports.js';

import {
  formatAndTypeChoices,
  Types
} from '../src/index.js';

// The only thing this demo adds over `demo/index.html`: a `Types` instance
//   built with `allowUnsafeEval: true`, so the raw-editor's "Edit raw"
//   button offers a "JS (eval)" mode alongside the always-available
//   "Typeson (JSON6)" one. Everything else here is the plain, no-key-path
//   type-choices setup already shown in `demo/index.js`.
const types = new Types({allowUnsafeEval: true});

const keyPathNotExpectedTypeChoices = await formatAndTypeChoices({
  hasKeyPath: false,
  typeNamespace: 'demo-unsafe-eval',
  types
});

jml('section', {role: 'main'}, [
  ['h1', [
    'Jsoe: raw editor with allowUnsafeEval'
  ]],
  ['p', [
    'This page constructs ', ['code', ['new Types({allowUnsafeEval: true})']],
    '. Use the button below to set an object value containing a ',
    ['code', ['Date']], ', then click that object control’s ',
    ['b', ['Edit raw']], ' button: unlike the plain ',
    ['a', {href: 'index.html'}, ['demo/index.html']],
    ' (no ', ['code', ['allowUnsafeEval']], '), a ',
    ['b', ['Typeson (JSON6) / JS (eval)']],
    ' mode selector appears. Switching to ', ['b', ['JS (eval)']],
    ' reseeds the editor with real ', ['code', ['new Date(...)']],
    ' source instead of Typeson-tagged JSON.'
  ]],

  ['form', {id: 'formatAndTypeChoices'}, [
    ...keyPathNotExpectedTypeChoices.domArray
  ]],

  ['button', {
    id: 'initializeWithValue',
    $on: {
      async click () {
        await keyPathNotExpectedTypeChoices.setValue({
          aDate: new Date(),
          aString: 'try switching to "JS (eval)" mode above'
        });
      }
    }
  }, ['Initialize with an object containing a Date']]
], body);
