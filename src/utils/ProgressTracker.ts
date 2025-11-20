type ProgressListener = (counts: { found: number; total: number }) => void;

/**
 * Tracks how many unique vocabulary items across all scenes have been discovered.
 * Controllers register their item ids so the total stays correct, then call
 * markFound(id) when a player clicks an object. The tracker deduplicates ids and
 * notifies subscribed views whenever counts change.
 */
export class ProgressTracker {
  private readonly registered = new Set<string>();
  private readonly discovered = new Set<string>();
  private readonly listeners = new Set<ProgressListener>();

  registerItems(ids: string[]): void {
    ids.forEach((id) => this.registered.add(id));
    this.emit();
  }

  markFound(id: string): boolean {
    const before = this.discovered.size;
    this.discovered.add(id);
    const isNew = this.discovered.size !== before;
    if (isNew) {
      this.emit();
    }
    return isNew;
  }

  reset(): void {
    this.discovered.clear();
    this.emit();
  }

  getCounts(): { found: number; total: number } {
    return { found: this.discovered.size, total: this.registered.size };
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
