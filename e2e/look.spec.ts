import { expect, test, type Page } from "@playwright/test";

// Issue #12: the restyle. These check the parts of the new look that carry
// meaning (dark theme, gap vs surplus, edited state, focus, no sideways
// scroll), not pixel details. Those are reviewed with screenshots in the PR.

const BG = "rgb(7, 5, 31)"; // --bg  #07051f
const FOCUS = "rgb(201, 168, 255)"; // --accent-strong  #c9a8ff

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

const field = (page: Page, label: string) =>
  page.getByLabel(label, { exact: true });
const gapCell = (page: Page) =>
  page
    .getByRole("region", { name: "Cost summary" })
    .getByRole("row", { name: "Funding gap" })
    .getByRole("cell");

test("uses the dark theme", async ({ page }) => {
  const style = await page.evaluate(() => ({
    scheme: getComputedStyle(document.documentElement).colorScheme,
    bg: getComputedStyle(document.body).backgroundColor,
  }));
  expect(style.scheme).toBe("dark");
  expect(style.bg).toBe(BG);
});

test("funding gap says whether it's a gap or a surplus", async ({ page }) => {
  await expect(gapCell(page)).toHaveAttribute("data-tone", "gap");
  await expect(gapCell(page)).toContainText("to raise");

  await field(page, "Grants ($)").fill("50000");
  await expect(gapCell(page)).toHaveAttribute("data-tone", "surplus");
  await expect(gapCell(page)).toContainText("surplus");
});

test("scenario status exposes its state for styling", async ({ page }) => {
  const status = page.getByRole("status");
  await expect(status).toHaveAttribute("data-state", "none");
  await page.getByRole("button", { name: "Load Mid" }).click();
  await expect(status).toHaveAttribute("data-state", "loaded");
  await field(page, "Number of kids").fill("41");
  await expect(status).toHaveAttribute("data-state", "edited");
});

test("keyboard focus shows the accent outline", async ({ page }) => {
  const outlineOfFocused = () =>
    page.evaluate(() => {
      const s = getComputedStyle(document.activeElement!);
      return { style: s.outlineStyle, color: s.outlineColor };
    });

  await field(page, "Number of kids").focus();
  expect(await outlineOfFocused()).toEqual({ style: "solid", color: FOCUS });

  // Tab from the last field to the Reset button (keyboard → :focus-visible).
  await field(page, "Individual donations ($)").focus();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Reset to defaults" }),
  ).toBeFocused();
  expect(await outlineOfFocused()).toEqual({ style: "solid", color: FOCUS });
});

test.describe("on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  const scrollsSideways = (page: Page) =>
    page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );

  // Passes before the restyle too: it guards against the new styles
  // introducing horizontal scroll.
  test("the page never scrolls sideways", async ({ page }) => {
    expect(await scrollsSideways(page)).toBe(false);

    await field(page, "Scenario name").fill("A much longer scenario name");
    await page.getByRole("button", { name: "Save as", exact: true }).click();
    await expect(page.getByRole("status")).toContainText("A much longer");
    expect(await scrollsSideways(page)).toBe(false);
  });
});
