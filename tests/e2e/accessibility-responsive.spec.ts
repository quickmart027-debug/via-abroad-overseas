import { expect, test } from "@playwright/test";

function luminance(color: string) {
  const [red, green, blue] = color.match(/\d+/g)!.slice(0, 3).map(Number).map((value) => {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(foreground: string, background: string) {
  const foregroundLuminance = luminance(foreground);
  const backgroundLuminance = luminance(background);
  return (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
    (Math.min(foregroundLuminance, backgroundLuminance) + 0.05);
}

function cssColorToRgb(color: string) {
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    const expanded = hex.length === 3
      ? hex.split("").map((channel) => channel + channel).join("")
      : hex;
    return `rgb(${Number.parseInt(expanded.slice(0, 2), 16)}, ${Number.parseInt(expanded.slice(2, 4), 16)}, ${Number.parseInt(expanded.slice(4, 6), 16)})`;
  }
  return color;
}

test.describe("accessibility and responsive behavior", () => {
  test("the 320px header and enquiry layouts stay inside the viewport", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 844 });

    for (const route of ["/", "/contact", "/book-consultation"]) {
      await page.goto(route);
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
      const menuBounds = await page.getByRole("button", { name: "Open menu" }).boundingBox();
      expect(menuBounds).not.toBeNull();
      expect(menuBounds!.x + menuBounds!.width).toBeLessThanOrEqual(320);
    }
  });

  test("the compact (tablet) header uses the standard consultation CTA label", async ({ page }) => {
    // Phones get the bottom quick-contact bar instead of a header CTA, so the
    // compact header CTA first appears at the md breakpoint.
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");

    await expect(page.locator("header").getByRole("link", { name: "Book Free Consultation" })).toBeVisible();
  });

  test("phones reach the consultation CTA from the quick-contact bar, not the header", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");

    await expect(page.locator("header").getByRole("link", { name: "Book Free Consultation" })).toBeHidden();
    await expect(page.getByRole("navigation", { name: "Quick contact" }).getByRole("link", { name: /consult/i })).toBeVisible();
  });

  test("the skip link moves keyboard focus to the main content", async ({ page }) => {
    await page.goto("/about");
    const skipLink = page.getByRole("link", { name: "Skip to main content" });
    await page.keyboard.press("Tab");
    await expect(skipLink).toBeFocused();
    await page.keyboard.press("Enter");

    await expect(page.locator("main#main-content")).toBeFocused();
  });

  test("the mobile navigation closes with Escape and returns focus to its trigger", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Open menu" });
    await trigger.focus();
    await page.keyboard.press("Enter");

    const closeTrigger = page.getByRole("button", { name: "Close menu" });
    await expect(closeTrigger).toHaveAttribute("aria-expanded", "true");
    await page.getByRole("navigation", { name: "Mobile" }).getByRole("link", { name: "About Us" }).focus();
    await page.keyboard.press("Escape");

    await expect(page.getByRole("button", { name: "Open menu" })).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
  });

  test("admin login has a main landmark and required, labelled fields", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 844 });
    await page.goto("/admin/login");

    await expect(page.locator("main#main-content")).toHaveCount(1);
    await expect(page.getByLabel("Email")).toHaveAttribute("required", "");
    await expect(page.getByLabel("Password")).toHaveAttribute("required", "");
  });

  test("public enquiry fields expose required semantics to assistive technology", async ({ page }) => {
    await page.goto("/contact");

    await expect(page.getByLabel("Full Name")).toHaveAttribute("required", "");
    await expect(page.getByLabel("Phone Number")).toHaveAttribute("required", "");
    await expect(page.getByLabel("Email")).toHaveAttribute("required", "");
    await expect(page.getByLabel("I agree that VIA ABROAD OVERSEAS may contact me regarding my enquiry.")).toHaveAttribute("required", "");
  });

  test("contact validation links field errors and focuses the first invalid field", async ({ page }) => {
    await page.goto("/contact");
    await page.getByLabel("I agree that VIA ABROAD OVERSEAS may contact me regarding my enquiry.").check();
    await page.getByRole("button", { name: "Submit Enquiry" }).click();

    const name = page.getByLabel("Full Name");
    await expect(name).toBeFocused();
    await expect(name).toHaveAttribute("aria-invalid", "true");
    const describedBy = await name.getAttribute("aria-describedby");
    expect(describedBy).toBe("fullName-error");
    await expect(page.locator(`#${describedBy}`)).toHaveAttribute("role", "alert");
  });

  test("Find My Options works from the keyboard and names its radio group clearly", async ({ page }) => {
    await page.goto("/");
    const education = page.getByRole("radiogroup", { name: "Education level" });
    await expect(education).toHaveAttribute("aria-required", "true");
    const firstOption = page.getByLabel("B.Tech");
    await firstOption.focus();
    await page.keyboard.press("Space");
    await expect(firstOption).toBeChecked();
    await page.getByRole("button", { name: "Next", exact: true }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("radiogroup", { name: "Approximate budget" })).toBeVisible();
  });

  test("the FAQ accordion opens with keyboard activation and announces its state", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "How do I choose the right country?" });
    await trigger.focus();
    await page.keyboard.press("Space");

    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByText("The right country depends on your course", { exact: false })).toBeVisible();
  });

  test("form placeholder and focus colors meet contrast targets on light fields", async ({ page }) => {
    await page.goto("/book-consultation");
    const placeholder = page.locator('input[placeholder="e.g. MS Computer Science"]');
    await placeholder.focus();
    const colors = await placeholder.evaluate((input) => ({
      placeholder: getComputedStyle(input, "::placeholder").color,
      background: getComputedStyle(input).backgroundColor,
      focusRing: getComputedStyle(document.documentElement).getPropertyValue("--focus-ring").trim(),
    }));

    expect(contrastRatio(colors.placeholder, colors.background)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(cssColorToRgb(colors.focusRing), colors.background)).toBeGreaterThanOrEqual(3);
  });
});
