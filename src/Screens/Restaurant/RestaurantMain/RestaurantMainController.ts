import type { ScreenSwitcher } from "../../../types";
import { ScreenController } from "../../../types";
import { RestaurantMainModel } from './RestaurantMainModel';
import { RestaurantMainView } from './RestaurantMainView';

// export class RestaurantMainController extends ScreenController {
//   private model: RestaurantMainModel;
//   private view: StoreMainView;
//   private screenSwitcher: ScreenSwitcher;

//   constructor(screenSwitcher: ScreenSwitcher) {
//     private model: RestruantMainModel;
//     private view: StoreMainView;
//     super();
//     this.screenSwitcher = screenSwitcher;

//     this.model = new ResturantMainModel();

//     this.view = new ResturantMainView(
//       (itemName) => this.handleItemClick(itemName),
//       () => this.switchToRestaurant()
//     );
//   }
export class RestaurantMainController extends ScreenController {
  private model: RestaurantMainModel;
  private view: RestaurantMainView;
  private screenSwitcher: ScreenSwitcher;

  // constructor(screenSwitcher: ScreenSwitcher) {
  //   super();
  //   this.screenSwitcher = screenSwitcher;

  //   this.model = new RestaurantMainModel();

  //   this.view = new RestaurantMainView(
  //     (itemName) => this.handleItemClick(itemName),
  //     //this.view = new RestaurantMainView((itemName) => this.handleItemClick(itemName));
  //     () => this.screenSwitcher("RestaurantMain") 
      
  //   );

    constructor(screenSwitcher: ScreenSwitcher) {
      super();
      this.screenSwitcher = screenSwitcher;
  
      this.model = new RestaurantMainModel();
  
      this.view = new RestaurantMainView(
        (itemName) => this.handleItemClick(itemName),
       // () => this.switchToRestaurant()
      );
      this.start();
    }
  //async start(): Promise<void> {
  start(): void {
    this.model.load_items("/ItemImage/Restaurant/items.json");
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

  getView() : RestaurantMainView {
    return this.view;
  }

  //public initialize(): void {
  //  this.view.render();
  //}
}