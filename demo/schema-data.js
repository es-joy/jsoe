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
      description: 'With unknown keys strict',
      type: 'object',
      unknownKeys: 'strict',
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
    }
  ]
};

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

const schemaInstanceJSON4 = {
  type: 'union',
  options: [
    {
      type: 'string',
      kind: 'email'
    },
    {
      description: 'An undefined',
      type: 'undefined'
    }
  ]
};

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
      type: 'any',
      checks: [{name: 'filelist'}, {name: 'file'}]
    },
    // `never` could technically be in the following, too, but probably
    //    not meaningful:
    //    catchall, record value, map key/value, promise value
    //    effect inner, catch innerType
    {
      description: 'A never',
      type: 'never'
    }
  ]
};

const schemaInstanceJSON8 = {
  type: 'union',
  options: [
    {
      type: 'null'
    },
    {
      description: 'A native enum',
      type: 'nativeEnum',
      values: {
        0: 'abc',
        abc: 0,
        def: 'ghi'
      }
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

const schemaInstanceJSON9 = {
  type: 'union',
  options: [
    {
      description: 'A null',
      type: 'null'
    },
    {
      type: 'nativeEnum',
      values: {
        0: 'abc',
        abc: 0,
        def: 'ghi'
      }
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
  schemaInstanceJSON10, schemaInstanceJSON11,
  makeNoneditableType
};
