import { describe, it, expect } from "vitest";
//import { ClassroomMinigameModel } from "./../../ClassroomMinigameModel";
import { ClassroomMinigameModel } from "./Screens/Classroom/ClassroomMinigame/ClassroomMinigameModel";
import type { Item } from "./types";

// Mock items matching the Item interface
const mockItems: Item[] = [
  { name: "pencil", english: "pencil", french: "crayon", phonetic: "kʁa.sɔ̃", image: "pencil.png", x: 0, y: 0 },
  { name: "book", english: "book", french: "livre", phonetic: "livʁ", image: "book.png", x: 0, y: 0 },
  { name: "eraser", english: "eraser", french: "gomme", phonetic: "ɡɔm", image: "eraser.png", x: 0, y: 0 },
];

describe("ClassroomMinigameModel", () => {
  it("should initialize with items and generate basket names", () => {
    const model = new ClassroomMinigameModel(mockItems);

    // Ensure all items are loaded
    expect(model.getItems()).toHaveLength(3);

    // Basket names should match French names
    const basketNames = model.getBasketNames();
    expect(basketNames).toContain("crayon");
    expect(basketNames).toContain("livre");
    expect(basketNames).toContain("gomme");
  });

  it("should correctly place items in baskets", () => {
    const model = new ClassroomMinigameModel(mockItems);

    // Place correctly
    const correct = model.placeItemInBasket("pencil", "crayon");
    expect(correct).toBe(true);
    expect(model.isPlaced("pencil")).toBe(true);
    expect(model.getBasketContents("crayon")).toContainEqual(mockItems[0]);

    // Place incorrectly
    const wrong = model.placeItemInBasket("book", "gomme");
    expect(wrong).toBe(false);
    expect(model.isPlaced("book")).toBe(true);
    expect(model.getBasketContents("gomme")).toContainEqual(mockItems[1]);
  });

  it("should detect when all items are placed", () => {
    const model = new ClassroomMinigameModel(mockItems);

    // Initially, none are placed
    expect(model.allItemsPlaced()).toBe(false);

    // Place all correctly
    mockItems.forEach(item => model.placeItemInBasket(item.name, item.french));
    expect(model.allItemsPlaced()).toBe(true);
  });

  it("should reset the game correctly", () => {
    const model = new ClassroomMinigameModel(mockItems);
    model.placeItemInBasket("pencil", "crayon");

    model.reset();
    expect(model.allItemsPlaced()).toBe(false);
    expect(model.getBasketContents("crayon")).toHaveLength(0);
  });
});
