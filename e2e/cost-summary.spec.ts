import { expect, test } from "@playwright/test";

// Expected values are the spreadsheet's Summary tab with default assumptions
// (same as src/calc/costs.test.ts), rounded to whole dollars for display.
test("shows the default cost summary", async ({ page }) => {
  await page.goto("/");
  // Scope to the summary: the scenario table has rows with the same names.
  const summary = page.getByRole("region", { name: "Cost summary" });
  const row = (name: string) => summary.getByRole("row", { name });

  await expect(row("Total cost")).toContainText("$27,258");
  await expect(row("Cost per child")).toContainText("$1,363");
  await expect(row("Funding gap")).toContainText("$16,058");
});
