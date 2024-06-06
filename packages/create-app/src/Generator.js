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

/* eslint-disable no-console, import/no-cycle */
import path from 'path';
import { writeFilesToDisk, optionsToCommand } from '@open-wc/create/dist/core.js';
import _Generator from '@open-wc/create/dist/Generator.js';
import chalk from 'chalk';

/**
 * Options for the generator
 * @typedef {object} GeneratorOptions
 * @property {string} [name] the workshop name
 * @property {string} [destinationPath='auto'] path to output to. default value 'auto' will output to current working directory
 * @property {'true'|'false'} [writeToDisk] whether to write to disk
 */

class Generator extends _Generator.default {
  constructor() {
    super();
    this.generatorName = 'create-app';
  }

  execute() {
    if (this.options.name) {
      const { name } = this.options;
      this.templateData = { ...this.templateData, name };

      if (this.options.destinationPath === 'auto') {
        this.options.destinationPath = path.join(process.cwd(), name);
      }
    }
  }

  async end() {
    if (this.wantsWriteToDisk) {
      this.options.writeToDisk = await writeFilesToDisk();
    }

    if (this.wantsRecreateInfo) {
      console.log(chalk.white('You are all set up now!'));
      console.log('');
      console.log('To go into the application directory, run:');
      console.log(chalk.cyanBright(`  cd ${this.templateData.name}`));
      console.log('');
      console.log('Then run:');
      console.log(chalk.cyanBright(`  npm install`));
      console.log(chalk.cyanBright('  npm run dev'));
      console.log('');
      console.log('If you want to rerun this exact same generator you can do so by executing:');
      console.log(optionsToCommand(this.options, this.generatorName));
    }
  }
}

export default Generator;
