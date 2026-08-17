import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderText, render } from '../src/lib/templates.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

describe('renderText', () => {
  it('replaces a placeholder with the matching data value', () => {
    expect(renderText('Hello {{ name }}!', { name: 'world' })).toBe('Hello world!');
  });

  it('replaces multiple occurrences of the same key', () => {
    expect(renderText('{{ a }}-{{ a }}', { a: 'x' })).toBe('x-x');
  });

  it('handles whitespace inside placeholders', () => {
    expect(renderText('{{  name  }}', { name: 'test' })).toBe('test');
  });

  it('leaves placeholders intact when the key is not in data', () => {
    expect(renderText('{{ unknown }}', {})).toBe('{{ unknown }}');
  });

  it('replaces multiple different keys', () => {
    expect(renderText('{{ a }} and {{ b }}', { a: 'foo', b: 'bar' })).toBe('foo and bar');
  });
});

describe('render — blank scaffold', () => {
  let tmpDir;
  const templateDir = join(__dirname, '..', 'src', 'templates', 'blank');

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'create-app-test-'));
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('creates the output directory when it does not exist', () => {
    const outputDir = join(tmpDir, 'new-dir');
    render(templateDir, { name: 'my-app', _gitignore: '.gitignore' }, outputDir);
    expect(existsSync(outputDir)).toBe(true);
  });

  it('renders package.json with the app name substituted', () => {
    const outputDir = join(tmpDir, 'my-app');
    render(templateDir, { name: 'my-app', _gitignore: '.gitignore' }, outputDir);

    const pkg = JSON.parse(readFileSync(join(outputDir, 'package.json'), 'utf-8'));
    expect(pkg.name).toBe('my-app');
  });

  it('renders index.html with the app name in the title', () => {
    const outputDir = join(tmpDir, 'my-app');
    render(templateDir, { name: 'my-app', _gitignore: '.gitignore' }, outputDir);

    const html = readFileSync(join(outputDir, 'index.html'), 'utf-8');
    expect(html).toContain('<title>my-app</title>');
  });

  it('writes .gitignore (not {{_gitignore}})', () => {
    const outputDir = join(tmpDir, 'my-app');
    render(templateDir, { name: 'my-app', _gitignore: '.gitignore' }, outputDir);

    expect(existsSync(join(outputDir, '.gitignore'))).toBe(true);
    expect(existsSync(join(outputDir, '{{_gitignore}}'))).toBe(false);
  });

  it('copies static files unchanged', () => {
    const outputDir = join(tmpDir, 'my-app');
    render(templateDir, { name: 'my-app', _gitignore: '.gitignore' }, outputDir);

    expect(existsSync(join(outputDir, 'tsconfig.json'))).toBe(true);
    expect(existsSync(join(outputDir, 'images', 'favicon.svg'))).toBe(true);
  });
});

describe('render — example scaffold', () => {
  let tmpDir;
  const templateDir = join(__dirname, '..', 'src', 'templates', 'example');

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'create-app-test-'));
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('renders package.json with the app name and required dependencies', () => {
    const outputDir = join(tmpDir, 'my-example');
    render(templateDir, { name: 'my-example', _gitignore: '.gitignore' }, outputDir);

    const pkg = JSON.parse(readFileSync(join(outputDir, 'package.json'), 'utf-8'));
    expect(pkg.name).toBe('my-example');
    expect(pkg.dependencies).toHaveProperty('@open-cells/page-controller');
    expect(pkg.dependencies).toHaveProperty('@material/web');
    expect(pkg.dependencies).toHaveProperty('@open-cells/page-transitions');
  });

  it('includes all page components', () => {
    const outputDir = join(tmpDir, 'my-example');
    render(templateDir, { name: 'my-example', _gitignore: '.gitignore' }, outputDir);

    expect(existsSync(join(outputDir, 'src', 'pages', 'home', 'home-page.ts'))).toBe(true);
    expect(existsSync(join(outputDir, 'src', 'pages', 'category', 'category-page.ts'))).toBe(true);
    expect(existsSync(join(outputDir, 'src', 'pages', 'recipe', 'recipe-page.ts'))).toBe(true);
    expect(
      existsSync(join(outputDir, 'src', 'pages', 'favorite-recipes', 'favorite-recipes-page.ts')),
    ).toBe(true);
    expect(existsSync(join(outputDir, 'src', 'pages', 'not-found', 'not-found-page.ts'))).toBe(
      true,
    );
  });

  it('includes the meals service and config', () => {
    const outputDir = join(tmpDir, 'my-example');
    render(templateDir, { name: 'my-example', _gitignore: '.gitignore' }, outputDir);

    expect(existsSync(join(outputDir, 'src', 'components', 'meals.ts'))).toBe(true);
    expect(existsSync(join(outputDir, 'src', 'components', 'page-layout.ts'))).toBe(true);
    expect(existsSync(join(outputDir, 'src', 'config', 'app.config.js'))).toBe(true);
  });
});
