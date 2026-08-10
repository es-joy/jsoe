// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

import codeCoverageTask from '@cypress/code-coverage/task.js';

// Reenable to see logs (also in e2e.ts)
// import cypressTerminalReport from
//   'cypress-terminal-report/src/installLogsPrinter.js';

/**
 * @param {Cypress.PluginEvents} on See {@link https://docs.cypress.io/api/plugins/writing-a-plugin.html#on}
 * @param {Cypress.PluginConfigOptions} config See {@link https://docs.cypress.io/guides/references/configuration.html#Command-Line}
 * @returns {Cypress.PluginConfigOptions}
 */
const exprt = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config

  // Set here instead of as Cypress environmental variables, for use here.

  config.env ||= {};

  // https://docs.cypress.io/guides/tooling/code-coverage.html#Install-the-plugin
  // @ts-expect-error Why problematic?
  codeCoverageTask(on, config);

  // cypressTerminalReport(on, {
  //   printLogsToConsole: 'always'
  // });

  // E.g.:
  // on('file:preprocessor', require('@cypress/code-coverage/use-babelrc.js'));
  // From https://github.com/cypress-io/code-coverage

  return config;
};

export default exprt;
