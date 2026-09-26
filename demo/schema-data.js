/** @type {import('zodexy').SzUnion<any>} */
const schemaInstanceJSON = {
  type: 'union',
  options: [
    {
      description: 'A boolean',
      type: 'boolean'
    },
    {
      description: 'A number',
      type: 'number'
    },
    {
      description: 'A NaN',
      type: 'nan'
    },
    {
      description: 'A BigInt',
      type: 'bigInt'
    },
    {
      description: 'A string',
      type: 'string'
    }
  ]
};

/** @type {import('zodexy').SzUnion<any>} */
const schemaInstanceJSON2 = {
  type: 'union',
  options: [
    {
      description: 'A void',
      type: 'void'
    },
    {
      description: 'An enum',
      type: 'enum',
      values: ['abc', 'def', 'ghi'],
      defaultValue: 'def'
    },
    {
      description: 'Literal boolean',
      type: 'literal',
      values: [false]
    },
    {
      description: 'Literal number',
      type: 'literal',
      values: [135]
    },
    {
      description: 'Literal string',
      type: 'literal',
      values: ['abcde']
    },
    {
      description: 'Literal BigInt',
      type: 'literal',
      values: [123n]
    },
    {
      description: 'Literal null',
      type: 'literal',
      values: [null]
    },
    {
      description: 'Literal undefined',
      type: 'literal',
      values: [undefined]
    },
    {
      description: 'An object',
      type: 'object',
      properties: {}
    },
    {
      description: 'With properties',
      type: 'object',
      properties: {
        abc: {
          type: 'object',
          description: 'Abc',
          properties: {
            def: {
              description: 'A count',
              type: 'number'
            }
          }
        }
      }
    },
    {
      description: 'With optional property',
      type: 'object',
      properties: {
        requiredProperty: {
          description: 'Required',
          type: 'number'
        },
        okProperty: {
          description: 'Ok',
          type: 'string',
          isOptional: true
        }
      }
    },
    {
      description: 'With never property',
      type: 'object',
      properties: {
        badProperty: {
          type: 'never',
          isOptional: true
        }
      }
    },
    {
      description: 'With never catchall',
      type: 'object',
      catchall: {
        type: 'never'
      },
      properties: {
        okProperty: {
          description: 'OK property',
          type: 'string',
          isOptional: true
        }
      }
    },
    {
      description: 'With catchall schema',
      type: 'object',
      catchall: {
        description: 'Catchall number',
        type: 'number'
      },
      properties: {
        requiredProperty: {
          type: 'boolean'
        },
        okProperty: {
          type: 'string',
          isOptional: true
        }
      }
    },

    {
      description: 'An array with mins and maxes',
      type: 'array',
      minLength: 2,
      maxLength: 4,
      element: {
        description: 'Cat',
        type: 'string'
      }
    },
    {
      description: 'With never',
      type: 'array',
      element: {
        type: 'never'
      }
    },
    {
      description: 'A set with mins and maxes',
      type: 'set',
      minSize: 2,
      maxSize: 4,
      value: {
        description: 'A Set item',
        type: 'string'
      }
    },
    {
      description: 'With never',
      type: 'set',
      value: {
        type: 'never'
      }
    },
    {
      description: 'A tuple',
      type: 'tuple',
      items: [
        {
          description: 'A number',
          type: 'number'
        },
        {
          description: 'A string',
          type: 'string'
        }
      ],
      rest: {
        description: 'A null',
        type: 'null'
      }
    },
    {
      description: 'With never rest',
      type: 'tuple',
      items: [
        {
          type: 'string'
        }
      ],
      rest: {
        type: 'never'
      }
    },
    {
      description: 'A RegExp',
      type: 'any',
      checks: [{name: 'regexp'}]
    },
    {
      description: 'A Blob',
      type: 'any',
      checks: [{name: 'blob'}]
    },
    {
      description: 'A Boolean object',
      type: 'any',
      checks: [{name: 'BooleanObject'}]
    },
    {
      description: 'A Number object',
      type: 'any',
      checks: [{name: 'NumberObject'}]
    },
    {
      description: 'A String object',
      type: 'any',
      checks: [{name: 'StringObject'}]
    },
    {
      description: 'A special real number',
      type: 'any',
      checks: [{name: 'SpecialRealNumber'}]
    },
    {
      description: 'A DOMException',
      type: 'any',
      checks: [{name: 'domexception'}]
    },
    {
      description: 'An Error',
      type: 'any',
      checks: [{name: 'error'}]
    },
    {
      description: 'A File',
      type: 'any',
      checks: [{name: 'file'}]
    },
    {
      description: 'A Constrained File',
      type: 'file',
      max: 0,
      mime: ['text/plain']
    },
    {
      description: 'A Min-Constrained File',
      type: 'file',
      min: 1
    },
    {
      description: 'A BufferSource',
      type: 'any',
      checks: [{name: 'buffersource'}]
    },
    {
      description: 'A DOMMatrix',
      type: 'any',
      checks: [{name: 'dommatrix'}]
    },
    {
      description: 'A DOMPoint',
      type: 'any',
      checks: [{name: 'dompoint'}]
    },
    {
      description: 'A DOMRect',
      type: 'any',
      checks: [{name: 'domrect'}]
    },
    {
      description: 'A special error',
      type: 'any',
      checks: [{name: 'errors'}]
    },
    {
      description: 'A BigInt object',
      type: 'any',
      checks: [{name: 'bigintObject'}]
    },
    {
      description: 'Template literal',
      type: 'templateLiteral',
      parts: ['item-', {type: 'number'}],
      defaultValue: 'item-42'
    }
  ]
};

