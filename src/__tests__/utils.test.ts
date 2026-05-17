import { describe, it, expect } from "vitest";
import {
  formatNumber,
  truncate,
  startOfDay,
  endOfDay,
  isSameDay,
  randomFrom,
} from "@/lib/utils";

describe("formatNumber", () => {
  it("returns the number as-is below 1000", () => {
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(999)).toBe("999");
  });

  it("formats thousands with one decimal and K suffix", () => {
    expect(formatNumber(1000)).toBe("1.0K");
    expect(formatNumber(1500)).toBe("1.5K");
    expect(formatNumber(999999)).toBe("1000.0K");
  });

  it("formats millions with one decimal and M suffix", () => {
    expect(formatNumber(1_000_000)).toBe("1.0M");
    expect(formatNumber(2_500_000)).toBe("2.5M");
  });
});

describe("truncate", () => {
  it("returns the string unchanged when it fits within maxLen", () => {
    expect(truncate("hello", 10)).toBe("hello");
    expect(truncate("hello", 5)).toBe("hello");
  });

  it("truncates and appends '...' when the string exceeds maxLen", () => {
    expect(truncate("hello world", 8)).toBe("hello...");
  });

  it("the result is exactly maxLen characters when truncated", () => {
    const result = truncate("abcdefghij", 7);
    expect(result.length).toBe(7);
    expect(result).toBe("abcd...");
  });
});

describe("startOfDay", () => {
  it("sets time to midnight (00:00:00.000)", () => {
    const d = startOfDay(new Date("2024-06-15T14:30:45.123Z"));
    expect(d.getHours()).toBe(0);
    expect(d.getMinutes()).toBe(0);
    expect(d.getSeconds()).toBe(0);
    expect(d.getMilliseconds()).toBe(0);
  });

  it("does not mutate the input date", () => {
    const input = new Date("2024-06-15T14:30:00.000Z");
    const original = input.getTime();
    startOfDay(input);
    expect(input.getTime()).toBe(original);
  });

  it("defaults to today when called with no argument", () => {
    const result = startOfDay();
    const today = new Date();
    expect(result.getDate()).toBe(today.getDate());
  });
});

describe("endOfDay", () => {
  it("sets time to 23:59:59.999", () => {
    const d = endOfDay(new Date("2024-06-15T00:00:00.000Z"));
    expect(d.getHours()).toBe(23);
    expect(d.getMinutes()).toBe(59);
    expect(d.getSeconds()).toBe(59);
    expect(d.getMilliseconds()).toBe(999);
  });

  it("does not mutate the input date", () => {
    const input = new Date("2024-06-15T14:30:00.000Z");
    const original = input.getTime();
    endOfDay(input);
    expect(input.getTime()).toBe(original);
  });

  it("endOfDay is always after startOfDay for the same date", () => {
    const date = new Date("2024-06-15T12:00:00.000Z");
    expect(endOfDay(date).getTime()).toBeGreaterThan(startOfDay(date).getTime());
  });
});

describe("isSameDay", () => {
  it("returns true for two identical dates", () => {
    const d = new Date("2024-06-15T10:00:00");
    expect(isSameDay(d, d)).toBe(true);
  });

  it("returns true for the same calendar day at different times", () => {
    const a = new Date("2024-06-15T00:00:00");
    const b = new Date("2024-06-15T23:59:59");
    expect(isSameDay(a, b)).toBe(true);
  });

  it("returns false for consecutive days", () => {
    const a = new Date("2024-06-15T23:59:59");
    const b = new Date("2024-06-16T00:00:00");
    expect(isSameDay(a, b)).toBe(false);
  });

  it("returns false for the same day in different months", () => {
    const a = new Date("2024-06-15");
    const b = new Date("2024-07-15");
    expect(isSameDay(a, b)).toBe(false);
  });

  it("returns false for the same day in different years", () => {
    const a = new Date("2023-06-15");
    const b = new Date("2024-06-15");
    expect(isSameDay(a, b)).toBe(false);
  });
});

describe("randomFrom", () => {
  it("returns the only element from a single-item array", () => {
    expect(randomFrom(["only"] as const)).toBe("only");
  });

  it("always returns an element that belongs to the array", () => {
    const arr = [1, 2, 3, 4, 5] as const;
    for (let i = 0; i < 20; i++) {
      expect(arr).toContain(randomFrom(arr));
    }
  });
});
