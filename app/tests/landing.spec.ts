import { expect, test, type APIRequestContext } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import copy from "../content/copy.json";

const HONEYPOT = "alt_contact"; // must match HONEYPOT_FIELD in lib/schema.ts (checked below)

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

const strings = (o: unknown): string[] =>
  typeof o === "string" ? [o] : o && typeof o === "object" ? Object.values(o).flatMap(strings) : [];

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

  test("CTA invariants: every #contact link is a marked CTA, every non-nav link in main goes to the form", async ({ page }) => {
    const toForm = await page.locator('header a[href="#contact"], main a[href="#contact"]').count();
    const marked = await page.locator("[data-cta]").count();
    expect(marked).toBeGreaterThanOrEqual(10);
    expect(toForm).toBe(marked); // no unmarked CTA, no marked CTA pointing elsewhere
    const hrefs = await page.locator("main a[href]").evaluateAll((els) => els.map((e) => e.getAttribute("href")));
    for (const h of hrefs) expect(h).toBe("#contact");
    await expect(page.locator("[data-cta]").first()).toHaveAttribute("href", "#contact");
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

  test("placeholders and unconfirmed claims are visibly highlighted", async ({ page }) => {
    expect(await page.locator("mark").count()).toBeGreaterThan(0);
    // hero proof points are promises: each must carry the confirm marker until the owner approves
    for (const point of copy.hero.proofPoints) expect(point).toContain("[REPLACE: confirm]");
    await expect(page.locator("#top li mark")).toHaveCount(copy.hero.proofPoints.length);
  });

  test("interface labels come from copy.json", async ({ page }) => {
    await expect(page.locator("#services").getByText(copy.labels.serviceFor).first()).toBeVisible();
    await expect(page.locator("#contact").getByText(copy.labels.nextStepsHeading)).toBeVisible();
    await expect(page.locator("nav").first()).toHaveAttribute("aria-label", copy.labels.navAria);
  });

  test("tap targets are at least 44px", async ({ page }) => {
    const sel = "header a, footer a, summary, [data-cta], #contact button";
    const boxes = await page.locator(sel).evaluateAll((els) =>
      els
        .filter((e) => (e as HTMLElement).offsetParent !== null || getComputedStyle(e).position === "fixed")
        .map((e) => ({ t: (e.textContent ?? "").trim().slice(0, 30), h: e.getBoundingClientRect().height })),
    );
    expect(boxes.length).toBeGreaterThan(10);
    for (const b of boxes) expect(b.h, `"${b.t}" is ${b.h}px tall`).toBeGreaterThanOrEqual(43.5);
  });

  test("form placeholder contrast is at least 4.5:1", async ({ page }) => {
    const ratio = await page.evaluate(() => {
      // Computed colours can be oklab()/color-mix(); a canvas converts any CSS colour to sRGB.
      const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
      const toRgba = (css: string) => {
        ctx.clearRect(0, 0, 1, 1);
        ctx.fillStyle = "#000";
        ctx.fillStyle = css;
        ctx.fillRect(0, 0, 1, 1);
        const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
        return { r, g, b, a: a / 255 };
      };
      const lum = (r: number, g: number, b: number) => {
        const f = (v: number) => { const x = v / 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; };
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };
      const input = document.querySelector("#name") as HTMLElement;
      const fg = toRgba(getComputedStyle(input, "::placeholder").color);
      const bg = toRgba(getComputedStyle(input).backgroundColor);
      const mix = (f: number, b: number) => f * fg.a + b * (1 - fg.a);
      const L1 = lum(mix(fg.r, bg.r), mix(fg.g, bg.g), mix(fg.b, bg.b));
      const L2 = lum(bg.r, bg.g, bg.b);
      return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    });
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  test("loads with no console errors or CSP violations", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/", { waitUntil: "networkidle" });
    expect(errors).toEqual([]);
  });
});

test.describe("security headers", () => {
  test("sends the baseline security headers", async ({ request }) => {
    const res = await request.get("/");
    const h = res.headers();
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["x-frame-options"]).toBe("DENY");
    expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(h["strict-transport-security"]).toContain("max-age=");
    expect(h["permissions-policy"]).toContain("camera=()");
    expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(h["content-security-policy"]).toContain("object-src 'none'");
    expect(h["x-powered-by"]).toBeUndefined();
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
    await expect(page.getByRole("status")).toContainText(copy.labels.successTitle);
    await expect(page.getByRole("status")).toContainText(copy.form.success.replace(" [REPLACE: confirm]", ""));
  });

  test("honeypot is hidden from people and assistive tech, and is not named like a real field", async ({ page }) => {
    const trap = page.locator(`input[name=${HONEYPOT}]`);
    await expect(trap).toHaveAttribute("tabindex", "-1");
    await expect(trap).toHaveAttribute("autocomplete", "off");
    await expect(page.locator("div[aria-hidden]").filter({ has: trap })).toHaveCount(1);
    const box = await trap.boundingBox(); // Playwright counts off-screen boxes as "visible"
    expect(box === null || box.x < -1000).toBe(true);
    for (const autofillBait of ["website", "url", "homepage", "phone", "address"]) {
      await expect(page.locator(`input[name=${autofillBait}]`)).toHaveCount(0);
    }
  });
});

test.describe("lead API", () => {
  const post = (request: APIRequestContext, data: unknown, ip = uniqueIp()) =>
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

  test("rejects an oversized body with 413", async ({ request }) => {
    const res = await post(request, { ...validLead, message: "x".repeat(50_000) });
    expect(res.status()).toBe(413);
  });

  test("honeypot fill looks like success to a bot, even with otherwise invalid data", async ({ request }) => {
    const filled = await post(request, { ...validLead, [HONEYPOT]: "http://spam.example" });
    expect(filled.status()).toBe(200);
    expect(await filled.json()).toEqual({ ok: true });
    const invalidToo = await post(request, { name: "", [HONEYPOT]: "x" });
    expect(invalidToo.status()).toBe(200);
  });

  test("rate limits the 6th request from one IP", async ({ request }) => {
    const ip = uniqueIp();
    const statuses: number[] = [];
    for (let i = 0; i < 6; i++) statuses.push((await post(request, validLead, ip)).status());
    expect(statuses.slice(0, 5)).toEqual([200, 200, 200, 200, 200]);
    expect(statuses[5]).toBe(429);
  });
});

test.describe("content integrity", () => {
  test("honeypot name in the test matches the app constant", () => {
    const src = readFileSync("lib/schema.ts", "utf8");
    expect(src).toContain(`HONEYPOT_FIELD = "${HONEYPOT}"`);
  });

  test("workspace/03-copy.md contains every string in copy.json (run `npm run sync:copy` if this fails)", () => {
    const md = readFileSync("../workspace/03-copy.md", "utf8");
    const missing = strings(copy).filter((s) => s.length > 0 && !md.includes(JSON.stringify(s).slice(1, -1)));
    expect(missing).toEqual([]);
  });

  test("components contain no hard-coded sentences (copy lives in copy.json)", () => {
    let files = "";
    try {
      files = execFileSync("grep", ["-rlE", "--include=*.tsx", "-e", ">[A-Z][a-z]+ [a-z]+ [a-z]+[^<{]{12,}<", "components", "app"], {
        encoding: "utf8",
      }).trim();
    } catch {
      /* grep exits 1 when nothing matches, which is the pass case */
    }
    expect(files).toBe("");
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
