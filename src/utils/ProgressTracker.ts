export type ProgressCategory =
  | "classroomItems"
  | "storeItems"
  | "restaurantItems"
  | "people"
  | "minigame";

type ProgressCounts = Record<
  ProgressCategory | "total",
  { found: number; total: number }
>;

type ProgressListener = (counts: ProgressCounts) => void;

/**
 * Tracks how many unique vocabulary items across all scenes have been discovered.
 * Controllers register their item ids so the total stays correct, then call
 * markFound(id) when a player clicks an object. The tracker deduplicates ids and
 * notifies subscribed views whenever counts change.
 */
export class ProgressTracker {
  private readonly registered: Record<ProgressCategory, Set<string>> = {
    classroomItems: new Set(),
    storeItems: new Set(),
    restaurantItems: new Set(),
    people: new Set(),
    minigame: new Set(),
  };
  private readonly discovered: Record<ProgressCategory, Set<string>> = {
    classroomItems: new Set(),
    storeItems: new Set(),
    restaurantItems: new Set(),
    people: new Set(),
    minigame: new Set(),
  };
  private readonly listeners = new Set<ProgressListener>();

  registerItems(category: ProgressCategory, ids: string[]): void {
    ids.forEach((id) => this.registered[category].add(id));
    this.emit();
  }

  markFound(category: ProgressCategory, id: string): boolean {
    const before = this.discovered[category].size;
    this.discovered[category].add(id);
    const isNew = this.discovered[category].size !== before;
    if (isNew) {
      this.emit();
    }
    return isNew;
  }

  reset(): void {
    (Object.keys(this.discovered) as ProgressCategory[]).forEach((category) =>
      this.discovered[category].clear()
    );
    this.emit();
  }

  getCounts(): ProgressCounts {
    const counts = {} as ProgressCounts;
    let totalFound = 0;
    let totalRegistered = 0;

    (Object.keys(this.registered) as ProgressCategory[]).forEach((category) => {
      const found = this.discovered[category].size;
      const total = this.registered[category].size;
      counts[category] = { found, total };
      totalFound += found;
      totalRegistered += total;
    });

    counts.total = { found: totalFound, total: totalRegistered };
    return counts;
  }

  onChange(listener: ProgressListener): () => void {
    this.listeners.add(listener);
    // Send the current counts immediately so new listeners sync up.
    listener(this.getCounts());
    return () => this.listeners.delete(listener);
  }

  private emit(): void {
    const counts = this.getCounts();
    console.log(
      "[ProgressTracker]",
      `Classroom: ${counts.classroomItems.found}/${counts.classroomItems.total},`,
      `Store: ${counts.storeItems.found}/${counts.storeItems.total},`,
      `Restaurant: ${counts.restaurantItems.found}/${counts.restaurantItems.total},`,
      `People: ${counts.people.found}/${counts.people.total},`,
      `Minigame: ${counts.minigame.found}/${counts.minigame.total},`,
      `Total: ${counts.total.found}/${counts.total.total}`
    );
    this.listeners.forEach((listener) => listener(counts));
  }
}
