import { describe, expect, it } from "vitest";
import { extractHashtags, popularTags, splitHashtags } from "@/lib/hashtags";

describe("hashtags", () => {
  it("extracts Arabic and Latin tags, deduplicated", () => {
    expect(extractHashtags("درس #فيزياء و #Physics ثم #فيزياء")).toEqual(["فيزياء", "physics"]);
  });
  it("normalizes alef and taa marbuta", () => {
    expect(extractHashtags("#أحياء #طاقة")).toEqual(["احياء", "طاقه"]);
  });
  it("ranks popular tags by count", () => {
    expect(popularTags(["#a #b", "#a"])[0]).toEqual({ tag: "a", count: 2 });
  });
  it("splits text into tag parts", () => {
    expect(splitHashtags("hi #x").map((p) => p.tag)).toEqual([undefined, "x"]);
  });
});
