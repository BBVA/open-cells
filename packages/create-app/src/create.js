#!/usr/bin/env node

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

import semver from 'semver';
import chalk from 'chalk';
import { executeMixinGenerator } from '@open-wc/create/dist/core.js';
import Generator from './Generator.js';
import { AppMixin } from './app/index.js';

(async () => {
  try {
    if (semver.lte(process.version, '18.0.0')) {
      console.log(chalk.bgRed('\nLooks like you dont have Node v18.0.0 or higher installed!\n'));
      console.log(chalk.bgRed('Please install Node v18.0.0 or higher to use the create command\n'));
    } else {
      await executeMixinGenerator([AppMixin], {}, Generator);
    }
  } catch (err) {
    console.log(err);
  }
})();
