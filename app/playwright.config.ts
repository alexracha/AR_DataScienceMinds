import { defineConfig } from "@playwright/test";

const PORT = 3200;
// Use the pre-installed Chromium when present; otherwise Playwright's own browser.
const executablePath = process.env.CHROMIUM_PATH ?? (process.env.PLAYWRIGHT_BROWSERS_PATH ? `${process.env.PLAYWRIGHT_BROWSERS_PATH}/chromium` : undefined);

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  fullyParallel: true,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    launchOptions: executablePath ? { executablePath } : {},
    trace: "retain-on-failure",
  },
  projects: [
    { name: "mobile-375", use: { viewport: { width: 375, height: 800 } } },
    { name: "desktop-1280", use: { viewport: { width: 1280, height: 900 } } },
  ],
  // Dev server so valid submissions succeed without Supabase (see route.ts).
  webServer: {
    command: `npx next dev -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    // Never reuse: a stale server on this port would silently test old code.
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
