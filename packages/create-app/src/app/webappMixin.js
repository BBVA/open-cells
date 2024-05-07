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

      this.__dirname = null; // Implement this in the mixin
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

            const toPath = filePath.replace(replace, `${toDir}/`);
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