/** @type {import('zodexy').SzUnion<any>} */
const schemaInstanceJSON3 = {
  type: 'union',
  options: [
    {
      description: 'A date',
      type: 'date'
    },
    {
      type: 'string',
      kind: 'date'
    },
    {
      description: 'An HTML Blob',
      type: 'any',
      checks: [{name: 'blobHTML'}]
    },
    {
      description: 'A Non-editable',
      type: 'any',
      checks: [{name: 'resurrectable'}] // noneditable
    }
  ]
};

/** @type {import('zodexy').SzUnion<any>} */
const schemaInstanceJSON4 = {
  type: 'union',
  options: [
    {
      type: 'string',
      kind: 'email',
      pattern: String.raw`^brettz\d@yahoo\.com$`,
      flags: 'i'
    },
    {
      description: 'An undefined',
      type: 'undefined'
    },
    {
      description: 'Flagless Email',
      type: 'string',
      kind: 'email',
      pattern: String.raw`^brettz\d@yahoo\.com$`
    },
    {
      description: 'Sensitive Stringbool',
      type: 'pipe',
      inner: {type: 'string'},
      outer: {type: 'boolean'},
      case: 'sensitive',
      truthy: ['yes', 'true'],
      falsy: ['no', 'false']
    }
  ]
};

/** @type {import('zodexy').SzUnion<any>} */
const schemaInstanceJSON5 = {
  type: 'union',
  options: [
    {
      description: 'A null',
      type: 'null'
    },
    {
      type: 'string',
      kind: 'url'
    }
  ]
};

/** @type {import('zodexy').SzUnion<any>} */
const schemaInstanceJSON6 = {
  type: 'union',
  options: [
    {
      type: 'boolean',
      defaultValue: false
    },
    {
      type: 'number',
      defaultValue: 15
    },
    {
      type: 'bigInt',
      defaultValue: '1234567890'
    },
    {
      type: 'string',
      defaultValue: 'something to default'
    },
    {
      type: 'date',
      defaultValue: '1999-01-01'
    }
  ]
};

/** @type {import('zodexy').SzUnion<any>} */
const schemaInstanceJSON7 = {
  type: 'union',
  options: [
    {
      description: 'With no items and never rest',
      type: 'tuple',
      items: [],
      rest: {
        type: 'never'
      }
    },
    {
      description: 'A map',
      type: 'map',
      key: {
        description: 'A map key number',
        type: 'number'
      },
      value: {
        description: 'A map value string',
        type: 'string'
      }
    },
    {
      description: 'A map with mins and maxes',
      type: 'map',
      min: 2,
      max: 4,
      key: {
        description: 'A constrained map key',
        type: 'number'
      },
      value: {
        description: 'A constrained map value',
        type: 'string'
      }
    },
    {
      description: 'A map with max zero',
      type: 'map',
      max: 0,
      key: {
        type: 'number'
      },
      value: {
        type: 'string'
      }
    },
    {
      description: 'A record',
      type: 'record',
      key: {
        description: 'A record key number',
        // Todo: Reenable and fix for symbol keys and viewUI (need to first add
        //         typeson support for symbol key iteration?)
        // type: 'symbol'
        type: 'number'
      },
      value: {
        description: 'A record value string',
        type: 'string'
      }
    },
    {
      type: 'record',
      key: {
        description: 'A record key string',
        type: 'string'
      },
      value: {
        description: 'A record value number',
        type: 'number'
      }
    },
    {
      description: 'A FileList',
      type: 'codec',
      name: 'filelist',
      input: {
        type: 'instanceof',
        name: 'filelist'
      },
      output: {
        type: 'array',
        element: {
          description: 'A text File',
          type: 'file',
          min: 1,
          max: 10_000,
          mime: ['text/markdown', 'application/json']
        }
      }
    },
    // `never` could technically be in the following, too, but probably
    //    not meaningful:
    //    catchall, record value, map key/value, promise value
    //    instanceof name, catch innerType
    {
      description: 'A never',
      type: 'never'
    }
  ]
};

