import type { Item } from "../../../types";

interface MinigameState {
  baskets: { [key: string]: Item[] };
}

/**
 * Manages the state of the classroom minigame.
 */
export class ClassroomMinigameModel {
  private items: Item[];
  private baskets: { [key: string]: Item[] } = {};
  private selectedItem: Item | null = null;

  constructor(items: Item[]) {
    // Initialize items with `placed` property
    this.items = items.map((item) => ({ ...item, placed: false }));
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
   * Places an item in a basket.
   * Returns true if item is in the correct basket (basketName matches item.french).
   */
  placeItemInBasket(itemName: string, basketName: string): boolean {
    const item = this.items.find((i) => i.name === itemName);
    if (!item) return false;

    item.placed = true;

    if (!this.baskets[basketName]) this.baskets[basketName] = [];
    if (!this.baskets[basketName].includes(item)) {
      this.baskets[basketName].push(item);
    }

    // If basketName matches the item's French label, it's correct
    return basketName === item.french;
  }

  getBasketContents(basketName: string): Item[] {
    return this.baskets[basketName] ?? [];
  }

  reset(): void {
    this.baskets = {};
    this.selectedItem = null;
    this.items.forEach((i) => (i.placed = false));
  }
}
