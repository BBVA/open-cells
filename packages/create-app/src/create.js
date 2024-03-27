#!/usr/bin/env node

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
