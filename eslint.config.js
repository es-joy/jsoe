import ashNazg from 'eslint-config-ash-nazg';
import {
  parser as typescriptEslintParser
} from 'typescript-eslint';

const typescriptEslintEnabled = false;

export default [
  {
    name: 'JSOE/Ignores',
    ignores: [
      'coverage',
      'instrumented',
      'ignore',
      'src/deepEqual.js',
      'vendor',
      'typings/**',
      'dist',
      'docs'
    ]
  },
  ...(typescriptEslintEnabled
    ? {
      languageOptions: {
        parser: typescriptEslintParser,
        parserOptions: {
          projectService: {
            // eslint-disable-next-line camelcase -- API
            maximumDefaultProjectFileMatchCount_THIS_WILL_SLOW_DOWN_LINTING: 500,
            allowDefaultProject: [
              '*.js', '.ncurc.cjs', 'demo/*.js'
            ]
          },
          tsconfigRootDir: import.meta.dirname
        }
      }
    }
    : {}),
  ...ashNazg(['sauron', 'browser']),
  {
    name: 'JSOE/Coverage',
    settings: {
      coverage: true
    }
  },
  {
    name: 'JSOE/Markdown',
    files: ['*.md/*.js'],
    rules: {
      'import/unambiguous': 'off'
    }
  },
  {
    name: 'JSOE/Cypress',
    files: ['cypress/**'],
    rules: {
      'unicorn/no-empty-file': 'off',
      // Cypress auto-handles
      'mocha/no-async-in-sync-tests': 0,
      // Redundant
      'sonarjs/no-fixed-wait-in-tests': 0,
      'sonarjs/assertions-in-tests': 0,
      'sonarjs/no-empty-test-file': 0 // Bug
    }
  },
  {
    name: 'JSOE/main rules',
    rules: {
      'no-console': 0,
      'no-shadow': 0,

      // For now
      'jsdoc/reject-any-type': 0,
      'jsdoc/reject-function-type': 0,
      'unicorn/no-this-outside-of-class': 0,
      'sonarjs/prefer-regexp-exec': 0,

      // Too cumbersome with @type casts
      '@stylistic/max-len': 0,

      '@stylistic/quotes': ['error', 'single', {
        avoidEscape: true, allowTemplateLiterals: 'always'
      }],

      'jsdoc/require-jsdoc': ['warn', {
        contexts: [
          'Program > VariableDeclaration > ' +
            'VariableDeclarator > ArrowFunctionExpression',
          'Program > VariableDeclaration > ' +
            'VariableDeclarator > FunctionExpression',
          'ExportNamedDeclaration > VariableDeclaration > ' +
            'VariableDeclarator > ArrowFunctionExpression',
          'ExportNamedDeclaration > VariableDeclaration > ' +
            'VariableDeclarator > FunctionExpression',
          'ExportDefaultDeclaration > ArrowFunctionExpression',
          'ExportDefaultDeclaration > FunctionExpression',

          'ClassDeclaration',
          'ClassExpression',
          'FunctionDeclaration', // Default is true
          'MethodDefinition'
        ]
      }],

      // Disable until find time
      'prefer-named-capture-group': 0,
      // Disable; waiting on https://github.com/mysticatea/eslint-plugin-node/issues/162
      'n/no-unpublished-import': 0,
      'unicorn/no-this-assignment': 0,

      // Disable in ash-nazg?
      'unicorn/no-top-level-assignment-in-function': 0,
      'unicorn/no-top-level-side-effects': 0,

      // Good but slow
      ...(typescriptEslintEnabled
        ? {
        'jsdoc/no-unnecessary-type-assertion': ['error', {
          checkLiteralConstAssertions: true,
          preferConstToLiteralTuples: true,
          treatAnyAsRedundant: false,
          typesToIgnore: [
            `import('../types.js').SuperTypeObject`
          ]
        }]
      }
      : {})
    }
  }
];
