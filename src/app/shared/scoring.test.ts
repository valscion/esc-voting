import { describe, it, expect } from "vitest";
import { computeMedianScore, scoreToEmoji } from "./scoring";

describe("computeMedianScore", () => {
  it("returns 0 for an empty array", () => {
    expect(computeMedianScore([])).toBe(0);
  });

  it("returns the single value for a one-element array", () => {
    expect(computeMedianScore([5])).toBe(5);
    expect(computeMedianScore([-1])).toBe(-1);
  });

  it("returns the middle value for an odd-length array", () => {
    // [1, 3, 5] → median = 3
    expect(computeMedianScore([5, 1, 3])).toBe(3);
  });

  it("returns the floor of the average of two middle values for even-length", () => {
    // [1, 3] → (1+3)/2 = 2, floor = 2
    expect(computeMedianScore([3, 1])).toBe(2);
    // [0, 1] → (0+1)/2 = 0.5, floor = 0
    expect(computeMedianScore([1, 0])).toBe(0);
    // [3, 5] → (3+5)/2 = 4, floor = 4
    expect(computeMedianScore([5, 3])).toBe(4);
  });

  it("handles negative scores", () => {
    // [-1, 0] → (-1+0)/2 = -0.5, floor = -1
    expect(computeMedianScore([-1, 0])).toBe(-1);
    // [-1, 1] → (-1+1)/2 = 0, floor = 0
    expect(computeMedianScore([-1, 1])).toBe(0);
  });

  it("handles duplicate values", () => {
    expect(computeMedianScore([3, 3, 3])).toBe(3);
    expect(computeMedianScore([5, 5])).toBe(5);
  });

  it("handles all five rating scores", () => {
    // [-1, 0, 1, 3, 5] → median = 1
    expect(computeMedianScore([5, 3, 1, 0, -1])).toBe(1);
  });

  it("handles four scores (even count)", () => {
    // [-1, 0, 1, 3] → (0+1)/2 = 0.5, floor = 0
    expect(computeMedianScore([3, -1, 1, 0])).toBe(0);
    // [1, 3, 5, 5] → (3+5)/2 = 4, floor = 4
    expect(computeMedianScore([5, 1, 5, 3])).toBe(4);
  });
});

describe("scoreToEmoji", () => {
  it("maps exact score values to their emojis", () => {
    expect(scoreToEmoji(5)).toBe("🤩");
    expect(scoreToEmoji(3)).toBe("😁");
    expect(scoreToEmoji(1)).toBe("😐");
    expect(scoreToEmoji(0)).toBe("😴");
    expect(scoreToEmoji(-1)).toBe("🤮");
  });

  it("rounds down to nearest valid emoji score", () => {
    // 4 is between 5 (🤩) and 3 (😁) → 😁
    expect(scoreToEmoji(4)).toBe("😁");
    // 2 is between 3 (😁) and 1 (😐) → 😐
    expect(scoreToEmoji(2)).toBe("😐");
  });

  it("handles scores above the maximum", () => {
    expect(scoreToEmoji(10)).toBe("🤩");
    expect(scoreToEmoji(100)).toBe("🤩");
  });

  it("handles scores below the minimum", () => {
    // -2 is below -1 (🤮), so it should still map to 🤮
    expect(scoreToEmoji(-2)).toBe("🤮");
    expect(scoreToEmoji(-100)).toBe("🤮");
  });

  it("handles fractional scores by rounding down", () => {
    // 0.5 → 😴 (score 0)
    expect(scoreToEmoji(0.5)).toBe("😴");
    // 3.9 → 😁 (score 3)
    expect(scoreToEmoji(3.9)).toBe("😁");
    // -0.5 → 🤮 (score -1)
    expect(scoreToEmoji(-0.5)).toBe("🤮");
  });
});
