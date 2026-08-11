/* eslint-disable unicorn/no-barrel-files -- Convenient to toggle */

export {jml, body, nbsp, $} from 'jamilih';
// export {jml, body, nbsp, $} from '../node_modules/jamilih/dist/jml.mjs';

export {
  getJSONType, Typeson, unescapeKeyPathComponent, structuredCloningThrowing,
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
