import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import copy from "../content/copy.json";

// The API rate limit is per IP, so give each test its own. Random, because
// parallel workers share one server and must not collide.
const octet = () => 1 + Math.floor(Math.random() * 254);
const uniqueIp = () => `10.${octet()}.${octet()}.${octet()}`;

const validLead = {
  name: "Jane Smith",
  email: "jane@acme.com",
  company: "Acme",
  message: "We spend hours every week on quotes and follow-ups.",
};

test.describe("page structure", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders 13 sections (nav + 12 in main) with one h1", async ({ page }) => {
    await expect(page.locator("header")).toHaveCount(1);
    await expect(page.locator("main > section")).toHaveCount(12);
    await expect(page.locator("h1")).toHaveCount(1);
  });

  test("hero headline comes from copy.json", async ({ page }) => {
    await expect(page.locator("h1")).toHaveText(copy.hero.headline);
  });

  test("every CTA in main and nav points to the form", async ({ page }) => {
    const ctas = page.locator("header a, main a").filter({ hasText: /audit|talk to us|get results|find out|book|start with|get the/i });
    const count = await ctas.count();
    expect(count).toBeGreaterThanOrEqual(10);
    for (let i = 0; i < count; i++) {
      await expect(ctas.nth(i)).toHaveAttribute("href", "#contact");
    }
  });

  test("no horizontal scroll", async ({ page }) => {
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow).toBe(false);
  });

  test("FAQ items are present and open on click", async ({ page }) => {
    const items = page.locator("#faq details");
    await expect(items).toHaveCount(copy.faq.items.length);
    await items.first().locator("summary").click();
    await expect(items.first()).toHaveAttribute("open", "");
  });

  test("placeholders are visibly highlighted", async ({ page }) => {
    const marks = page.locator("mark");
    expect(await marks.count()).toBeGreaterThan(0);
  });
});

test.describe("form", () => {
  test.beforeEach(async ({ page }) => {
    await page.setExtraHTTPHeaders({ "x-forwarded-for": uniqueIp() });
    await page.goto("/");
  });

  test("labels are tied to inputs", async ({ page }) => {
    for (const f of copy.form.fields) {
      await expect(page.getByLabel(f.label, { exact: true })).toBeVisible();
    }
  });

  test("empty submit shows four errors and clears one when typing", async ({ page }) => {
    await page.locator("#contact button[type=submit]").click();
    const alerts = page.locator("#contact form [role=alert]");
    await expect(alerts).toHaveCount(4);
    await page.fill("#name", "Jane");
    await expect(alerts).toHaveCount(3);
  });

  test("invalid email is rejected client-side", async ({ page }) => {
    await page.fill("#name", "Jane");
    await page.fill("#email", "not-an-email");
    await page.fill("#company", "Acme");
    await page.fill("#message", "Long enough message here");
    await page.locator("#contact button[type=submit]").click();
    await expect(page.locator("#email-err")).toHaveText(copy.form.errors.email);
  });

  test("valid submit shows the success message", async ({ page }) => {
    await page.fill("#name", validLead.name);
    await page.fill("#email", validLead.email);
    await page.fill("#company", validLead.company);
    await page.fill("#message", validLead.message);
    await page.locator("#contact button[type=submit]").click();
    await expect(page.getByRole("status")).toContainText(copy.form.success);
  });

  test("honeypot is hidden from people and assistive tech", async ({ page }) => {
    const trap = page.locator("input[name=website]");
    await expect(trap).toHaveAttribute("tabindex", "-1");
    await expect(page.locator("div[aria-hidden]").filter({ has: trap })).toHaveCount(1);
    // Parked far off-screen (Playwright still counts off-screen boxes as "visible").
    const box = await trap.boundingBox();
    expect(box === null || box.x < -1000).toBe(true);
  });
});

test.describe("lead API", () => {
  const post = (request: import("@playwright/test").APIRequestContext, data: unknown, ip = uniqueIp()) =>
    request.post("/api/lead", { data, headers: { "x-forwarded-for": ip } });

  test("accepts a valid lead", async ({ request }) => {
    const res = await post(request, validLead);
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  test("rejects invalid data with field errors", async ({ request }) => {
    const res = await post(request, { name: "", email: "bad", company: "", message: "short" });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(Object.keys(body.fields).sort()).toEqual(["company", "email", "message", "name"]);
  });

  test("rejects malformed JSON", async ({ request }) => {
    const res = await request.post("/api/lead", {
      data: "not json",
      headers: { "content-type": "application/json", "x-forwarded-for": uniqueIp() },
    });
    expect(res.status()).toBe(400);
  });

  test("honeypot fill looks like success to a bot", async ({ request }) => {
    const res = await post(request, { ...validLead, website: "http://spam.example" });
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  test("rate limits the 6th request from one IP", async ({ request }) => {
    const ip = uniqueIp();
    const statuses: number[] = [];
    for (let i = 0; i < 6; i++) statuses.push((await post(request, validLead, ip)).status());
    expect(statuses.slice(0, 5)).toEqual([200, 200, 200, 200, 200]);
    expect(statuses[5]).toBe(429);
  });
});

test.describe("placeholder gate", () => {
  const run = (env: NodeJS.ProcessEnv) => {
    try {
      execFileSync("node", ["scripts/check-placeholders.mjs"], { env, stdio: "pipe" });
      return 0;
    } catch (e) {
      return (e as { status: number }).status;
    }
  };

  test("fails while [REPLACE] remains and passes with the override", () => {
    const hasPlaceholders = JSON.stringify(copy).includes("[REPLACE");
    const base = { ...process.env, ALLOW_PLACEHOLDERS: "" };
    expect(run(base)).toBe(hasPlaceholders ? 1 : 0);
    expect(run({ ...base, ALLOW_PLACEHOLDERS: "1" })).toBe(0);
  });
});
