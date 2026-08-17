#!/usr/bin/env node

import { exec } from './executor.js';

exec(process.argv.slice(2)).catch((err) => {
  console.error(`❌ ${err.message}`);
  process.exit(1);
});
