/* eslint-disable unicorn/no-barrel-files -- Convenient to toggle */

export {jml, body, nbsp, $} from 'jamilih';
// export {jml, body, nbsp, $} from '../node_modules/jamilih/dist/jml.mjs';

export {
  getJSONType, Typeson, unescapeKeyPathComponent,
  structuredCloningForStorage,
  resurrectable, toStringTag, hasConstructorOf, symbol, promise
} from 'typeson-registry';
// } from '../node_modules/typeson-registry/dist/index.js';

export {
  parse as parseAcorn
} from 'acorn';
// } from '../node_modules/acorn/dist/acorn.mjs';

export {default as mimeStandardTypes} from 'mime/types/standard.js';
export {default as mimeOtherTypes} from 'mime/types/other.js';
// } from '../node_modules/mime/dist/types/standard.js';
// } from '../node_modules/mime/dist/types/other.js';

export {default as JSON6} from 'json-6';
// } from '../node_modules/json-6/dist/index.mjs';

export {EditorView, basicSetup} from 'codemirror';
// } from '../node_modules/codemirror/dist/index.js';

export {EditorState} from '@codemirror/state';
// } from '../node_modules/@codemirror/state/dist/index.js';

export {javascript} from '@codemirror/lang-javascript';
// } from '../node_modules/@codemirror/lang-javascript/dist/index.js';
