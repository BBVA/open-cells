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
  return textContent ;
}

function copyIndexHtml(inputPath, outputPath) {
  const inputData = fs.readFileSync(inputPath, 'utf8');
  fs.writeFileSync(outputPath, replaceTitle(inputData));
}

copyDirectory('../example/recipes-app/src', './src/example-webapp/static/src', true);
copyDirectory('../example/recipes-app/images', './src/example-webapp/static/images', true);

copyPackageJSON(
  '../example/recipes-app/package.json',
  './src/example-webapp/templates/package.json',
);

copyIndexHtml('../example/recipes-app/index.html', './src/example-webapp/templates/index.html');
fs.copyFileSync(
  '../example/recipes-app/tsconfig.json',
  './src/example-webapp/static/root/tsconfig.json',
);
