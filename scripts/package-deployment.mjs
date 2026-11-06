import { cpSync, existsSync, lstatSync, mkdtempSync, readdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const staging = mkdtempSync(join(tmpdir(), 'leftovers-source-'));
const output = process.argv[2] ? resolve(process.argv[2]) : join(tmpdir(), `leftovers-deployment-${Date.now()}.tar.gz`);
const files = [
  'app', 'components', 'lib', 'public', 'supabase', 'tests', 'scripts', 'docs',
  'package.json', 'package-lock.json', 'tsconfig.json', 'next-env.d.ts',
  'next.config.ts', 'vitest.config.ts', 'vercel.json', '.vercelignore', 'netlify.toml',
  '.gitignore', '.nvmrc', '.env.example', 'README.md', 'AGENTS.md',
];
function rejectSymlinks(path) {
  const info = lstatSync(path);
  if (info.isSymbolicLink()) throw new Error('Deployment packaging does not follow symlinks.');
  if (info.isDirectory()) for (const name of readdirSync(path)) rejectSymlinks(join(path, name));
}
try {
  if (existsSync(output)) throw new Error('Output already exists; choose a new archive path.');
  for (const file of files) {
    const source = join(root, file);
    rejectSymlinks(source);
    cpSync(source, join(staging, file), { recursive: true });
  }
  const result = spawnSync('tar', ['-czf', output, '-C', staging, '.'], { stdio: 'inherit' });
  if (result.status !== 0) throw new Error('Archive creation failed.');
  console.log(`Deployment source archive: ${output}`);
  console.log(`Size: ${statSync(output).size} bytes. No local submissions, installed packages, or credential files included.`);
} finally { rmSync(staging, { recursive: true, force: true }); }
