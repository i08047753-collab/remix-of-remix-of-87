import { describe, expect, it } from "vitest";
import { createSubmission, validateBio, validateUsername } from "@/lib/rules";

describe("username rules", () => {
  it("rejects usernames shorter than 3 characters", () => {
    expect(validateUsername("ab").ok).toBe(false);
  });

  it("rejects usernames longer than 20 characters", () => {
    expect(validateUsername("a".repeat(21)).ok).toBe(false);
  });

  it("only allows latin letters, digits and underscore", () => {
    expect(validateUsername("nour-sci").ok).toBe(false);
    expect(validateUsername("nour_sci9").ok).toBe(true);
  });

  it("treats usernames as unique regardless of letter case", () => {
    expect(validateUsername("Lina_Stars", ["lina_stars"]).ok).toBe(false);
  });
});

describe("bio rule", () => {
  it("limits the bio to 160 characters", () => {
    expect(validateBio("a".repeat(160))).toBeNull();
    expect(validateBio("a".repeat(161))).not.toBeNull();
  });
});

describe("post moderation rule", () => {
  it("every new member submission starts as pending review, never published", () => {
    const s = createSubmission({ title: "سؤال", body: "تفاصيل السؤال هنا", category: "physics", intent: "answer" });
    expect(s.status).toBe("pending");
  });
});
