import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MEMBERS, POSTS, REPORTS, REVIEW_QUEUE, ROOMS, ROOM_MESSAGES, SAMPLE_SUBMISSIONS } from "@/data/sample";
import { EMPTY_ANSWERS, useMySubmissions, useProfile } from "@/lib/app-state";
import { createSubmission } from "@/lib/rules";

describe("safe sample cleanup", () => {
  it("contains no fabricated users", () => {
    expect(MEMBERS).toEqual([]);
  });

  it("contains no demo posts or submissions", () => {
    expect(POSTS).toEqual([]);
    expect(SAMPLE_SUBMISSIONS).toEqual([]);
  });

  it("contains no mock community activity", () => {
    expect(REPORTS).toEqual([]);
    expect(REVIEW_QUEUE).toEqual([]);
    expect(ROOMS).toEqual([]);
    expect(ROOM_MESSAGES).toEqual({});
  });

  it("preserves saved user profiles even when their handle matches an old sample", () => {
    const profile = { username: "lina_stars", bio: "محتوى شخصي", answers: EMPTY_ANSWERS, showFieldsPublicly: false };
    const { result, unmount } = renderHook(() => useProfile());
    act(() => result.current[1](profile));
    unmount();
    const restored = renderHook(() => useProfile());
    expect(restored.result.current[0]).toEqual(profile);
    expect(JSON.parse(localStorage.getItem("sw-profile") ?? "null")).toEqual(profile);
    restored.unmount();
  });

  it("preserves user-created submissions without merging in samples", () => {
    const submission = createSubmission({ title: "سؤال حقيقي", body: "تفاصيل كتبها صاحب الملف", category: "physics", intent: "answer" });
    const { result, unmount } = renderHook(() => useMySubmissions());
    act(() => result.current[1]([submission]));
    unmount();
    const restored = renderHook(() => useMySubmissions());
    expect(restored.result.current[0]).toEqual([submission]);
    expect(JSON.parse(localStorage.getItem("sw-submissions") ?? "[]")).toEqual([submission]);
    restored.unmount();
  });
});