import { input, confirm, select } from '@inquirer/prompts';
import { render } from './lib/templates.js';
import { dirname, join } from 'node:path';
import { mkdirSync, existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SCAFFOLDS = ['blank', 'example'];

const NAME_PATTERN = /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/;

const validateName = (name) => {
  if (!NAME_PATTERN.test(name)) {
    return 'Use only lowercase letters, digits, and hyphens (must start and end with a letter or digit)';
  }
  return true;
};

const printHelp = () => {
  console.log(`
Usage: create-app [options]

Options:
  -n, --name <name>          Application name (lowercase letters, digits and hyphens)
  -s, --scaffold <scaffold>  Scaffold type: blank | example
  -i, --install              Install dependencies after scaffolding
  -h, --help                 Show this help

Scaffolds:
  blank    Minimal app shell, ready to build on
  example  Two-page app demonstrating Open Cells navigation
`);
};

const installDependencies = (cwd) =>
  new Promise((resolve, reject) => {
    console.log('📦 Installing dependencies...');
    const isWindows = process.platform === 'win32';
    const child = spawn(
      isWindows ? 'cmd' : 'npm',
      isWindows ? ['/c', 'npm', 'install'] : ['install'],
      { cwd, stdio: 'inherit' },
    );
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`npm install failed (exit code ${code})`));
    });
  });

const gatherInteractive = async () => {
  const name = await input({
    message: 'Application name',
    validate: (v) => {
      const result = validateName(v);
      return result === true ? true : result;
    },
  });
  const scaffold = await select({
    message: 'Choose a scaffold',
    choices: [
      { name: 'Blank   — minimal app shell with two pages with navigation', value: 'blank' },
      { name: 'Example — a recipes app showcasing Open Cells features', value: 'example' },
    ],
  });
  const install = await confirm({ message: 'Install dependencies after scaffolding?' });
  return { name, scaffold, install };
};

export const exec = async (argv = []) => {
  const { values } = parseArgs({
    args: argv,
    options: {
      name: { type: 'string', short: 'n' },
      scaffold: { type: 'string', short: 's' },
      install: { type: 'boolean', short: 'i' },
      help: { type: 'boolean', short: 'h' },
    },
    strict: false,
  });

  if (values.help) {
    printHelp();
    return;
  }

  let options;
  if (values.name && values.scaffold) {
    options = { name: values.name, scaffold: values.scaffold, install: values.install ?? false };
  } else {
    options = await gatherInteractive();
  }

  const { name, scaffold, install } = options;

  const nameValidation = validateName(name);
  if (nameValidation !== true) {
    throw new Error(`Invalid app name "${name}": ${nameValidation}`);
  }

  if (!SCAFFOLDS.includes(scaffold)) {
    throw new Error(`Unknown scaffold "${scaffold}". Valid options: ${SCAFFOLDS.join(', ')}`);
  }

  const outputDir = join(process.cwd(), name);
  if (existsSync(outputDir)) {
    throw new Error(
      `Directory "${name}" already exists. Choose a different name or delete the existing directory`,
    );
  }

  console.log(`\n🪄 Creating "${name}" with the "${scaffold}" scaffold...\n`);

  const templateDir = join(__dirname, 'templates', scaffold);
  const data = { name, _gitignore: '.gitignore' };

  mkdirSync(outputDir, { recursive: true });
  render(templateDir, data, outputDir);

  if (install) {
    try {
      await installDependencies(outputDir);
    } catch (err) {
      console.warn(`\n⚠️  App created but dependency installation failed: ${err.message}`);
      console.warn(`   Run 'npm install' manually inside the "${name}" directory.\n`);
    }
  }

  console.log(`\n✅ App \x1b[1m${name}\x1b[0m created successfully!`);
  console.log('\nNext steps:');
  console.log(`  cd ${name}`);
  if (!install) console.log('  npm install');
  console.log('  npm run dev\n');
};