/** @type {import('zodexy').SzUnion<any>} */
const schemaInstanceJSON8 = {
  type: 'union',
  options: [
    {
      type: 'null'
    },
    {
      description: 'An enum',
      type: 'enum',
      values: {ghi: 'ghi', zero: 0}
    },
    {
      description: 'With never items and no rest',
      type: 'tuple',
      items: [
        {
          type: 'never'
        }
      ]
    }
  ]
};

/** @type {import('zodexy').SzUnion<any>} */
const schemaInstanceJSON9 = {
  type: 'union',
  options: [
    {
      description: 'A null',
      type: 'null'
    },
    {
      type: 'enum',
      values: {ghi: 'ghi', zero: 0}
    },
    {
      type: 'boolean'
    },
    {
      type: 'literal',
      values: [135]
    },
    {
      type: 'nan'
    },
    {
      type: 'void'
    },
    {
      type: 'enum',
      values: ['abcd', 'efgh', 'ijkl'],
      defaultValue: 'efgh'
    },
    {
      description: 'An array with undefined elements',
      type: 'array',
      element: {
        type: 'union',
        options: [
          {
            type: 'void'
          },
          {
            type: 'undefined'
          },
          {
            type: 'string'
          }
        ]
      }
    }
  ]
};

/** @type {import('zodexy').SzUnion<any>} */
const schemaInstanceJSON10 = {
  type: 'union',
  options: [
    {
      type: 'nan'
    },
    {
      description: 'A catch',
      type: 'catch',
      value: 'abc',
      innerType: {
        description: 'An overpassed string',
        type: 'string'
      }
    }
  ]
};

/** @type {import('zodexy').SzUnion<any>} */
const schemaInstanceJSON11 = {
  type: 'union',
  options: [
    {
      type: 'nan'
    },
    {
      type: 'catch',
      value: 'abc',
      innerType: {
        type: 'string'
      }
    }
  ]
};

// A strict `record` and a `looseRecord` that share a *constrained* key schema
//   (property names must be at least three characters). With an unconstrained
//   key schema the two record modes are indistinguishable; the constraint is
//   what surfaces the difference: the strict `record` rejects a non-conforming
//   key, whereas the `looseRecord` passes such an entry through untouched (its
//   `value` schema is not imposed on it).
/** @type {import('zodexy').SzUnion<any>} */
const schemaInstanceJSON12 = {
  type: 'union',
  options: [
    {
      description: 'Strict record',
      type: 'record',
      key: {
        description: 'A record key (min three chars)',
        type: 'string',
        min: 3
      },
      value: {
        description: 'A record value number',
        type: 'number'
      }
    },
    {
      description: 'Loose record',
      type: 'looseRecord',
      key: {
        description: 'A record key (min three chars)',
        type: 'string',
        min: 3
      },
      value: {
        description: 'A record value number',
        type: 'number'
      }
    }
  ]
};

// A `FileList` whose own schema carries a `description` but whose `element`
//   (each individual `File`) does not - unlike `schemaInstanceJSON7`'s
//   "A FileList" (whose element is described "A text File", which always
//   takes priority over the container's own label for a file's own item
//   legend). This is the one shape that lets `arrayType.js`'s `buildLegend`
//   fall through to the container's own label (`fileDesc`) for each file
//   item's legend.
/** @type {import('zodexy').SzCodec} */
const schemaInstanceJSON13 = {
  description: 'A FileList (unlabeled files)',
  type: 'codec',
  name: 'filelist',
  input: {
    type: 'instanceof',
    name: 'filelist'
  },
  output: {
    type: 'array',
    element: {
      type: 'file'
    }
  }
};

