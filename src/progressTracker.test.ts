import { describe, it, expect, beforeEach } from "vitest";
import { ProgressTracker } from "./utils/ProgressTracker";

describe("ProgressTracker", () => {
  let tracker: ProgressTracker;

  beforeEach(() => {
    tracker = new ProgressTracker();
  });

  it("registers ids per category and reports totals", () => {
    tracker.registerItems(["classroom:book", "classroom:chair"], "items");
    tracker.registerItems(["classroom:camille"], "people");
    tracker.registerItems(["classroom:minigame"], "minigames");

    const counts = tracker.getCounts();
    expect(counts.items.total).toBe(2);
    expect(counts.people.total).toBe(1);
    expect(counts.minigames.total).toBe(1);
    expect(counts.items.found).toBe(0);
  });

  it("only counts discovered ids once", () => {
    tracker.registerItems(["store:apple"], "items");

    expect(tracker.markFound("store:apple", "items")).toBe(true);
    expect(tracker.markFound("store:apple", "items")).toBe(false);

    const counts = tracker.getCounts();
    expect(counts.items.found).toBe(1);
    expect(counts.items.total).toBe(1);
  });

  it("can reset categories selectively by predicate", () => {
    tracker.registerItems(
      ["store:apple", "store:banana", "restaurant:soup"],
      "items"
    );
    tracker.markFound("store:apple", "items");
    tracker.markFound("restaurant:soup", "items");

    tracker.resetCategory("items", (id) => id.startsWith("store:"));
    const counts = tracker.getCounts();

    expect(counts.items.found).toBe(1); // only restaurant:soup remains discovered
    expect(counts.items.total).toBe(3);
  });
});
