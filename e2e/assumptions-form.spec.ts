import { expect, test, type Page } from "@playwright/test";

// Expected totals come from issue #8 (taken from the spreadsheet). Cost per
// child is shown in whole dollars, like every other amount in the app.

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

// The scenario table also has a "Total cost" row, so look only in the summary.
const summary = (page: Page) =>
  page.getByRole("region", { name: "Cost summary" });

const field = (page: Page, label: string) =>
  page.getByLabel(label, { exact: true });

async function expectSummary(
  page: Page,
  total: string,
  perChild: string,
  gap: string,
) {
  const row = (name: string) => summary(page).getByRole("row", { name });
  await expect(row("Total cost")).toContainText(total);
  await expect(row("Cost per child")).toContainText(perChild);
  await expect(row("Funding gap")).toContainText(gap);
}

test("form is pre-filled with defaults and shows the default summary", async ({
  page,
}) => {
  await expect(field(page, "Number of kids")).toHaveValue("20");
  await expect(field(page, "Contingency (%)")).toHaveValue("10");
  await expect(field(page, "Resort lift-ticket discount (%)")).toHaveValue(
    "25",
  );
  await expectSummary(page, "$27,258", "$1,363", "$16,058");
});

test("kids 20 → 21 crosses the instructor step", async ({ page }) => {
  await field(page, "Number of kids").fill("21");
  await expectSummary(page, "$28,842", "$1,373", "$17,582");
});

test("kids 30", async ({ page }) => {
  await field(page, "Number of kids").fill("30");
  await expectSummary(page, "$34,298", "$1,143", "$22,498");
});

test("kids 0 does not crash and shows $0 per child", async ({ page }) => {
  await field(page, "Number of kids").fill("0");
  // The bus is still booked for volunteers (spreadsheet quirk).
  await expect(
    summary(page).getByRole("row", { name: "Total cost" }),
  ).toContainText("$13,178");
  await expect(
    summary(page).getByRole("row", { name: "Cost per child" }),
  ).toContainText("$0");
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("contingency is entered as a percentage", async ({ page }) => {
  await field(page, "Contingency (%)").fill("20");
  await expect(
    summary(page).getByRole("row", { name: "Total cost" }),
  ).toContainText("$29,736");
});

test("values survive a page reload", async ({ page }) => {
  await field(page, "Number of kids").fill("30");
  await expectSummary(page, "$34,298", "$1,143", "$22,498");
  await page.reload();
  await expect(field(page, "Number of kids")).toHaveValue("30");
  await expectSummary(page, "$34,298", "$1,143", "$22,498");
});

test("Reset to defaults restores defaults, also after reload", async ({
  page,
}) => {
  await field(page, "Number of kids").fill("30");
  await field(page, "Contingency (%)").fill("20");
  await field(page, "Volunteers").fill("-1"); // leave an error showing too

  await page.getByRole("button", { name: "Reset to defaults" }).click();

  await expect(field(page, "Number of kids")).toHaveValue("20");
  await expect(field(page, "Contingency (%)")).toHaveValue("10");
  await expect(field(page, "Volunteers")).toHaveValue("6");
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expectSummary(page, "$27,258", "$1,363", "$16,058");

  await page.reload();
  await expect(field(page, "Number of kids")).toHaveValue("20");
  await expectSummary(page, "$27,258", "$1,363", "$16,058");
});

test("invalid input shows a message and keeps the last valid value", async ({
  page,
}) => {
  const kids = field(page, "Number of kids");

  await kids.fill("-3");
  await expect(page.getByRole("alert")).toHaveText("Can't be negative");
  await expect(kids).toHaveAttribute("aria-invalid", "true");
  await expectSummary(page, "$27,258", "$1,363", "$16,058");

  await kids.fill("2.5");
  await expect(page.getByRole("alert")).toHaveText("Must be a whole number");
  await expectSummary(page, "$27,258", "$1,363", "$16,058");

  // Fixing the value clears the message and updates the summary.
  await kids.fill("21");
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expectSummary(page, "$28,842", "$1,373", "$17,582");
});
