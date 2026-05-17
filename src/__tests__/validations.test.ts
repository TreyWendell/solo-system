import { describe, it, expect } from "vitest";
import {
  registerSchema,
  loginSchema,
  completeQuestSchema,
  updateProfileSchema,
  sendFriendRequestSchema,
  respondFriendRequestSchema,
} from "@/lib/validations";

const VALID_CUID = "clxxxxxxxxxxxxxxxxxxxxxxxx";

describe("registerSchema", () => {
  const base = { email: "user@example.com", username: "player1", password: "securepass" };

  it("accepts a valid registration payload", () => {
    expect(() => registerSchema.parse(base)).not.toThrow();
  });

  it("accepts an optional displayName", () => {
    expect(() => registerSchema.parse({ ...base, displayName: "Player One" })).not.toThrow();
  });

  it("rejects an invalid email", () => {
    expect(() => registerSchema.parse({ ...base, email: "not-an-email" })).toThrow();
  });

  it("rejects a username shorter than 3 characters", () => {
    expect(() => registerSchema.parse({ ...base, username: "ab" })).toThrow();
  });

  it("rejects a username longer than 20 characters", () => {
    expect(() => registerSchema.parse({ ...base, username: "a".repeat(21) })).toThrow();
  });

  it("rejects a username with special characters", () => {
    expect(() => registerSchema.parse({ ...base, username: "bad username!" })).toThrow();
  });

  it("accepts underscores in username", () => {
    expect(() => registerSchema.parse({ ...base, username: "good_user_123" })).not.toThrow();
  });

  it("rejects a password shorter than 8 characters", () => {
    expect(() => registerSchema.parse({ ...base, password: "short" })).toThrow();
  });

  it("rejects a password longer than 100 characters", () => {
    expect(() => registerSchema.parse({ ...base, password: "a".repeat(101) })).toThrow();
  });
});

describe("loginSchema", () => {
  const base = { email: "user@example.com", password: "anypassword" };

  it("accepts valid credentials", () => {
    expect(() => loginSchema.parse(base)).not.toThrow();
  });

  it("rejects an invalid email", () => {
    expect(() => loginSchema.parse({ ...base, email: "bad" })).toThrow();
  });

  it("rejects an empty password", () => {
    expect(() => loginSchema.parse({ ...base, password: "" })).toThrow();
  });
});

describe("completeQuestSchema", () => {
  it("accepts a valid cuid questId", () => {
    expect(() => completeQuestSchema.parse({ questId: VALID_CUID })).not.toThrow();
  });

  it("accepts an optional notes field", () => {
    expect(() =>
      completeQuestSchema.parse({ questId: VALID_CUID, notes: "Felt great today" })
    ).not.toThrow();
  });

  it("rejects a non-cuid questId", () => {
    expect(() => completeQuestSchema.parse({ questId: "not-a-cuid" })).toThrow();
  });

  it("rejects notes exceeding 500 characters", () => {
    expect(() =>
      completeQuestSchema.parse({ questId: VALID_CUID, notes: "a".repeat(501) })
    ).toThrow();
  });
});

describe("updateProfileSchema", () => {
  it("accepts an empty object (all fields optional)", () => {
    expect(() => updateProfileSchema.parse({})).not.toThrow();
  });

  it("accepts a valid partial update", () => {
    expect(() =>
      updateProfileSchema.parse({ displayName: "New Name", bio: "Hello", isPublic: false })
    ).not.toThrow();
  });

  it("rejects a bio longer than 300 characters", () => {
    expect(() => updateProfileSchema.parse({ bio: "a".repeat(301) })).toThrow();
  });

  it("rejects a displayName longer than 50 characters", () => {
    expect(() => updateProfileSchema.parse({ displayName: "a".repeat(51) })).toThrow();
  });
});

describe("sendFriendRequestSchema", () => {
  it("accepts a valid username", () => {
    expect(() => sendFriendRequestSchema.parse({ username: "hunter99" })).not.toThrow();
  });

  it("rejects a username shorter than 3 characters", () => {
    expect(() => sendFriendRequestSchema.parse({ username: "ab" })).toThrow();
  });

  it("rejects a username longer than 20 characters", () => {
    expect(() => sendFriendRequestSchema.parse({ username: "a".repeat(21) })).toThrow();
  });
});

describe("respondFriendRequestSchema", () => {
  it("accepts action=accept with a valid cuid", () => {
    expect(() =>
      respondFriendRequestSchema.parse({ friendshipId: VALID_CUID, action: "accept" })
    ).not.toThrow();
  });

  it("accepts action=reject with a valid cuid", () => {
    expect(() =>
      respondFriendRequestSchema.parse({ friendshipId: VALID_CUID, action: "reject" })
    ).not.toThrow();
  });

  it("rejects an invalid action", () => {
    expect(() =>
      respondFriendRequestSchema.parse({ friendshipId: VALID_CUID, action: "ignore" })
    ).toThrow();
  });

  it("rejects a non-cuid friendshipId", () => {
    expect(() =>
      respondFriendRequestSchema.parse({ friendshipId: "bad-id", action: "accept" })
    ).toThrow();
  });
});
