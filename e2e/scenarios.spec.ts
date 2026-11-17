import { expect, test, type Page } from "@playwright/test";

// Expected values for Pilot / Mid / Full come from issue #10: worked out with
// calculateCosts and checked by hand (not taken from the spreadsheet).

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

const field = (page: Page, label: string) =>
  page.getByLabel(label, { exact: true });
const button = (page: Page, name: string) =>
  page.getByRole("button", { name, exact: true });
const status = (page: Page) => page.getByRole("status");
const compareTable = (page: Page) =>
  page.getByRole("table", { name: "Scenario comparison" });
const headers = (page: Page) =>
  compareTable(page).getByRole("row").first().getByRole("columnheader");

/** Check one row of the compare table in the column headed `column`. */
async function expectCell(
  page: Page,
  column: string,
  row: string,
  value: string,
) {
  await expect(headers(page).filter({ hasText: column })).toHaveCount(1);
  const names = await headers(page).allInnerTexts();
  const index = names.findIndex((n) => n.trim() === column);
  expect(index, `column "${column}" in ${names.join(", ")}`).toBeGreaterThan(
    -1,
  );
  await expect(
    compareTable(page)
      .getByRole("row")
      // Exact header match: "Cost per child" must not also match
      // "Cost per child-day".
      .filter({ has: page.getByRole("rowheader", { name: row, exact: true }) })
      .getByRole("cell")
      .nth(index),
  ).toHaveText(value);
}

const expectTotal = (page: Page, column: string, value: string) =>
  expectCell(page, column, "Total cost", value);

const summaryTotal = (page: Page) =>
  page
    .getByRole("region", { name: "Cost summary" })
    .getByRole("row", { name: "Total cost" });

async function loadMid(page: Page) {
  await button(page, "Load Mid").click();
  await expect(field(page, "Number of kids")).toHaveValue("40");
}

test("first visit shows Current, Pilot, Mid and Full", async ({ page }) => {
  await expect(headers(page)).toHaveText(["Current", "Pilot", "Mid", "Full"]);
  await expect(status(page)).toHaveText("Scenario: none");

  const expected = {
    Pilot: ["$27,258", "$1,363", "$341", "$16,058"],
    Mid: ["$46,816", "$1,170", "$293", "$34,416"],
    Full: ["$94,930", "$949", "$237", "$78,930"],
  };
  const rows = [
    "Total cost",
    "Cost per child",
    "Cost per child-day",
    "Funding gap",
  ];
  for (const [column, values] of Object.entries(expected)) {
    for (const [i, row] of rows.entries()) {
      await expectCell(page, column, row, values[i]);
    }
  }
});

test("Current column updates live; saved scenarios don't", async ({ page }) => {
  await expectTotal(page, "Current", "$27,258");
  await field(page, "Number of kids").fill("21");
  await expectTotal(page, "Current", "$28,842");
  await expect(summaryTotal(page)).toContainText("$28,842");
  await expectTotal(page, "Pilot", "$27,258");
});

test("Load copies a scenario into the form and survives a reload", async ({
  page,
}) => {
  await loadMid(page);
  await expect(field(page, "Volunteers")).toHaveValue("12");
  await expect(summaryTotal(page)).toContainText("$46,816");
  await expect(status(page)).toHaveText("Scenario: Mid");
  await expect(button(page, "Save")).toBeDisabled();

  await page.reload();
  await expect(field(page, "Number of kids")).toHaveValue("40");
  await expect(status(page)).toHaveText("Scenario: Mid");
});

test("editing after Load marks it edited but leaves the scenario alone", async ({
  page,
}) => {
  await loadMid(page);
  await field(page, "Number of kids").fill("41");
  await expect(status(page)).toHaveText("Scenario: Mid (edited)");
  await expect(button(page, "Save")).toBeEnabled();
  await expectTotal(page, "Current", "$48,400");
  await expectTotal(page, "Mid", "$46,816");

  await field(page, "Number of kids").fill("40");
  await expect(status(page)).toHaveText("Scenario: Mid");
});

