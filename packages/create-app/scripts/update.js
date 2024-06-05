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

import * as fs from 'fs';
import * as path from 'path';

function deleteDirectoryContents(directory, isRecursive) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const curPath = path.join(directory, file);
    if (fs.lstatSync(curPath).isDirectory()) {
      if (isRecursive) {
        deleteDirectoryContents(curPath, isRecursive);
      }
      fs.rmdirSync(curPath);
    } else {
      fs.unlinkSync(curPath);
    }
  }
}

function copyDirectory(source, destination, isRecursive) {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination);
  } else {
    deleteDirectoryContents(destination, isRecursive);
  }

  const files = fs.readdirSync(source);
  for (const file of files) {
    const curSource = path.join(source, file);
    const curDest = path.join(destination, file);
    if (fs.lstatSync(curSource).isDirectory()) {
      if (isRecursive) {
        copyDirectory(curSource, curDest, isRecursive);
      }
    } else {
      fs.copyFileSync(curSource, curDest);
    }
  }
}

function copyPackageJSON(inputPath, outputPath) {
  const inputData = fs.readFileSync(inputPath, 'utf8');

  const jsonObject = JSON.parse(inputData);

  jsonObject.name = '<%= name %>';

  const outputData = JSON.stringify(jsonObject, null, 2);
  fs.writeFileSync(outputPath, outputData);
}

function replaceTitle(html) {
  const textContent = html.replace(/<title>(.*?)<\/title>/, '<title><%= name %></title>');
  return textContent;
}

function copyIndexHtml(inputPath, outputPath) {
  const inputData = fs.readFileSync(inputPath, 'utf8');
  fs.writeFileSync(outputPath, replaceTitle(inputData));
}

// recipes app

copyDirectory(
  path.join('..', 'example', 'recipes-app', 'src'),
  path.join('.', 'src', 'example-webapp', 'static', 'src'),
  true,
);
copyDirectory(
  path.join('..', 'example', 'recipes-app', 'images'),
  path.join('.', 'src', 'example-webapp', 'static', 'images'),
  true,
);

copyPackageJSON(
  path.join('..', 'example', 'recipes-app', 'package.json'),
  path.join('.', 'src', 'example-webapp', 'templates', 'package.json'),
);

copyIndexHtml(
  path.join('..', 'example', 'recipes-app', 'index.html'),
  path.join('.', 'src', 'example-webapp', 'templates', 'index.html'),
);

fs.copyFileSync(
  path.join('..', 'example', 'recipes-app', 'tsconfig.json'),
  path.join('.', 'src', 'example-webapp', 'static', 'root', 'tsconfig.json'),
);

// blank app

copyDirectory(
  path.join('..', 'example', 'blank-app', 'src'),
  path.join('.', 'src', 'blank-webapp', 'static', 'src'),
  true,
);
copyDirectory(
  path.join('..', 'example', 'blank-app', 'images'),
  path.join('.', 'src', 'blank-webapp', 'static', 'images'),
  true,
);

copyPackageJSON(
  path.join('..', 'example', 'blank-app', 'package.json'),
  path.join('.', 'src', 'blank-webapp', 'templates', 'package.json'),
);

copyIndexHtml(
  path.join('..', 'example', 'blank-app', 'index.html'),
  path.join('.', 'src', 'blank-webapp', 'templates', 'index.html'),
);

fs.copyFileSync(
  path.join('..', 'example', 'blank-app', 'tsconfig.json'),
  path.join('.', 'src', 'blank-webapp', 'static', 'root', 'tsconfig.json'),
);
