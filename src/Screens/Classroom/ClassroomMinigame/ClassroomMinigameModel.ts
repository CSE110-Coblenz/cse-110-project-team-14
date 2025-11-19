import type { Item } from "../../../types";

/**
 * Manages the state of the classroom minigame.
 */
export class ClassroomMinigameModel {
  private items: Item[];
  private baskets: { [key: string]: Item[] } = {};
  private placedItems: Set<string> = new Set(); // Track item placement
  private selectedItem: Item | null = null;

  constructor(items: Item[]) {
    this.items = items;
  }

  getItems(): Item[] {
    return this.items;
  }

  selectItem(name: string): void {
    this.selectedItem = this.items.find((item) => item.name === name) ?? null;
  }

  getSelectedItem(): Item | null {
    return this.selectedItem;
  }

  /**
   * Place an item in a basket.
   * Returns true if placed in the correct basket (basketName matches item.french).
   */
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
    this.selectedItem = null;
    this.placedItems.clear();
  }
}
