import { executeMixinGenerator } from '@open-wc/create/dist/core.js';
import { gatherMixins } from './gatherMixins.js';
import Generator from '../Generator.js';

export async function executeViaOptions(options) {
  const mixins = gatherMixins(options);

  await executeMixinGenerator(mixins, options, Generator);
}
