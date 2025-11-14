import { StoreMainModel } from './StoreMainModel';
import { StoreMainView } from './StoreMainView';
import type {ScreenSwitcher} from "../../../types.ts";



import type { DialogueNode, Person } from "../../../types";

export class StoreMainController {

  private model: StoreMainModel;
  private view: StoreMainView;
  private screenSwitcher?: {ScreenSwitcher: (name: string) => void };

  constructor(screenSwitcher?: {ScreenSwitcher: (name: string) => void }) {
    this.screenSwitcher = screenSwitcher;
    this.model = new StoreMainModel();
    this.view = new StoreMainView((itemName) => this.handleItemClick(itemName));
  }

  async start(): Promise<void> {
    await this.model.load_items("/ItemImage/Store/items.json");
    const items = this.model.get_items();
    this.view.showItem(items, (itemName) => this.handleItemClick(itemName));
    this.view.showClerk("ItemImage/Store/cashier.png", 600, 175, 225, 300);

    this.view.show();
  }

  private handleItemClick(itemName: string) : void{
    this.model.select_item(itemName);
    const selected = this.model.get_selected_item();
    if(!selected){
      return;
    }
    this.view.updateDock(selected);

  }

  getView() : StoreMainView {
    return this.view;
  }

  //public initialize(): void {
  //  this.view.render();
  }