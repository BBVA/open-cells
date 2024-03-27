import { fileURLToPath } from 'url';
import path from 'path';
import { WebappMixin } from '../app/webappMixin.js';

export const BlankWebappMixin = (subclass) =>
  class extends WebappMixin(subclass) {
    constructor() {
      super();
      const __filename = fileURLToPath(import.meta.url);
      this.__dirname = path.dirname(__filename);
    }
  };