test("Save overwrites the loaded scenario", async ({ page }) => {
  await loadMid(page);
  await field(page, "Number of kids").fill("41");
  await button(page, "Save").click();

  await expectTotal(page, "Mid", "$48,400");
  await expect(status(page)).toHaveText("Scenario: Mid");
  await expect(button(page, "Save")).toBeDisabled();

  await page.reload();
  await expectTotal(page, "Mid", "$48,400");
});

test("Save As adds a scenario and makes it the loaded one", async ({
  page,
}) => {
  await field(page, "Number of kids").fill("30");
  await field(page, "Scenario name").fill("Big year");
  await button(page, "Save as").click();

  await expect(headers(page)).toHaveText([
    "Current",
    "Pilot",
    "Mid",
    "Full",
    "Big year",
  ]);
  await expectTotal(page, "Big year", "$34,298");
  await expect(status(page)).toHaveText("Scenario: Big year");
  await expect(field(page, "Scenario name")).toHaveValue("");

  await page.reload();
  await expectTotal(page, "Big year", "$34,298");
  await expect(status(page)).toHaveText("Scenario: Big year");
});

test("Save As enforces the name rules", async ({ page }) => {
  const name = field(page, "Scenario name");
  const cases: [string, string][] = [
    ["", "Enter a name"],
    ["mid", 'A scenario called "Mid" already exists'],
    ["Current", '"Current" is reserved for the live inputs'],
  ];
  for (const [text, message] of cases) {
    await name.fill(text);
    await button(page, "Save as").click();
    await expect(page.getByRole("alert")).toHaveText(message);
  }
  await expect(headers(page)).toHaveCount(4);
});

test("Rename changes the name everywhere and enforces the rules", async ({
  page,
}) => {
  await loadMid(page);
  await button(page, "Rename Mid").click();
  const input = field(page, "New name for Mid");

  await input.fill("Pilot");
  await button(page, "Save name").click();
  await expect(page.getByRole("alert")).toHaveText(
    'A scenario called "Pilot" already exists',
  );
  await input.fill("  ");
  await button(page, "Save name").click();
  await expect(page.getByRole("alert")).toHaveText("Enter a name");

  await input.fill("Medium");
  await button(page, "Save name").click();
  await expect(headers(page)).toHaveText([
    "Current",
    "Pilot",
    "Medium",
    "Full",
  ]);
  await expect(status(page)).toHaveText("Scenario: Medium");

  await page.reload();
  await expect(headers(page)).toHaveText([
    "Current",
    "Pilot",
    "Medium",
    "Full",
  ]);
  await expect(status(page)).toHaveText("Scenario: Medium");
});

test("Rename can be cancelled", async ({ page }) => {
  await button(page, "Rename Mid").click();
  await field(page, "New name for Mid").fill("Medium");
  await button(page, "Cancel").click();
  await expect(headers(page)).toHaveText(["Current", "Pilot", "Mid", "Full"]);
});

test("Delete asks first, and stays deleted after a reload", async ({
  page,
}) => {
  page.once("dialog", (d) => d.dismiss());
  await button(page, "Delete Full").click();
  await expect(headers(page)).toHaveText(["Current", "Pilot", "Mid", "Full"]);

  page.once("dialog", (d) => d.accept());
  await button(page, "Delete Full").click();
  await expect(headers(page)).toHaveText(["Current", "Pilot", "Mid"]);

  await page.reload();
  await expect(headers(page)).toHaveText(["Current", "Pilot", "Mid"]);
});

test("deleting the loaded scenario sets the status to none", async ({
  page,
}) => {
  await loadMid(page);
  page.once("dialog", (d) => d.accept());
  await button(page, "Delete Mid").click();
  await expect(status(page)).toHaveText("Scenario: none");
});

test("Reset to defaults clears the loaded scenario", async ({ page }) => {
  await loadMid(page);
  await button(page, "Reset to defaults").click();
  await expect(field(page, "Number of kids")).toHaveValue("20");
  await expect(status(page)).toHaveText("Scenario: none");
});
