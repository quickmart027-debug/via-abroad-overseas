import { test, expect } from "@playwright/test";

test.describe("Contact form", () => {
  test("submitting without consent explains why instead of a silent disabled button", async ({ page }) => {
    await page.goto("/contact");
    const submit = page.getByRole("button", { name: "Submit Enquiry" });
    await expect(submit).toBeEnabled();

    await submit.click();
    await expect(page.getByText("Please enter your full name.")).toBeVisible();
    await expect(
      page.getByText("Please confirm you agree to be contacted before submitting.")
    ).toBeVisible();
  });

  test("rejects a submission with an invalid email once fields are filled", async ({ page }) => {
    await page.goto("/contact");
    await page.getByLabel("Full Name").fill("Test User");
    await page.getByLabel("Phone Number").fill("9876543210");
    await page.getByLabel("Email").fill("not-an-email");
    await page.getByLabel("Interested Country").selectOption("United States");
    await page.getByLabel("Service Required").selectOption("Study Abroad Counselling");
    await page.getByLabel(/I agree that VIA ABROAD OVERSEAS/).check();
    await page.getByRole("button", { name: "Submit Enquiry" }).click();

    await expect(page.getByText("Please enter a valid email address.")).toBeVisible();
  });
});

test.describe("Enquiry API routes", () => {
  test("rejects an invalid payload with a 400 and no stack trace leak", async ({ request }) => {
    const response = await request.post("/api/enquiries/contact", {
      data: { fullName: "A" },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeTruthy();
    expect(JSON.stringify(body)).not.toMatch(/at\s+\S+\s+\(.*:\d+:\d+\)/);
  });

  test("rejects an oversized payload with 413", async ({ request }) => {
    const response = await request.post("/api/enquiries/contact", {
      data: { message: "a".repeat(25_000) },
    });
    expect(response.status()).toBe(413);
  });
});
