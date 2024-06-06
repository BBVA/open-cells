/*
 * Copyright 2024 Bilbao Vizcaya Argentaria, S.A.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
