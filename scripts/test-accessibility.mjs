import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
for (const args of [
  ['node_modules/next/dist/bin/next', 'build'],
  ['node_modules/@playwright/test/cli.js', 'test', ...process.argv.slice(2)],
]) {
  const result = spawnSync(process.execPath, args, { cwd: root, stdio: 'inherit', env: { ...process.env, DATA_MODE: 'preview', NEXT_TELEMETRY_DISABLED: '1' } });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}
