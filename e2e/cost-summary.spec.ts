import { expect, test } from "@playwright/test";

// Expected values are the spreadsheet's Summary tab with default assumptions
// (same as src/calc/costs.test.ts), rounded to whole dollars for display.
test("shows the default cost summary", async ({ page }) => {
  await page.goto("/");
  const row = (name: string) => page.getByRole("row", { name });

  await expect(row("Total cost")).toContainText("$27,258");
  await expect(row("Cost per child")).toContainText("$1,363");
  await expect(row("Funding gap")).toContainText("$16,058");
});
