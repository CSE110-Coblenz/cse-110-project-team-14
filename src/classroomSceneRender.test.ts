import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  STAGE_HEIGHT,
  STAGE_WIDTH,
  IMAGE_DIMENSIONS,
} from "./constants";

interface SceneFile {
  items: Item[];
}

interface Item {
  name: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
}

function loadScene(): SceneFile {
  const raw = readFileSync(
    join(process.cwd(), "Public", "data", "classroomScene.json"),
    "utf-8"
  );
  return JSON.parse(raw) as SceneFile;
}

function validateItems(items: Item[]) {
  const seen = new Set<string>();
  items.forEach((item) => {
    if (seen.has(item.name)) {
      throw new Error(`Duplicate item name detected: ${item.name}`);
    }
    seen.add(item.name);

    const width = item.width ?? IMAGE_DIMENSIONS.width;
    const height = item.height ?? IMAGE_DIMENSIONS.height;

    if (item.x < 0 || item.y < 0) {
      throw new Error(`Negative coordinates for ${item.name}`);
    }
    if (item.x + width > STAGE_WIDTH || item.y + height > STAGE_HEIGHT) {
      throw new Error(
        `Item ${item.name} exceeds stage bounds at (${item.x}, ${item.y})`
      );
    }
  });
}

describe("Classroom scene data integrity", () => {
  it("contains items that can be rendered within the stage", () => {
    const scene = loadScene();
    expect(scene.items.length).toBeGreaterThan(0);

    expect(() => validateItems(scene.items)).not.toThrow();
  });

  it("throws an error when an item is outside the Konva stage bounds", () => {
    const invalidItems: Item[] = [
      { name: "bad-x", x: STAGE_WIDTH + 10, y: 0 },
      { name: "bad-y", x: 0, y: STAGE_HEIGHT + 10 },
    ];

    expect(() => validateItems(invalidItems)).toThrow(/stage bounds/i);
  });
});
