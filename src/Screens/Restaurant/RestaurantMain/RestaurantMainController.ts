import type { ScreenSwitcher } from "../../../types";
import { ScreenController } from "../../../types";
import { RestaurantMainModel } from './RestaurantMainModel';
import { RestaurantMainView } from './RestaurantMainView';

export class RestaurantMainController extends ScreenController {
  private model: RestaurantMainModel;
  private view: RestaurantMainView;
  private screenSwitcher: ScreenSwitcher;

  constructor(screenSwitcher: ScreenSwitcher) {
    super();
    this.screenSwitcher = screenSwitcher;
    this.model = new RestaurantMainModel();

    // Pass THREE callbacks now:
    // 1) Item click -> update dock vocab
    // 2) Assessment click -> go to assessment
    // 3) Back click -> go to Intro
    this.view = new RestaurantMainView(
      (itemName) => this.handleItemClick(itemName),
      () => this.switchToAssessment(),
      () => this.switchToIntro()         // <-- NEW BACK ACTION
    );
  }

  async start(): Promise<void> {
    await this.model.load_items("/ItemImage/Restaurant/items.json");
    const items = this.model.get_items();
    this.view.addItems(items, (itemName) => this.handleItemClick(itemName));
  }

  private handleItemClick(itemName: string): void {
    this.model.select_item(itemName);
    const selected = this.model.get_selected_item();
    if (!selected) return;
    this.view.updateDock(selected);
  }

  private switchToAssessment(): void {
    this.screenSwitcher.switchToScreen({ type: "RestaurantAssessment" });
  }

  // NEW — Return to intro screen
  private switchToIntro(): void {
    this.screenSwitcher.switchToScreen({ type: "Intro" });
  }

  getView(): RestaurantMainView {
    return this.view;
  }

  show(): void {
    this.view.show();
  }

  hide(): void {
    this.view.hide();
  }
}
