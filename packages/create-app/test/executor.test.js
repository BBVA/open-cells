import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

describe('exec — non-interactive mode', () => {
  let tmpDir;
  let originalCwd;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'create-app-exec-test-'));
    originalCwd = process.cwd();
    process.chdir(tmpDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('creates the app directory with the blank scaffold when all flags are provided', async () => {
    const { exec } = await import('../src/executor.js');
    await exec(['--name', 'test-app', '--scaffold', 'blank']);

    expect(existsSync(join(tmpDir, 'test-app'))).toBe(true);
    expect(existsSync(join(tmpDir, 'test-app', 'package.json'))).toBe(true);
    expect(existsSync(join(tmpDir, 'test-app', 'index.html'))).toBe(true);
  });

  it('creates the app directory with the example scaffold', async () => {
    const { exec } = await import('../src/executor.js');
    await exec(['--name', 'example-app', '--scaffold', 'example']);

    expect(existsSync(join(tmpDir, 'example-app', 'src', 'pages', 'home', 'home-page.ts'))).toBe(
      true,
    );
    expect(
      existsSync(join(tmpDir, 'example-app', 'src', 'pages', 'recipe', 'recipe-page.ts')),
    ).toBe(true);
    expect(existsSync(join(tmpDir, 'example-app', 'src', 'components', 'meals.ts'))).toBe(true);
  });

  it('throws when the target directory already exists', async () => {
    const { exec } = await import('../src/executor.js');
    await exec(['--name', 'existing-app', '--scaffold', 'blank']);

    await expect(exec(['--name', 'existing-app', '--scaffold', 'blank'])).rejects.toThrow(
      'already exists',
    );
  });

  it('throws when an unknown scaffold is given', async () => {
    const { exec } = await import('../src/executor.js');
    await expect(exec(['--name', 'my-app', '--scaffold', 'unknown'])).rejects.toThrow(
      'Unknown scaffold',
    );
  });

  it('throws when the name contains invalid characters', async () => {
    const { exec } = await import('../src/executor.js');
    await expect(exec(['--name', 'MyApp', '--scaffold', 'blank'])).rejects.toThrow(
      'Invalid app name',
    );
  });

  it('prints help and returns without creating anything when --help is passed', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const { exec } = await import('../src/executor.js');
    await exec(['--help']);

    expect(consoleSpy).toHaveBeenCalled();
    expect(existsSync(join(tmpDir, 'any-app'))).toBe(false);

    consoleSpy.mockRestore();
  });
});
