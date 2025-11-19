
import { StoreMainModel } from './StoreMainModel';
import { StoreMainView } from './StoreMainView';
import { ScreenController } from "../../../types";
import type { ScreenSwitcher } from "../../../types";
import type { Item } from "../../../types"; 

export class StoreMainController extends ScreenController {
  private model: StoreMainModel;
  private view: StoreMainView;
  private screenSwitcher: ScreenSwitcher;

  constructor(screenSwitcher: ScreenSwitcher) {
    super();
    this.screenSwitcher = screenSwitcher;

    this.model = new StoreMainModel();

    // Pass callbacks: item click and start/restaurant button click
    this.view = new StoreMainView(
      (itemName) => this.handleItemClick(itemName),
      () => this.switchToRestaurant()
    );
  }

  /** Show the store screen and load content */
  async start(): Promise<void> {
    this.view.loadBackground("Public/Background/storeBackground.png");
    await this.model.load_items("/ItemImage/Store/items.json");
    const items = this.model.get_items();
    this.view.showItem(items, (itemName) => this.handleItemClick(itemName));
    this.view.showClerk("ItemImage/Store/cashier.png", 550, 225, 225, 300);
    
    this.view.show();  // Make store screen visible
  }
  

  /** Handle item click: update dock display */
  private handleItemClick(itemName: string): void {
    this.model.select_item(itemName);
    const selected = this.model.get_selected_item();
    if (!selected) return;
    this.view.updateDock(selected);
  }

  /** Switch to another screen using ScreenSwitcher */
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

  // public initialize(): void {
  //  this.view.render();
}

