import { test, expect, type Page } from "@playwright/test";

function trackConsoleErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  return errors;
}

test.describe("Destination selector — mobile", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("selecting a country from the chip rail opens the bottom sheet", async ({ page }) => {
    const errors = trackConsoleErrors(page);

    await page.goto("/destinations");
    await page.getByRole("group", { name: "Study destinations" }).getByRole("button", { name: "United States" }).click();

    const sheet = page.getByRole("dialog");
    await expect(sheet).toBeVisible();
    const exploreLink = sheet.getByRole("link", { name: /Explore United States/ });
    await expect(exploreLink).toHaveAttribute("href", "/destinations/usa");

    expect(errors).toEqual([]);
  });

  test("tapping the country on the map opens the bottom sheet too", async ({ page }) => {
    // Germany, not USA: USA's path bounding box spans mainland + Alaska +
    // Hawaii, so its geometric center (what Playwright's default click
    // targets) can land outside the visible landmass. Real pointer
    // hit-testing on the rendered path is unaffected — this is a
    // test-targeting quirk for exclave-having countries, not a product bug.
    await page.goto("/destinations");
    await page.locator('[data-country="germany"]').click();

    const sheet = page.getByRole("dialog");
    await expect(sheet).toBeVisible();
    await expect(sheet.getByRole("link", { name: /Explore Germany/ })).toHaveAttribute(
      "href",
      "/destinations/germany"
    );
  });
});

test.describe("Destination selector — desktop", () => {
  test("hover previews, click persists, and leaving restores the persisted selection", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "Hover semantics only apply to pointer:fine desktop input");

    await page.goto("/destinations");

    const panel = page.getByTestId("destination-preview-panel");
    await expect(panel).toContainText("Hover or select a country");

    // Hover Germany: temporary preview.
    await page.locator('[data-country="germany"]').hover();
    await expect(panel).toContainText("Explore Germany");

    // Click persists the selection.
    await page.locator('[data-country="germany"]').click();
    await expect(panel).toContainText("Explore Germany");

    // Hovering Ireland shows a temporary preview over the persisted one.
    await page.locator('[data-country="ireland"]').hover();
    await expect(panel).toContainText("Explore Ireland");

    // Leaving the map restores the persisted Germany selection.
    await page.mouse.move(0, 0);
    await expect(panel).toContainText("Explore Germany");
  });
});
