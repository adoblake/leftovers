import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';
const browserPath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);

export default defineConfig({
  testDir: './tests/e2e',
  workers: 1,
  fullyParallel: false,
  timeout: 120000,
  expect: { timeout: 10000 },
  reporter: [['list'], ['json', { outputFile: 'test-results/accessibility-results.json' }]],
  use: {
    baseURL: 'http://localhost:3150',
    browserName: 'chromium',
    actionTimeout: 10000,
    navigationTimeout: 20000,
    viewport: { width: 1440, height: 1000 },
    reducedMotion: 'reduce',
    launchOptions: { executablePath: browserPath, args: ['--no-sandbox'] },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: [
    { command: 'node tests/fixtures/supabase.mjs', url: 'http://127.0.0.1:3152/health', reuseExistingServer: false },
    { command: 'npm start -- --port 3150', url: 'http://localhost:3150', env: { DATA_MODE: 'preview', APP_ORIGIN: 'http://localhost:3150' }, reuseExistingServer: false },
    { command: 'npm start -- --port 3151', url: 'http://localhost:3151/dashboard', env: { DATA_MODE: 'supabase', APP_ORIGIN: 'http://localhost:3151', SUPABASE_URL: 'http://127.0.0.1:3152', SUPABASE_ANON_KEY: 'fictional-local-test-key' }, reuseExistingServer: false },
  ],
});
