import type { Item } from "../../../types";

/**
 * Manages the state of the classroom minigame.
 */
export class ClassroomMinigameModel {
  private items: Item[];
  private baskets: { [key: string]: Item[] } = {};
  private placedItems: Set<string> = new Set();

  constructor(items: Item[]) {
    this.items = items;
  }

  /** Initialize from JSON */
  static async fromJSON(url: string): Promise<ClassroomMinigameModel> {
    const res = await fetch(url);
    const data = await res.json();
    return new ClassroomMinigameModel(data.items);
  }

  getItems(): Item[] {
    return this.items;
  }

  placeItemInBasket(itemName: string, basketName: string): boolean {
    const item = this.items.find((i) => i.name === itemName);
    if (!item) return false;

    this.placedItems.add(itemName);

    if (!this.baskets[basketName]) this.baskets[basketName] = [];
    if (!this.baskets[basketName].includes(item)) {
      this.baskets[basketName].push(item);
    }

    return basketName === item.french; // correct basket check
  }

  isPlaced(itemName: string): boolean {
    return this.placedItems.has(itemName);
  }

  getBasketContents(basketName: string): Item[] {
    return this.baskets[basketName] ?? [];
  }

  allItemsPlaced(): boolean {
    return this.items.every((i) => this.placedItems.has(i.name));
  }

  reset(): void {
    this.baskets = {};
    this.placedItems.clear();
  }

  /** Get unique basket names from items */
  getBasketNames(): string[] {
    return Array.from(new Set(this.items.map((i) => i.french)));
  }
}
