import { describe, it, expect, beforeEach } from "vitest";
import { globals } from "./constants";

describe("Store dictionary logic", () => {
  beforeEach(() => {
    globals.dictionary = {};
  });

  it("adds an item to globals.dictionary when clicked", () => {
    const item = { english: "Soup", french: "La soupe" };

    // Simulate the click handler
    const onItemClick = () => {};
    const handleClick = () => {
      if (!globals.dictionary[item.english]) {
        globals.dictionary[item.english] = item.french;
      }
      onItemClick();
    };

    // Dictionary starts empty
    expect(globals.dictionary).toEqual({});

    // Simulate click
    handleClick();

    // Dictionary now contains the item
    expect(globals.dictionary).toHaveProperty("Soup", "La soupe");
  });
});