// `xor` (exclusive union): exactly one branch may match. The `string` and the
//   email `string` overlap deliberately: a value like `a@b.com` satisfies both
//   branches, so it is valid under `union` but invalid under `xor`.
/** @type {import('zodexy').SzXor<any>} */
const schemaInstanceJSONXor = {
  type: 'xor',
  options: [
    {
      description: 'Any text',
      type: 'string'
    },
    {
      description: 'An email address',
      type: 'string',
      kind: 'email'
    },
    {
      description: 'A number',
      type: 'number'
    }
  ]
};

// `xor` of object branches: the shape best suited to a per-branch radio group.
//   Branches carry a `description` for the branch label and differ by which
//   properties they define.
/** @type {import('zodexy').SzXor<any>} */
const schemaInstanceJSONXor2 = {
  type: 'xor',
  options: [
    {
      description: 'Pay by card',
      type: 'object',
      properties: {
        cardNumber: {type: 'string', kind: 'credit_card'},
        expiry: {type: 'string'},
        securityCode: {type: 'string'}
      }
    },
    {
      description: 'Bank transfer',
      type: 'object',
      properties: {
        iban: {type: 'string'},
        sortCode: {type: 'string'}
      }
    },
    {
      description: 'Store credit',
      type: 'object',
      properties: {
        voucherId: {type: 'string'}
      }
    }
  ]
};

// `xor` whose branches carry no `description` - exercises
//   `deriveXorBranchLabel`'s (`src/typeChoices.js`) own fallback label
//   derivation, unlike `schemaInstanceJSONXor`/`schemaInstanceJSONXor2`
//   above (every branch of which supplies its own `description`): a
//   `literal` branch's label falls back to its first value, an `object`
//   branch's to its property names, and any other branch (e.g. `boolean`
//   here) to its own type name.
/** @type {import('zodexy').SzXor<any>} */
const schemaInstanceJSONXor3 = {
  type: 'xor',
  options: [
    {type: 'literal', values: ['red', 'green']},
    {
      type: 'object',
      properties: {
        foo: {type: 'string'},
        bar: {type: 'number'}
      }
    },
    {type: 'boolean'},
    {
      type: 'object',
      properties: {
        foo: {type: 'string'},
        bar: {type: 'number'},
        baz: {type: 'boolean'},
        qux: {type: 'string'}
      }
    }
  ]
};

// Exercises Zodexy `meta`: `meta.title` as the visible label, `meta.description`
// Additive fixtures for demo/index-search.js (search plan §7 test plan) -
//   shapes the existing fixtures above don't already cover.

/** @type {import('zodexy').SzDate} */
const schemaInstanceJSONSearchDate = {
  description: 'A date with a real range, for the search range-widget test',
  type: 'date',
  min: Date.parse('2020-01-01T00:00:00.000Z'),
  max: Date.parse('2029-12-31T00:00:00.000Z')
};

/** @type {import('zodexy').SzTuple} */
const schemaInstanceJSONSearchTupleRest = {
  description: 'A tuple with rest',
  type: 'tuple',
  items: [{type: 'string'}, {type: 'number'}],
  rest: {type: 'boolean'}
};

/** @type {import('zodexy').SzRecord} */
const schemaInstanceJSONSearchRecord = {
  description: 'A record',
  type: 'record',
  key: {type: 'string'},
  value: {type: 'number'}
};

/** @type {import('zodexy').SzLooseRecord} */
const schemaInstanceJSONSearchLooseRecord = {
  description: 'A loose record',
  type: 'looseRecord',
  key: {type: 'string'},
  value: {type: 'number'}
};

// A `resurrectable`-checked schema *at the search root* (rather than nested
//   as an object property, as the `allTypes` fixture's own `resurrectable`
//   property is) - `stubSearchType`'s rendered stub has no `$define` methods
//   of its own, so `objectSearchType.js`'s child dispatch never calls into
//   its `getQuery`/`applyQuery` for a *nested* stub; only the top-level
//   `SearchChoicesControl.$getQuery`/`$applyQuery` call a root schema's own
//   `SearchTypeObject.getQuery`/`applyQuery` directly, so this is the one
//   way to exercise those two functions at all.
/** @type {import('zodexy').SzType} */
const schemaInstanceJSONSearchResurrectableRoot = /** @type {any} */ ({
  type: 'any',
  checks: [{name: 'resurrectable'}]
});

