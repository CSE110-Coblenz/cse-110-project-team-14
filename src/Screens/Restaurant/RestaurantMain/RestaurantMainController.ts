import { RestaurantMainModel } from "./RestaurantMainModel";
import { RestaurantMainView } from "./RestaurantMainView";
import { ProgressTracker } from "../../../utils/ProgressTracker";

/**
 * Restaurant controller mirrors the classroom controller so both scenes share
 * the same progress tracking behavior.
 */
export class RestaurantMainController {
  private readonly model = new RestaurantMainModel();
  private readonly view = new RestaurantMainView();
  private readonly tracker: ProgressTracker;
  private readonly switchToClassroom?: () => void;
  private unsubscribeProgress?: () => void;

  constructor(tracker: ProgressTracker, switchToClassroom?: () => void) {
    this.tracker = tracker;
    this.switchToClassroom = switchToClassroom;
  }

  async start(): Promise<void> {
    await this.model.load_items("/ItemImage/Restaurant/items.json");
    const items = this.model.get_items();

    const ids = items.map((item) => `restaurant:${item.name}`);
    this.tracker.registerItems(ids);

    this.view.addItems(items, (name) => this.handleItemClick(name));
    this.view.setOnSwitchToClassroom(() => this.switchToClassroom?.());

    this.unsubscribeProgress = this.tracker.onChange(({ found, total }) => {
      this.view.updateProgress(found, total);
    });

    this.view.resetPanel();
  }

  getView(): RestaurantMainView {
    return this.view;
  }

  private handleItemClick(name: string): void {
    this.model.select_item(name);
    const selected = this.model.get_selected_item();
    if (!selected) {
      return;
    }
    this.tracker.markFound(`restaurant:${name}`);
    this.view.updatePanel(selected);
  }
}
