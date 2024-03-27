import { BlankWebappMixin } from '../blank-webapp/index.js';
import { ExampleWebappMixin } from '../example-webapp/index.js';

export function gatherMixins(options) {
  const mixins = [];

  switch (options.type) {
    case 'blankWebapp':
      mixins.push(BlankWebappMixin);
      break;
    case 'exampleWebapp':
      mixins.push(ExampleWebappMixin);
      break;
    // no default
  }

  return mixins;
}
