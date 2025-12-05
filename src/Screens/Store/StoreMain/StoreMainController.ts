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
  private unsubscribeProgress?: () => void;

  constructor(screenSwitcher: ScreenSwitcher, tracker: ProgressTracker) {
    super();
    this.screenSwitcher = screenSwitcher;
    this.tracker = tracker;

    this.model = new StoreMainModel();

    this.view = new StoreMainView(
      (itemName) => this.handleItemClick(itemName),
      () => this.switchToRestaurant()
    );
  }

  // Show the store screen and load content 
  async start(): Promise<void> {
    this.view.loadBackground("Public/Background/storeBackground.png");
    await this.model.load_items("/ItemImage/Store/items.json");
    const items = this.model.get_items();
    const ids = items.map((item) => `store:${item.name}`);
    this.tracker.registerItems(ids, "items");
    this.view.showItem(items, (itemName) => this.handleItemClick(itemName));
    this.view.showClerk("ItemImage/Store/cashier.png", 550, 225, 225, 300);
    this.unsubscribeProgress = this.tracker.onChange((counts) => {
      this.view.updateProgress(counts);
    });

    this.view.show();  // Make store screen visible
  }

  // Handle item clicked and update dock
  private handleItemClick(itemName: string): void {
    this.model.select_item(itemName);
    const selected = this.model.get_selected_item();
    if (!selected) return;
    this.tracker.markFound(`store:${itemName}`, "items");
    this.view.updateDock(selected);
  }

  // Switch to restaurant screen
  private switchToRestaurant(): void {
    this.screenSwitcher.switchToScreen({ type: "Restaurant" });
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
