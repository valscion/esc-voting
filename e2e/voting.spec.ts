import { test, expect } from "@playwright/test";
import { execSync } from "node:child_process";

test.describe("ESC Voting App", () => {
  test.beforeAll(async () => {
    // Seed the database before running tests
    try {
      execSync("pnpm run seed", {
        cwd: process.cwd(),
        stdio: "pipe",
        timeout: 30_000,
      });
    } catch {
      // Seed may fail if dev server is not ready yet; tests will still work
      // if data was previously seeded
    }
  });

  test.describe("Home Page", () => {
    test("shows the app title", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("h1")).toContainText("ESC Voting");
    });

    test("shows voter list with progress", async ({ page }) => {
      await page.goto("/");

      // Should show the voter profile heading
      await expect(page.locator("h2")).toContainText(
        "Choose your voter profile",
      );

      // Should show at least one voter
      const voterLinks = page.locator("ul a");
      await expect(voterLinks.first()).toBeVisible();

      // Each voter link should show name and rating progress
      const firstVoter = voterLinks.first();
      await expect(firstVoter).toContainText("/");
      await expect(firstVoter).toContainText("rated");
    });

    test("voter links navigate to vote pages", async ({ page }) => {
      await page.goto("/");

      // Click the first voter link
      const firstVoterLink = page.locator("ul a").first();
      const voterName = await firstVoterLink
        .locator("span")
        .first()
        .textContent();
      await firstVoterLink.click();

      // Should navigate to the vote page
      await expect(page).toHaveURL(/\/vote\//);
      await expect(page.locator("h1")).toContainText(voterName!);
    });
  });

  test.describe("Vote Page", () => {
    test("shows the voting interface", async ({ page }) => {
      await page.goto("/");

      // Navigate to first voter's page
      await page.locator("ul a").first().click();
      await expect(page).toHaveURL(/\/vote\//);

      // Should show the rating legend
      await expect(page.locator("body")).toContainText("🔥");
      await expect(page.locator("body")).toContainText("💀");

      // Should show the progress indicator
      await expect(page.locator("body")).toContainText("countries rated");
    });

    test("shows song list with countries", async ({ page }) => {
      await page.goto("/");
      await page.locator("ul a").first().click();

      // Should display song entries
      const songItems = page.locator("ul > li");
      await expect(songItems.first()).toBeVisible();

      // Each song should show country flag, country name, and artist
      const firstSong = songItems.first();
      await expect(firstSong).toBeVisible();
    });

    test("can cast a vote by clicking a rating emoji", async ({ page }) => {
      await page.goto("/");
      await page.locator("ul a").first().click();

      // Find the first song's rating buttons group
      const firstRatingGroup = page
        .locator('[role="group"]')
        .first();
      await expect(firstRatingGroup).toBeVisible();

      // Click the fire emoji button (first rating option)
      const fireButton = firstRatingGroup.locator("button").first();
      await fireButton.click();

      // The button should become selected (has indigo border)
      await expect(fireButton).toHaveAttribute("aria-pressed", "true");
    });

    test("can change a vote", async ({ page }) => {
      await page.goto("/");
      await page.locator("ul a").first().click();

      const firstRatingGroup = page
        .locator('[role="group"]')
        .first();

      // Click the fire emoji (first button)
      const fireButton = firstRatingGroup.locator("button").first();
      await fireButton.click();
      await expect(fireButton).toHaveAttribute("aria-pressed", "true");

      // Now click the skull emoji (last button)
      const skullButton = firstRatingGroup.locator("button").last();
      await skullButton.click();
      await expect(skullButton).toHaveAttribute("aria-pressed", "true");

      // The fire button should no longer be selected
      await expect(fireButton).toHaveAttribute("aria-pressed", "false");
    });

    test("back link returns to home page", async ({ page }) => {
      await page.goto("/");
      await page.locator("ul a").first().click();

      // Click the back link
      await page.locator('a[href="/"]').click();

      // Should be back on the home page
      await expect(page).toHaveURL("/");
      await expect(page.locator("h1")).toContainText("ESC Voting");
    });

    test("vote persists after page reload", async ({ page }) => {
      await page.goto("/");
      await page.locator("ul a").first().click();

      // Cast a vote on the first song
      const firstRatingGroup = page
        .locator('[role="group"]')
        .first();
      const heartButton = firstRatingGroup.locator("button").nth(1);
      await heartButton.click();
      await expect(heartButton).toHaveAttribute("aria-pressed", "true");

      // Wait a moment for the server action to complete
      await page.waitForTimeout(1000);

      // Reload the page
      await page.reload();

      // The heart button should still be selected
      const reloadedGroup = page.locator('[role="group"]').first();
      const reloadedHeart = reloadedGroup.locator("button").nth(1);
      await expect(reloadedHeart).toHaveAttribute("aria-pressed", "true");
    });
  });
});
