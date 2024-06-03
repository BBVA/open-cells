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

import path from 'path';
import { glob } from 'glob';
import fs from 'fs';
import core from '@open-wc/create/dist/core.js';

/* eslint-disable no-console */
export const WebappMixin = (subclass) =>
  class extends subclass {
    // eslint-disable-next-line class-methods-use-this
    writeFileToPath(filePath, content) {
      let addNewFile = true;
      core.virtualFiles.forEach((fileMeta, index) => {
        if (fileMeta.path === filePath) {
          core.virtualFiles[index].content = content;
          addNewFile = false;
        }
      });

      if (addNewFile === true) {
        core.virtualFiles.push({
          path: filePath,
          content,
        });
      }
    }

    constructor() {
      super();

      this.__dirname = path.resolve(); // Set __dirname to the current directory
      this.templatingOpts = { openDelimiter: '<', closeDelimiter: '>', delimiter: '%' };
      this.templatingOptsNoReplace = {
        openDelimiter: 'null',
        closeDelimiter: 'null',
        delimiter: 'null',
      };
    }

    // eslint-disable-next-line class-methods-use-this
    readFileFromPath(filePath) {
      let content = false;
      core.virtualFiles.forEach((fileMeta, index) => {
        if (fileMeta.path === filePath) {
          // eslint-disable-next-line prefer-destructuring
          content = core.virtualFiles[index].content;
        }
      });

      if (content) {
        return content;
      }

      if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath);
      }

      return false;
    }

    // eslint-disable-next-line class-methods-use-this
    async copyFiles(fromGlob, toDir = process.cwd()) {
      const files = await glob(fromGlob, { dot: true });

      const copiedFiles = [];
      files.forEach((filePath) => {
        if (!fs.lstatSync(filePath).isDirectory()) {
          const fileContent = this.readFileFromPath(filePath);

          if (fileContent !== false) {
            const processed = fileContent;
            const replace = path.join(fromGlob.replace(/\*/g, '')).replace(/\\(?! )/g, '/');
            const toPath = path.join(toDir, path.relative(replace, filePath));

            copiedFiles.push({
              toPath,
              processed,
            });
            this.writeFileToPath(toPath, processed);
          }
        }
      });
      return copiedFiles;
    }

    async execute() {
      await super.execute();

      await this.copyFiles(`${this.__dirname}/static/root/**/*`, `${this.destinationPath()}/`);
      await this.copyFiles(`${this.__dirname}/static/src/**/*`, `${this.destinationPath()}/src`);
      await this.copyFiles(
        `${this.__dirname}/static/images/**/*`,
        `${this.destinationPath()}/images`,
      );

      if (this.options.type === 'exampleWebapp') {
        await this.copyFiles(
          `${this.__dirname}/static/typings/**/*`,
          `${this.destinationPath()}/typings`,
        );
      }

      this.copyTemplateJsonInto(
        `${this.__dirname}/templates/package.json`,
        this.destinationPath('package.json'),
        this.templatingOpts,
      );

      this.copyTemplate(
        `${this.__dirname}/templates/index.html`,
        this.destinationPath('index.html'),
        this.templatingOpts,
      );
    }
  };
