import { test, expect } from "@playwright/test";

test.describe("ESC Voting App", () => {
  /**
   * Navigate to a page and wait for client-side hydration to complete.
   * RSC apps need hydration before client components (forms, buttons) work.
   */
  async function gotoAndHydrate(
    page: import("@playwright/test").Page,
    url: string,
  ) {
    await page.goto(url);
    await page.waitForLoadState("networkidle");
  }

  /**
   * Helper: create a new game and return the game token.
   */
  async function createGame(
    page: import("@playwright/test").Page,
    names: string[] = ["Alice", "Bob"],
  ): Promise<string> {
    await gotoAndHydrate(page, "/");

    // Clear default fields and fill in names
    const inputs = page.locator('input[type="text"]');
    for (let i = 0; i < names.length; i++) {
      if (i >= 2) {
        // Click "Add another friend" to get more inputs
        await page.getByText("+ Add another friend").click();
        // Wait for the new input to appear
        await expect(inputs).toHaveCount(i + 1);
      }
      const input = inputs.nth(i);
      await input.fill(names[i]);
    }

    // Submit the form
    await page.getByText("Start voting!").click();

    // Wait for navigation to the game page
    await page.waitForURL(/\/[a-z]+-[a-z]+-\d+/, { timeout: 15000 });

    // Extract token from URL
    const url = new URL(page.url());
    return url.pathname.replace(/^\//, "").replace(/\/$/, "");
  }

  test.describe("Landing Page", () => {
    test("shows the app title", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("h1")).toContainText("ESC Voting");
    });

    test("shows the game creation form", async ({ page }) => {
      await page.goto("/");

      await expect(page.locator("h2")).toContainText("Start a new game");

      // Should show at least 2 name inputs
      const inputs = page.locator('input[type="text"]');
      await expect(inputs).toHaveCount(2);

      // Should show the submit button
      await expect(page.getByText("Start voting!")).toBeVisible();
    });

    test("can add and remove friend fields", async ({ page }) => {
      await gotoAndHydrate(page, "/");

      // Start with 2 inputs
      await expect(page.locator('input[type="text"]')).toHaveCount(2);

      // Add a third
      await page.getByText("+ Add another friend").click();
      await expect(page.locator('input[type="text"]')).toHaveCount(3);

      // Remove one (click the ✕ button)
      await page.locator('button[aria-label="Remove friend 3"]').click();
      await expect(page.locator('input[type="text"]')).toHaveCount(2);
    });

    test("creates a game and navigates to it", async ({ page }) => {
      const token = await createGame(page);

      // Should be on the game page
      expect(token).toMatch(/^[a-z]+-[a-z]+-\d+$/);
      await expect(page.locator("h1")).toContainText("ESC Voting");

      // Should show voter profiles
      await expect(page.locator("h2")).toContainText(
        "Choose your voter profile",
      );
      await expect(page.locator("ul a")).toHaveCount(2);
    });
  });

  test.describe("Game Page", () => {
    test("shows voter list with progress", async ({ page }) => {
      await createGame(page);

      // Should show voters with progress
      const voterLinks = page.locator("ul a");
      await expect(voterLinks.first()).toBeVisible();

      // Each voter link should show name and rating progress
      const firstVoter = voterLinks.first();
      await expect(firstVoter).toContainText("/");
      await expect(firstVoter).toContainText("rated");
    });

    test("shows game sharing info", async ({ page }) => {
      const token = await createGame(page);

      // Should show the share link
      await expect(page.locator("body")).toContainText(`/${token}`);
    });

    test("voter links navigate to vote pages", async ({ page }) => {
      const token = await createGame(page);

      // Click the first voter link
      const firstVoterLink = page.locator("ul a").first();
      const voterName = await firstVoterLink
        .locator("span")
        .first()
        .textContent();
      await firstVoterLink.click();

      // Should navigate to the vote page
      await expect(page).toHaveURL(new RegExp(`/${token}/votes/`));
      await expect(page.locator("h1")).toContainText(voterName!);
    });

    test("shows 404 for invalid token", async ({ page }) => {
      await page.goto("/nonexistent-game-99");
      await expect(page.locator("h1")).toContainText("Game not found");
    });
  });

  test.describe("Vote Page", () => {
    test("shows the voting interface", async ({ page }) => {
      const token = await createGame(page);

      // Navigate to first voter's page
      await page.locator("ul a").first().click();
      await expect(page).toHaveURL(new RegExp(`/${token}/votes/`));

      // Should show the rating legend
      await expect(page.locator("body")).toContainText("🤩");
      await expect(page.locator("body")).toContainText("🤮");

      // Should show the progress indicator
      await expect(page.locator("body")).toContainText("countries rated");
    });

    test("shows song list with countries", async ({ page }) => {
      await createGame(page);
      await page.locator("ul a").first().click();

      // Should display song entries
      const songItems = page.locator("ul > li");
      await expect(songItems.first()).toBeVisible();
    });

    test("can cast a vote by clicking a rating emoji", async ({ page }) => {
      await createGame(page);
      await page.locator("ul a").first().click();
      await page.waitForLoadState("networkidle");

      // Find the first song's rating buttons group
      const firstRatingGroup = page.locator('[role="group"]').first();
      await expect(firstRatingGroup).toBeVisible();

      // Click the fire emoji button (first rating option)
      const fireButton = firstRatingGroup.locator("button").first();
      await fireButton.click();

      // The button should become selected
      await expect(fireButton).toHaveAttribute("aria-pressed", "true");
    });

    test("can change a vote", async ({ page }) => {
      await createGame(page);
      await page.locator("ul a").first().click();
      await page.waitForLoadState("networkidle");

      const firstRatingGroup = page.locator('[role="group"]').first();

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

    test("back link returns to game page", async ({ page }) => {
      const token = await createGame(page);
      await page.locator("ul a").first().click();

      // Click the back link
      await page.locator(`a[href="/${token}"]`).click();

      // Should be back on the game page
      await expect(page).toHaveURL(`/${token}`);
      await expect(page.locator("h1")).toContainText("ESC Voting");
    });

    test("vote persists after page reload", async ({ page }) => {
      await createGame(page);
      await page.locator("ul a").first().click();
      await page.waitForLoadState("networkidle");

      // Cast a vote on the first song
      const firstRatingGroup = page.locator('[role="group"]').first();
      const heartButton = firstRatingGroup.locator("button").nth(1);
      await heartButton.click();
      await expect(heartButton).toHaveAttribute("aria-pressed", "true");

      // Wait for the server action to complete
      await expect(
        page.locator('[role="group"]').first(),
      ).not.toHaveCSS("opacity", "0.6");

      // Reload the page
      await page.reload();

      // The heart button should still be selected
      const reloadedGroup = page.locator('[role="group"]').first();
      const reloadedHeart = reloadedGroup.locator("button").nth(1);
      await expect(reloadedHeart).toHaveAttribute("aria-pressed", "true");
    });
  });

  test.describe("Game Controls", () => {
    test("can close a game to make votes read-only", async ({ page }) => {
      const token = await createGame(page);

      // Cast a vote first
      await page.locator("ul a").first().click();
      await page.waitForLoadState("networkidle");
      const firstRatingGroup = page.locator('[role="group"]').first();
      await firstRatingGroup.locator("button").first().click();
      await expect(
        firstRatingGroup.locator("button").first(),
      ).toHaveAttribute("aria-pressed", "true");

      // Go back to game page and wait for hydration
      await gotoAndHydrate(page, `/${token}`);

      // Close the game
      page.on("dialog", (dialog) => dialog.accept());
      await page.getByText("Stop voting now").click();

      // Should show closed message
      await expect(page.locator("body")).toContainText("Voting is closed");

      // Navigate to vote page - buttons should be disabled
      await page.locator("ul a").first().click();
      await expect(page.locator("body")).toContainText("read-only");

      const buttons = page.locator('[role="group"] button');
      await expect(buttons.first()).toBeDisabled();
    });

    test("can delete a game", async ({ page }) => {
      const token = await createGame(page);

      // Wait for game controls to be hydrated
      await page.waitForLoadState("networkidle");

      // Delete the game
      page.on("dialog", (dialog) => dialog.accept());
      await page.getByText("Delete game").click();

      // Should redirect to home
      await expect(page).toHaveURL("/");

      // The game should no longer exist
      await page.goto(`/${token}`);
      await expect(page.locator("h1")).toContainText("Game not found");
    });
  });

  test.describe("Dashboard", () => {
    test("shows the dashboard with song list", async ({ page }) => {
      const token = await createGame(page);

      await gotoAndHydrate(page, `/${token}/dashboard`);

      // Should show the dashboard heading
      await expect(page.locator("h1")).toContainText("Song Dashboard");

      // Should show song buttons
      const songButtons = page.locator("button[data-song-country]");
      await expect(songButtons.first()).toBeVisible();

      // Should have a back link
      await expect(page.locator(`a[href="/${token}"]`)).toBeVisible();
    });

    test("can select and deselect active song", async ({ page }) => {
      const token = await createGame(page);

      await gotoAndHydrate(page, `/${token}/dashboard`);

      // Initially should show "No song currently playing"
      await expect(page.locator("body")).toContainText(
        "No song currently playing",
      );

      // Click the first song to activate it
      const firstSong = page.locator("button[data-song-country]").first();
      await firstSong.click();

      // Should show as pressed
      await expect(firstSong).toHaveAttribute("aria-pressed", "true");

      // Should show the "Now playing" banner with song info
      await expect(page.locator("body")).toContainText("Now playing:");

      // Click again to deactivate
      await firstSong.click();

      // Should no longer be pressed
      await expect(firstSong).toHaveAttribute("aria-pressed", "false");

      // Should show "No song currently playing" again
      await expect(page.locator("body")).toContainText(
        "No song currently playing",
      );
    });

    test("dashboard song change is reflected in vote page via aria-live", async ({
      browser,
    }) => {
      // Use two separate browser contexts/pages
      const context = await browser.newContext();
      const dashboardPage = await context.newPage();
      const votePage = await context.newPage();

      // Create a game using the dashboard page
      const token = await createGame(dashboardPage);

      // Navigate dashboard page to the dashboard
      await gotoAndHydrate(dashboardPage, `/${token}/dashboard`);

      // Navigate vote page to the first voter's vote page
      await gotoAndHydrate(votePage, `/${token}`);
      const firstVoterLink = votePage.locator("ul a").first();
      await firstVoterLink.click();
      await votePage.waitForURL(new RegExp(`/${token}/votes/`));
      await votePage.waitForLoadState("networkidle");

      // Initially the aria-live region should be empty
      const nowPlaying = votePage.locator('[data-testid="now-playing"]');
      await expect(nowPlaying).toHaveText("");

      // Click the first song on the dashboard to set it as active
      const firstSongButton = dashboardPage
        .locator("button[data-song-country]")
        .first();
      const firstCountry = await firstSongButton.getAttribute(
        "data-song-country",
      );
      await firstSongButton.click();
      await expect(firstSongButton).toHaveAttribute("aria-pressed", "true");

      // The vote page aria-live region should update with the song info
      await expect(nowPlaying).toContainText(`Now playing`, {
        timeout: 10000,
      });
      await expect(nowPlaying).toContainText(firstCountry!);

      // Switch to a different song on the dashboard
      const secondSongButton = dashboardPage
        .locator("button[data-song-country]")
        .nth(1);
      const secondCountry = await secondSongButton.getAttribute(
        "data-song-country",
      );
      await secondSongButton.click();
      await expect(secondSongButton).toHaveAttribute("aria-pressed", "true");

      // The vote page should now show the second song
      await expect(nowPlaying).toContainText(secondCountry!, {
        timeout: 10000,
      });

      // Stop playing (click the same button again to deselect)
      await secondSongButton.click();
      await expect(secondSongButton).toHaveAttribute("aria-pressed", "false");

      // The aria-live region should be empty again
      await expect(nowPlaying).toHaveText("", { timeout: 10000 });

      await context.close();
    });
  });
});