/** @type {import('zodexy').SzDiscriminatedUnion} */
const schemaInstanceJSONSearchDiscriminatedUnion = {
  description: 'A discriminated union with a date branch',
  type: 'discriminatedUnion',
  discriminator: 'kind',
  options: [
    {
      type: 'object',
      properties: {
        kind: {type: 'literal', values: ['event']},
        when: {type: 'date', isOptional: true}
      }
    },
    {
      type: 'object',
      properties: {
        kind: {type: 'literal', values: ['note']},
        text: {type: 'string', isOptional: true}
      }
    }
  ]
};

// jsoe represents several runtime types via zodexy's "checked" mechanism -
//   `{type: 'any', checks: [{name: 'blob'}]}` for `Blob`, and similarly for
//   `regexp`, `error`, `domrect`, etc. (`getCheckedType`,
//   `src/formats/schema.js`); this fixture object collects one of each,
//   marked optional, for the search demo's additive "has property" pulldown
//   to expose them all through one schema.
/** @type {import('zodexy').SzObject} */
const schemaInstanceJSONSearchAllTypes = {
  description: 'One property per search-supported type',
  type: 'object',
  properties: {
    // No `isOptional`, exercising `objectSearchType.js`'s required-property
    // path: its own widget is always shown, with no has/doesn't-have toggle.
    requiredString: {
      description: 'A required property (always shown, no has/doesn’t have toggle)',
      type: 'string'
    },
    date: {...schemaInstanceJSONSearchDate, isOptional: true},
    number: {type: 'number', isOptional: true},
    bigint: {type: 'bigInt', isOptional: true},
    string: {type: 'string', isOptional: true},
    regexp: {type: 'any', checks: [{name: 'regexp'}], isOptional: true},
    boolean: {type: 'boolean', isOptional: true},
    // A boxed `Boolean` object - `searchDispatch.js` deliberately dispatches
    //   this to the same `booleanSearchType.js` as plain `boolean`, since a
    //   search leaf only cares about "true or false", not how the value was
    //   constructed.
    booleanObject: {type: 'any', checks: [{name: 'BooleanObject'}], isOptional: true},
    symbol: {type: 'symbol', isOptional: true},
    undef: {type: 'undefined', isOptional: true},
    nullValue: {type: 'null', isOptional: true},
    nan: {type: 'nan', isOptional: true},
    enum: {type: 'enum', values: {red: 'red', green: 'green'}, isOptional: true},
    // A numeric-valued enum: the key is necessarily a descriptive label
    //   distinct from the (stringified) value, unlike a plain string-valued
    //   `z.enum([...])` (whose key always equals its own value).
    enumNumeric: {
      type: 'enum', values: {zero: 0, one: 1}, isOptional: true
    },
    array: {type: 'array', element: {type: 'number'}, isOptional: true},
    object: {
      type: 'object',
      properties: {nested: {type: 'string', isOptional: true}},
      isOptional: true
    },
    objectAllRequired: {
      type: 'object',
      properties: {req: {type: 'string'}},
      isOptional: true
    },
    objectEmpty: {
      type: 'object',
      properties: {},
      isOptional: true
    },
    map: {type: 'map', key: {type: 'string'}, value: {type: 'number'}, isOptional: true},
    set: {type: 'set', value: {type: 'number'}, isOptional: true},
    tuple: {...schemaInstanceJSONSearchTupleRest, isOptional: true},
    record: {...schemaInstanceJSONSearchRecord, isOptional: true},
    filelist: {
      type: 'codec', name: 'filelist',
      input: {type: 'instanceof', name: 'filelist'},
      output: {type: 'array', element: {type: 'file'}},
      isOptional: true
    },
    file: {type: 'file', isOptional: true},
    blob: {type: 'any', checks: [{name: 'blob'}], isOptional: true},
    error: {type: 'any', checks: [{name: 'error'}], isOptional: true},
    errors: {type: 'any', checks: [{name: 'errors'}], isOptional: true},
    domexception: {type: 'any', checks: [{name: 'domexception'}], isOptional: true},
    promise: {type: 'promise', value: {type: 'number'}, isOptional: true},
    catch: {
      type: 'catch', innerType: {type: 'string'}, value: 'fallback',
      isOptional: true
    },
    function: {
      type: 'function',
      input: {type: 'tuple', items: [{type: 'number'}]},
      output: {type: 'boolean'},
      isOptional: true
    },
    union: {
      type: 'union', options: [{type: 'string'}, {type: 'number'}], isOptional: true
    },
    xor: {
      type: 'xor', options: [{type: 'boolean'}, {type: 'string'}], isOptional: true
    },
    discriminatedUnion: {...schemaInstanceJSONSearchDiscriminatedUnion, isOptional: true},
    domrect: {type: 'any', checks: [{name: 'domrect'}], isOptional: true},
    dompoint: {type: 'any', checks: [{name: 'dompoint'}], isOptional: true},
    dommatrix: {type: 'any', checks: [{name: 'dommatrix'}], isOptional: true},
    blobHTML: {type: 'any', checks: [{name: 'blobHTML'}], isOptional: true},
    specialRealNumber: {
      type: 'any', checks: [{name: 'SpecialRealNumber'}], isOptional: true
    },
    buffersource: {type: 'any', checks: [{name: 'buffersource'}], isOptional: true},
    resurrectable: {type: 'any', checks: [{name: 'resurrectable'}], isOptional: true},
    // Not a real recognized check name - exercises `getSearchTypeObject`'s
    //   `?? noneditableSearchType` fallback for a schema shape with no
    //   registered entry at all (as opposed to `resurrectable` above, which
    //   is itself a registered key).
    unrecognizedCheckedType: {
      type: 'any', checks: [{name: 'notARealCheckedType'}], isOptional: true
    },
    // Resolves to exactly one type (`string`), exercising
    //   `resolveIntersection`'s `merged.length === 1` branch.
    intersectionSingle: {
      type: 'intersection',
      left: {type: 'string'},
      right: {type: 'string'},
      isOptional: true
    },
    // The left side is a union of two distinctly-shaped `object`s; merging
    //   each with the same unconstrained `object` on the right still leaves
    //   them distinguishable, so the intersection resolves to more than one
    //   type - exercising `resolveIntersection`'s "hand to
    //   `unionSearchType.js`" branch.
    intersectionMulti: {
      type: 'intersection',
      left: {
        type: 'union',
        options: [
          {type: 'object', properties: {intersectionA: {type: 'string'}}},
          {type: 'object', properties: {intersectionB: {type: 'number'}}}
        ]
      },
      right: {type: 'object', properties: {}},
      isOptional: true
    }
  }
};

