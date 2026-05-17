import { describe, it, expect } from "vitest";
import {
  xpForLevel,
  levelFromXp,
  xpToNextLevel,
  levelProgress,
  rankFromLevel,
  streakBonus,
} from "@/lib/constants";

describe("xpForLevel", () => {
  it("returns 0 for level 1 so new users start with a full bar", () => {
    expect(xpForLevel(1)).toBe(0);
  });

  it("returns 0 for level 0 (clamped by max(0, n-1))", () => {
    expect(xpForLevel(0)).toBe(0);
  });

  it("returns 100 for level 2", () => {
    expect(xpForLevel(2)).toBe(100);
  });

  it("returns 282 for level 3 (floor(100 * 2^1.5))", () => {
    expect(xpForLevel(3)).toBe(282);
  });

  it("returns 2700 for level 10 (floor(100 * 9^1.5))", () => {
    expect(xpForLevel(10)).toBe(2700);
  });

  it("is strictly increasing for levels 1–20", () => {
    for (let l = 2; l <= 20; l++) {
      expect(xpForLevel(l)).toBeGreaterThan(xpForLevel(l - 1));
    }
  });
});

describe("levelFromXp", () => {
  it("returns level 1 at 0 XP", () => {
    expect(levelFromXp(0)).toBe(1);
  });

  it("stays at level 1 just below the threshold (99 XP)", () => {
    expect(levelFromXp(99)).toBe(1);
  });

  it("reaches level 2 at exactly 100 XP", () => {
    expect(levelFromXp(100)).toBe(2);
  });

  it("stays at level 2 just below the level-3 threshold (281 XP)", () => {
    expect(levelFromXp(281)).toBe(2);
  });

  it("reaches level 3 at exactly 282 XP", () => {
    expect(levelFromXp(282)).toBe(3);
  });

  it("is consistent with xpForLevel — xpForLevel(n) always maps back to level n", () => {
    for (let l = 1; l <= 15; l++) {
      expect(levelFromXp(xpForLevel(l))).toBe(l);
    }
  });
});

describe("xpToNextLevel", () => {
  it("returns 100 at 0 XP (full level-1 gap remaining)", () => {
    expect(xpToNextLevel(0)).toBe(100);
  });

  it("returns 50 at 50 XP (halfway through level 1)", () => {
    expect(xpToNextLevel(50)).toBe(50);
  });

  it("returns the level-3 threshold (282) at the start of level 2 (no progress made yet)", () => {
    // formula: next - (xp - current) = 282 - (100 - 100) = 282
    expect(xpToNextLevel(100)).toBe(282);
  });

  it("decreases as XP increases within a level", () => {
    expect(xpToNextLevel(50)).toBeLessThan(xpToNextLevel(0));
  });
});

describe("levelProgress", () => {
  it("returns 0 at the start of level 1", () => {
    expect(levelProgress(0)).toBe(0);
  });

  it("returns 50 at the midpoint of level 1", () => {
    expect(levelProgress(50)).toBe(50);
  });

  it("returns 100 just before the level-2 threshold", () => {
    expect(levelProgress(99)).toBeCloseTo(99, 0);
  });

  it("returns 0 at the start of level 2 (just leveled up)", () => {
    expect(levelProgress(100)).toBe(0);
  });

  it("stays in [0, 100] for any non-negative XP value", () => {
    for (const xp of [0, 1, 50, 99, 100, 282, 1000, 5000]) {
      const p = levelProgress(xp);
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(100);
    }
  });
});

describe("rankFromLevel", () => {
  it("returns E for levels 0–9", () => {
    expect(rankFromLevel(0)).toBe("E");
    expect(rankFromLevel(9)).toBe("E");
  });

  it("returns D at level 10", () => {
    expect(rankFromLevel(10)).toBe("D");
    expect(rankFromLevel(24)).toBe("D");
  });

  it("returns C at level 25", () => {
    expect(rankFromLevel(25)).toBe("C");
    expect(rankFromLevel(49)).toBe("C");
  });

  it("returns B at level 50", () => {
    expect(rankFromLevel(50)).toBe("B");
    expect(rankFromLevel(99)).toBe("B");
  });

  it("returns A at level 100", () => {
    expect(rankFromLevel(100)).toBe("A");
    expect(rankFromLevel(199)).toBe("A");
  });

  it("returns S at level 200+", () => {
    expect(rankFromLevel(200)).toBe("S");
    expect(rankFromLevel(999)).toBe("S");
  });
});

describe("streakBonus", () => {
  it("returns 0 for streaks below 3", () => {
    expect(streakBonus(0)).toBe(0);
    expect(streakBonus(2)).toBe(0);
  });

  it("returns 0.1 (10%) for streaks 3–6", () => {
    expect(streakBonus(3)).toBe(0.1);
    expect(streakBonus(6)).toBe(0.1);
  });

  it("returns 0.2 (20%) for streaks 7–13", () => {
    expect(streakBonus(7)).toBe(0.2);
    expect(streakBonus(13)).toBe(0.2);
  });

  it("returns 0.3 (30%) for streaks 14–29", () => {
    expect(streakBonus(14)).toBe(0.3);
    expect(streakBonus(29)).toBe(0.3);
  });

  it("returns 0.5 (50%) for streaks 30+", () => {
    expect(streakBonus(30)).toBe(0.5);
    expect(streakBonus(100)).toBe(0.5);
  });
});
