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
