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
   * Places an item in a basket.
   */
  placeItemInBasket(itemName: string, basketName: string): void {
    const item = this.items.find((i) => i.name === itemName);
    if (!item) return;

    if (!this.baskets[basketName]) this.baskets[basketName] = [];
    if (!this.baskets[basketName].includes(item)) {
      this.baskets[basketName].push(item);
    }
  }

  getBasketContents(basketName: string): Item[] {
    return this.baskets[basketName] ?? [];
  }

  reset(): void {
    this.baskets = {};
    this.selectedItem = null;
  }
}
