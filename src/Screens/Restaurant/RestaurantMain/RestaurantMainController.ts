import { RestaurantMainModel } from './RestaurantMainModel';
import { RestaurantMainView } from './RestaurantMainView';
import type {ScreenSwitcher} from "../../../types.ts";
import { ScreenController } from "../../../types";

// export class RestaurantMainController extends ScreenController {
export class RestaurantMainController extends ScreenController {
  private model: RestaurantMainModel;
  private view: RestaurantMainView;
  private screenSwitcher: ScreenSwitcher;

  constructor(screenSwitcher: ScreenSwitcher) {
    super();
    this.screenSwitcher = screenSwitcher;
    this.model = new RestaurantMainModel();
    this.view = new RestaurantMainView(
      (itemName) => this.handleItemClick(itemName), 
      () => this.switchToAssessment()
    );
  }

  //Load background and items
  async start(): Promise<void> {
    await this.model.load_items("/ItemImage/Restaurant/items.json");
    const items = this.model.get_items();
    this.view.addItems(items, (itemName) => this.handleItemClick(itemName));
    //this.view.show();
  }

  //Interaction between clicking item and updating dock
  private handleItemClick(itemName: string) : void{
    this.model.select_item(itemName);
    const selected = this.model.get_selected_item();
    if(!selected){
      return;
    }
    this.view.updateDock(selected);

  }
  private switchToRestaurant(): void {
    this.screenSwitcher.switchToScreen({ type: "Restaurant" });
  }

  private switchToAssessment(): void{
    this.screenSwitcher.switchToScreen({type: "RestaurantAssessment"});
  }

  getView() : RestaurantMainView {
    return this.view;
  }

  show(): void{
    this.view.show();
  }

  hide(): void{
    this.view.hide();
  }

}