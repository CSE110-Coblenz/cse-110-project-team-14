import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Store items JSON", () => {
  it("should have at least 3 items", () => {
    // Resolve path to your JSON file
    const filePath = "./Public/ItemImage/Store/items.json";

    // Read file and parse JSON
    const rawData = fs.readFileSync(filePath, "utf-8");
    const items = JSON.parse(rawData);

    // Assertion: there should be at least 3 items
    expect(Array.isArray(items)).toBe(true); // Ensure it's an array
    expect(items.length).toBeGreaterThanOrEqual(3);
  });
});