// Demonstrates every recognized `meta` key: `title`/`description` (also
//   as tooltip-only long text, plus `id`, `deprecated`, a custom key, and the
//   reserved `jsoe` directive namespace, all surfaced through the info toggle.
/** @type {import('zodexy').SzObject} */
const schemaInstanceJSONMeta = {
  type: 'object',
  meta: {
    title: 'Widget',
    description: 'A widget is the top-level configurable unit of the demo.',
    id: 'widget'
  },
  properties: {
    label: {
      type: 'string',
      meta: {
        title: 'Display label',
        description: 'Shown to end users; keep it under 40 characters.'
      }
    },
    legacyName: {
      type: 'string',
      meta: {
        title: 'Legacy name',
        deprecated: true,
        description: 'Retained for old integrations; use "Display label".'
      }
    },
    rows: {
      type: 'array',
      element: {type: 'array', element: {type: 'number'}},
      meta: {
        title: 'Rows',
        jsoe: {tableView: true},
        'x-unit': 'pixels'
      }
    }
  }
};

/**
 *
 */
const makeNoneditableType = () => {
  /**
   *
   */
  class NonEditableType {
    /* eslint-disable class-methods-use-this -- `this` not needed */
    /**
     * @returns {string}
     */
    get [Symbol.toStringTag] () {
      /* eslint-enable class-methods-use-this -- `this` not needed */
      return 'NonEditableType';
    }
  }
  return new NonEditableType();
};

export {
  schemaInstanceJSON, schemaInstanceJSON2, schemaInstanceJSON3,
  schemaInstanceJSON4, schemaInstanceJSON5, schemaInstanceJSON6,
  schemaInstanceJSON7, schemaInstanceJSON8, schemaInstanceJSON9,
  schemaInstanceJSON10, schemaInstanceJSON11, schemaInstanceJSON12,
  schemaInstanceJSON13,
  schemaInstanceJSONXor, schemaInstanceJSONXor2, schemaInstanceJSONXor3,
  schemaInstanceJSONMeta,
  schemaInstanceJSONSearchDate,
  schemaInstanceJSONSearchTupleRest,
  schemaInstanceJSONSearchRecord,
  schemaInstanceJSONSearchLooseRecord,
  schemaInstanceJSONSearchDiscriminatedUnion,
  schemaInstanceJSONSearchAllTypes,
  schemaInstanceJSONSearchResurrectableRoot,
  makeNoneditableType
};
