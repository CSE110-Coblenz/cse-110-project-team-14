import { RestaurantMainModel } from './RestaurantMainModel';
import { RestaurantMainView } from './RestaurantMainView';
//import type {ScreenSwitcher} from "../../../types.ts";

export class RestaurantMainController {

  private model: RestaurantMainModel;
  private view: RestaurantMainView;
  private screenSwitcher?: {ScreenSwitcher: (name: string) => void };

  constructor(screenSwitcher?: {ScreenSwitcher: (name: string) => void }) {
    this.screenSwitcher = screenSwitcher;
    this.model = new RestaurantMainModel();
    this.view = new RestaurantMainView((itemName) => this.handleItemClick(itemName));
  }

  async start(): Promise<void> {
    await this.model.load_items("/ItemImage/Restaurant/items.json");
    const items = this.model.get_items();
    this.view.addItems(items, (itemName) => this.handleItemClick(itemName));
    this.view.show();
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

  getView() : RestaurantMainView {
    return this.view;
  }

  //public initialize(): void {
  //  this.view.render();
  //}
}
