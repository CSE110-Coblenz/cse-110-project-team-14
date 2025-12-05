import type { ScreenSwitcher } from "../../../types";
import { ScreenController } from "../../../types";
import { StoreMainModel } from "./StoreMainModel";
import { StoreMainView } from "./StoreMainView";
import { ProgressTracker } from "../../../utils/ProgressTracker";

export class StoreMainController extends ScreenController {
  private model: StoreMainModel;
  private view: StoreMainView;
  private screenSwitcher: ScreenSwitcher;
  private tracker: ProgressTracker;

  constructor(screenSwitcher: ScreenSwitcher, tracker: ProgressTracker) {
    super();
    this.screenSwitcher = screenSwitcher;
    this.tracker = tracker;

    this.model = new StoreMainModel();

    this.view = new StoreMainView(
      (itemName) => this.handleItemClick(itemName),
      () => this.switchToRestaurant(),
      () => this.switchToIntro()
    );
  }

  // Show the store screen and load content
  async start(): Promise<void> {
    this.view.loadBackground("Public/Background/store.png");
    await this.model.load_items("/ItemImage/Store/items.json");
    const items = this.model.get_items();
    this.view.showItem(items, (itemName) => this.handleItemClick(itemName));
    this.view.showClerk("ItemImage/Store/cashier.png", 1000, 280, 300, 400);

    // load progress tracker, count items loaded
    const ids = items.map((item) => `store:${item.name}`);
    this.tracker.registerItems("storeItems", ids);

    this.view.show(); // Make store screen visible
  }

  // Handle item clicked and update dock
  private handleItemClick(itemName: string): void {
    this.model.select_item(itemName);
    const selected = this.model.get_selected_item();
    if (!selected) return;
    this.tracker.markFound("storeItems", `store:${itemName}`); // tracker marker
    this.view.updateDock(selected);
  }

  // Switch to restaurant screen
  private switchToRestaurant(): void {
    this.screenSwitcher.switchToScreen({ type: "Restaurant" });
  }

  private switchToIntro(): void {
    this.screenSwitcher.switchToScreen({ type: "Intro" });
  }

  /** Show/hide methods for screen management */
  show(): void {
    this.view.show();
  }

  hide(): void {
    this.view.hide();
  }

  getView(): StoreMainView {
    return this.view;
  }
}
