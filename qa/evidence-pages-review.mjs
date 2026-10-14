import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { navigate } from "./browser-checks.mjs";
import { selectValue } from "./catalogue-review.mjs";
export async function reviewEvidencePages(tab, viewport, directory, width) {
  const checks = [],
    audits = [];
  const capture = async (name) =>
    writeFile(
      `${directory}/${name}-${width}.png`,
      await tab.screenshot({ fullPage: false }),
    );
  const audit = async (name) => {
    await tab.playwright
      .locator(".app")
      .getByRole("button", { name: "Run accessibility check", exact: true })
      .press("Enter");
    await tab.playwright.domSnapshot();
    await tab.playwright.locator('.app [data-audit-result]').filter({hasText:'violations'}).waitFor({state:'visible',timeoutMs:20000});
    const result = JSON.parse(
      await tab.playwright.locator(".app [data-audit-result]").textContent(),
    );
    assert.equal(
      result.violations.length,
      0,
      JSON.stringify(result.violations),
    );
    audits.push({ name, ...result });
  };
  await viewport.set({ width, height: 900 });
  await tab.playwright.domSnapshot();
  await navigate(tab, "Data quality");
  await navigate(tab, "Sources");
  await tab.playwright
    .locator(".source-snapshot")
    .waitFor({ state: "visible" });
  assert.equal(
    await tab.playwright.evaluate(() => document.documentElement.scrollWidth),
    width,
  );
  await capture("sources-hero");
  const list = tab.playwright.getByRole("list", {
      name: "Pharmacy sources",
      exact: true,
    }),
    group = tab.playwright.getByRole("group", {
      name: "Source reporting filter",
    });
  assert.equal(await list.getByRole("listitem").count(), 15);
  await group
    .getByRole("button", { name: "Reporting stock 8", exact: true })
    .click();
  assert.equal(await list.getByRole("listitem").count(), 8);
  await group
    .getByRole("button", { name: "Listings only 7", exact: true })
    .click();
  assert.equal(await list.getByRole("listitem").count(), 7);
  assert.equal(
    await list.getByText("No rate available", { exact: true }).count(),
    7,
  );
  checks.push("15/8/7 source partitions and unknown rates");
  const search = tab.playwright.getByRole("textbox", {
    name: "Find a pharmacy source",
  });
  await search.fill("no-such-source-xyz");
  await tab.playwright
    .getByRole("button", { name: "Reset source filters" })
    .click();
  assert.equal(await list.getByRole("listitem").count(), 15);
  await selectValue(tab, "Order pharmacy sources", "name");
  assert.equal(
    await list
      .getByRole("listitem")
      .first()
      .getByRole("button", { name: "Garnet Pharmacy", exact: true })
      .count(),
    1,
  );
  await search.fill("Garnet");
  await list
    .getByRole("button", { name: "Garnet Pharmacy", exact: true })
    .click();
  await tab.playwright.domSnapshot();
  assert.ok(
    await list.getByText("Collection & evidence", { exact: true }).isVisible(),
  );
  assert.ok((await list.textContent()).includes("25.1%"));
  await list.locator("summary").click();
  await tab.playwright.domSnapshot();
  assert.ok((await list.textContent()).includes("WooCommerce"));
  await capture("sources-record");
  await audit("source record");
  checks.push(
    "source sorting, search, empty recovery and collection disclosure",
  );
  await list
    .getByRole("button", { name: "Browse Garnet Pharmacy listings" })
    .click();
  await tab.playwright.domSnapshot();
  assert.ok((await tab.url()).includes("sa=0"));
  checks.push("source catalogue drill-down");
  await navigate(tab, "Sources");
  await tab.playwright
    .locator(".source-snapshot")
    .waitFor({ state: "visible" });
  await tab.playwright.locator(".source-balance-panel summary").click();
  await tab.playwright.domSnapshot();
  assert.equal(
    await tab.playwright.locator(".source-balance-panel tbody tr").count(),
    15,
  );
  assert.ok(
    (
      await tab.playwright.locator(".source-balance-panel").textContent()
    ).includes("Counts may overlap"),
  );
  await capture("sources-product-evidence");
  checks.push("product-grain table, overlap caveat and all sources");
  assert.equal(
    await tab.playwright.locator(".source-gap-ledger article").count(),
    3,
  );
  await tab.playwright.locator(".source-gap-ledger summary").first().click();
  await tab.playwright.domSnapshot();
  await audit("source evidence and missing capture");
  await navigate(tab, "Data quality");
  await tab.playwright
    .locator(".quality-summary")
    .waitFor({ state: "visible" });
  assert.equal(
    await tab.playwright.evaluate(() => document.documentElement.scrollWidth),
    width,
  );
  await capture("quality-hero");
  const fields = tab.playwright.locator(".quality-field-grid");
  assert.equal(await fields.getByRole("meter").count(), 6);
  assert.ok((await fields.textContent()).includes("1,484"));
  assert.ok((await fields.textContent()).includes("11,363"));
  checks.push("six coverage denominators and exact missing counts");
  await tab.playwright
    .getByRole("textbox", { name: "Find a therapeutic class" })
    .fill("no-class-xyz");
  await tab.playwright
    .getByRole("button", { name: "Clear search", exact: true })
    .click();
  await tab.playwright
    .getByRole("button", { name: "Show all 19 classes", exact: true })
    .click();
  assert.equal(
    await tab.playwright.locator(".quality-class-explorer > button").count(),
    19,
  );
  await capture("quality-classes");
  checks.push("therapeutic class search, recovery and complete expansion");
  const queue = tab.playwright.getByRole("group", {
    name: "Evidence review queue",
  });
  await queue.getByRole("button", { name: "Reference gaps 9,041" }).click();
  await tab.playwright
    .getByRole("button", { name: "Show 12 examples" })
    .click();
  assert.equal(
    await tab.playwright
      .getByRole("list", { name: "Reference gap sample" })
      .getByRole("listitem")
      .count(),
    12,
  );
  await capture("quality-review");
  checks.push("switchable review queue and 12-product expansion");
  await tab.playwright
    .locator(".quality-excluded-ledger summary")
    .first()
    .click();
  await tab.playwright
    .locator(".quality-stock-boundary > aside summary")
    .click();
  await tab.playwright.locator(".quality-reading-guide > summary").click();
  await tab.playwright.domSnapshot();
  assert.ok(
    (
      await tab.playwright.locator(".quality-stock-boundary").textContent()
    ).includes("68.9%"),
  );
  assert.equal(
    await tab.playwright.locator(".quality-excluded-ledger details").count(),
    7,
  );
  await capture("quality-stock-boundary");
  await audit("quality expanded evidence");
  checks.push(
    "unknown-stock calculation sensitivity and seven source diagnostics",
  );
  await tab.playwright
    .getByRole("button", { name: "Review product matches", exact: true })
    .click();
  await tab.playwright.domSnapshot();
  assert.ok((await tab.url()).includes("rv=needs_review"));
  checks.push("review queue filter contract");
  await navigate(tab, "Data quality");
  await tab.playwright
    .getByRole("button", { name: "Explore reference gaps", exact: true })
    .click();
  await tab.playwright.domSnapshot();
  assert.ok((await tab.url()).includes("g="));
  checks.push("reference gap filter contract");
  await navigate(tab, "Data quality");
  await tab.playwright.getByRole("button", { name: /^Low confidence/ }).click();
  await tab.playwright.domSnapshot();
  assert.ok((await tab.url()).includes("mb="));
  await tab.playwright
    .locator(".catalogue-result-count")
    .waitFor({ state: "visible" });
  assert.ok(
    (
      await tab.playwright.locator(".catalogue-result-count").textContent()
    ).includes("172"),
  );
  checks.push("match-band drill-down returns exact products");
  const result = { width, checks, audits };
  await writeFile(
    `${directory}/review-${width}.json`,
    JSON.stringify(result, null, 2),
  );
  return result;
}
