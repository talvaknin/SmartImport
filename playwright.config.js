import { defineConfig, devices } from '@playwright/test'

// Smoke tests run against the production build served by `vite preview`.
// The webServer block builds + serves automatically before tests.
export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:4173/SmartImport/',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run preview -- --port 4173',
    url: 'http://localhost:4173/SmartImport/',
    timeout: 120000,
    reuseExistingServer: true,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
})
