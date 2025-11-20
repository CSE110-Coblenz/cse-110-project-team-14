import type { Item } from "../../../types";

/**
 * Model managing the state of the Classroom Minigame.
 */
export class ClassroomMinigameModel {
  private items: Item[];                // All items in the game
  private baskets: { [key: string]: Item[] } = {}; // Basket contents
  private placedItems: Set<string> = new Set();   // Track items already placed

  constructor(items: Item[]) {
    this.items = items;
  }

  /** Load from a JSON file */
  static async fromJSON(url: string): Promise<ClassroomMinigameModel> {
    const res = await fetch(url);
    const data = await res.json();
    return new ClassroomMinigameModel(data.items);
  }

  /** Get all items */
  getItems(): Item[] {
    return this.items;
  }

  /** Place an item into a basket, return whether it’s correct */
  placeItemInBasket(itemName: string, basketName: string): boolean {
    const item = this.items.find(i => i.name === itemName);
    if (!item) return false;

    this.placedItems.add(itemName);

    if (!this.baskets[basketName]) this.baskets[basketName] = [];
    if (!this.baskets[basketName].includes(item)) {
      this.baskets[basketName].push(item);
    }

    return basketName === item.french; // Correct if basket matches item's French name
  }

  /** Check if an item has been placed */
  isPlaced(itemName: string): boolean {
    return this.placedItems.has(itemName);
  }

  /** Get all items in a specific basket */
  getBasketContents(basketName: string): Item[] {
    return this.baskets[basketName] ?? [];
  }

  /** Check if all items have been placed */
  allItemsPlaced(): boolean {
    return this.items.every(i => this.placedItems.has(i.name));
  }

  /** Reset the game state */
  reset(): void {
    this.baskets = {};
    this.placedItems.clear();
  }

  /** Get unique basket names derived from items */
  getBasketNames(): string[] {
    return Array.from(new Set(this.items.map(i => i.french)));
  }
}
