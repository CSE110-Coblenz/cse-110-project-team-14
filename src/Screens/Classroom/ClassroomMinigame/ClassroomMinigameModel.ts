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
