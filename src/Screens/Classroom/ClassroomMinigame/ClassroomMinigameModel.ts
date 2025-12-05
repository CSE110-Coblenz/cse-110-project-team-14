import type { Item } from "../../../types";

/**
 * Model for the classroom minigame:
 * - Tracks where each item was placed
 * - Computes how many are correct at the end
 */
export class ClassroomMinigameModel {
  private items: Item[];
  // itemName -> basketName
  private placements: Map<string, string> = new Map();

  constructor(items: Item[]) {
    this.items = items;
  }

  getItems(): Item[] {
    return this.items;
  }

  /** Called when the user drops an item into a basket */
  placeItem(itemName: string, basketName: string): void {
    this.placements.set(itemName, basketName);
  }

  // Returns true if the item was placed in the correct basket
  // added helper methods so that existing tests would work
  placeItemInBasket(itemName: string, basketName: string): boolean {
    const item = this.items.find((i) => i.name === itemName);
    if (!item) return false;
    this.placements.set(itemName, basketName);
    return basketName === item.french;
  }

  isPlaced(itemName: string): boolean {
    return this.placements.has(itemName);
  }

  getBasketContents(basketName: string): Item[] {
    return this.items.filter(
      (item) => this.placements.get(item.name) === basketName
    );
  }
  // end helper methods

  /** Total number of items in the game */
  getTotal(): number {
    return this.items.length;
  }

  /** Did the player place all items somewhere? */
  allItemsPlaced(): boolean {
    return this.placements.size === this.items.length;
  }

  /** How many items are in the correct basket? */
  getCorrectCount(): number {
    let correct = 0;
    for (const item of this.items) {
      const chosenBasket = this.placements.get(item.name);
      if (chosenBasket === item.french) {
        correct++;
      }
    }
    return correct;
  }

  /** Basket labels: unique French names from the items */
  getBasketNames(): string[] {
    return Array.from(new Set(this.items.map((i) => i.french)));
  }

  reset(): void {
    this.placements.clear();
  }
}
