import { playwrightLauncher } from '@web/test-runner-playwright';

export default {
  files: 'test/**/*.test.js',
  //files: 'test/**/bridge.test.js',
  nodeResolve: true,
  coverage: true,
  watch: false,
  debug: false,
  playwright: true,
  browsers: [
    playwrightLauncher({
      launchOptions: {
        headless: true,
        devtools: true,
        args: ['--some-flag'],
      },
      product: 'chromium',
      contextOptions: {
        // This will clear the browser storage before each test
        storageState: {},
        // This will run each test in a separate browser context
        // and effectively launch a new browser for each test
        // parallel: 1,
      },
      // createBrowserContext: ({ browser, config }) => browser.newContext(),
      // createBrowserContext: ({ browser, config }) => {
      //   const browser = await playwright[config.product].launch({
      //     headless: true,
      //     devtools: true,
      //     args: ['--some-flag'],
      //   });
      //   return browser.newContext();
      // },
      // createPage: ({ context, config }) => context.newPage(),
    }),
  ],
  testFramework: {
    config: {
      timeout: '20000',
    },
  },
};
