import fs from 'node:fs';
import path from 'node:path';

export const renderText = (template, data) => {
  let result = template;
  Object.keys(data).forEach((key) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    result = result.replace(regex, data[key]);
  });
  return result;
};

const copyAndRender = (templatePath, outputPath, data) => {
  const stats = fs.statSync(templatePath);
  const finalOutputPath = renderText(outputPath, data);

  if (stats.isDirectory()) {
    if (!fs.existsSync(finalOutputPath)) {
      fs.mkdirSync(finalOutputPath, { recursive: true });
    }
    for (const file of fs.readdirSync(templatePath)) {
      copyAndRender(path.join(templatePath, file), path.join(finalOutputPath, file), data);
    }
  } else if (stats.isFile()) {
    if (templatePath.endsWith('.tpl')) {
      const finalFilePath = finalOutputPath.slice(0, -4);
      const content = fs.readFileSync(templatePath, 'utf-8');
      fs.writeFileSync(finalFilePath, renderText(content, data), 'utf-8');
    } else {
      fs.copyFileSync(templatePath, finalOutputPath);
    }
  }
};

export const render = (templateDir, data, outputDir) => {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  for (const file of fs.readdirSync(templateDir)) {
    copyAndRender(path.join(templateDir, file), path.join(outputDir, file), data);
  }
};
