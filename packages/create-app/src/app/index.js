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

/* eslint-disable no-console */
import prompts from 'prompts';
import commandLineArgs from 'command-line-args';
import { executeMixinGenerator } from '@open-wc/create/dist/core.js';

import header from './header.js';
import { gatherMixins } from './gatherMixins.js';
import Generator from '../Generator.js';

/**
 * Allows to control the data via command line
 *
 * example:
 * npm init code-workshop-kit --type python --writeToDisk true
 */
const optionDefinitions = [
  { name: 'destinationPath', type: String },
  { name: 'type', type: String },
  { name: 'name', type: String },
  { name: 'writeToDisk', type: String },
];
const overrides = commandLineArgs(optionDefinitions);
prompts.override(overrides);

export const AppMixin = (subclass) =>
  // eslint-disable-next-line no-shadow
  class AppMixin extends subclass {
    constructor() {
      super();
      this.wantsWriteToDisk = false;
      this.wantsRecreateInfo = false;
    }

    async execute() {
      console.log(header);
      const questions = [
        {
          type: 'select',
          name: 'type',
          message: 'What kind of application would you like to scaffold?',
          choices: [
            { title: 'Open Cells blank webapp using Lit and Typescript', value: 'blankWebapp' },
            { title: 'Open Cells example webapp using Lit and Typescript', value: 'exampleWebapp' },
          ],
        },
        {
          type: 'text',
          name: 'name',
          message: 'What is the name of your application?',
          validate: (name) =>
            !/^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(name)
              ? 'Please use digits, hyphens and alphabetic A-Z letters only'
              : true,
        },
      ];

      this.options = await prompts(questions, {
        onCancel: () => {
          process.exit();
        },
      });

      const mixins = gatherMixins(this.options);
      // app is separate to prevent circular imports
      await executeMixinGenerator(mixins, this.options, Generator);
    }
  };

export default AppMixin;
