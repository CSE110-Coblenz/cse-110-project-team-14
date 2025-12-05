// function that receives [found, total] counts whenever they change
export type ProgressCategory = "items" | "people" | "minigames";

export type ProgressCounts = Record<
  ProgressCategory,
  {
    found: number;
    total: number;
  }
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
    items: new Set(),
    people: new Set(),
    minigames: new Set(),
  };
  private readonly discovered: Record<ProgressCategory, Set<string>> = {
    items: new Set(),
    people: new Set(),
    minigames: new Set(),
  };
  private readonly listeners = new Set<ProgressListener>();

  registerItems(ids: string[], category: ProgressCategory = "items"): void {
    ids.forEach((id) => this.registered[category].add(id));
    this.emit();
  }

  markFound(id: string, category: ProgressCategory = "items"): boolean {
    const before = this.discovered[category].size;
    this.discovered[category].add(id);
    const isNew = this.discovered[category].size !== before;
    if (isNew) {
      this.emit();
    }
    return isNew;
  }

  resetCategory(
    category: ProgressCategory,
    predicate?: (id: string) => boolean
  ): void {
    if (!predicate) {
      this.discovered[category].clear();
    } else {
      [...this.discovered[category]].forEach((id) => {
        if (predicate(id)) {
          this.discovered[category].delete(id);
        }
      });
    }
    this.emit();
  }

  getCounts(): ProgressCounts {
    return {
      items: {
        found: this.discovered.items.size,
        total: this.registered.items.size,
      },
      people: {
        found: this.discovered.people.size,
        total: this.registered.people.size,
      },
      minigames: {
        found: this.discovered.minigames.size,
        total: this.registered.minigames.size,
      },
    };
  }

  onChange(listener: ProgressListener): () => void {
    this.listeners.add(listener);
    // Send the current counts immediately so new listeners sync up.
    listener(this.getCounts());
    return () => this.listeners.delete(listener);
  }

  private emit(): void {
    const counts = this.getCounts();
    this.listeners.forEach((listener) => listener(counts));
  }
}
