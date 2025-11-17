// import Konva from "konva";
// import type { ScreenSwitcher, Screen } from "./types.ts";
// import { RestaurantMainController } from "./Screens/Restaurant/RestaurantMain/RestaurantMainController";
// import { StoreMainController } from "./Screens/Store/StoreMain/StoreMainController";
// import { STAGE_WIDTH, STAGE_HEIGHT } from "./constants";

// async function main() {
//   //class App implements ScreenSwitcher {
//   const stage = new Konva.Stage({
//     container: 'container',
//     width: 800,
//     height: 600
//   });

//   const layer = new Konva.Layer();
//   stage.add(layer);

//   // Create controller (dummy switcher)
//   const restaurantScreen = new RestaurantMainController({
//     switchToScreen: () => console.log("Screen switching skipped for test."),
//   } as any);
//   const storeScreen = new StoreMainController({
//     switchToScreen: () => console.log("Screen switching skipped for test."),
//   } as any);

//   await storeScreen.start();
//   await restaurantScreen.start();
  

//   // Add to stage
//   //layer.add(restaurantScreen.getView().getGroup());
//   layer.add(storeScreen.getView().getGroup());
//   layer.draw();

//   console.log("Restaurant loaded and drawn to Konva canvas (no HTML required).");
// }

// main();
import Konva from "konva";
import type { ScreenSwitcher, Screen } from "./types.ts";
import { RestaurantMainController } from "./Screens/Restaurant/RestaurantMain/RestaurantMainController";
import { StoreMainController } from "./Screens/Store/StoreMain/StoreMainController";
import { STAGE_WIDTH, STAGE_HEIGHT } from "./constants";

class App implements ScreenSwitcher {
  private stage: Konva.Stage;
  private layer: Konva.Layer;

  private storeController: StoreMainController;
  //private restaurantController: RestaurantMainController;

  constructor(container: string) {
    this.stage = new Konva.Stage({
      container,
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
    });

    this.layer = new Konva.Layer();
    this.stage.add(this.layer);

    // Initialize controllers
    this.storeController = new StoreMainController(this);
    //this.restaurantController = new RestaurantMainController(this);

    // Add screens' groups to the layer
    this.layer.add(this.storeController.getView().getGroup());
    //this.layer.add(this.restaurantController.getView().getGroup());

    // Initially hide all
    this.storeController.hide();
    //this.restaurantController.hide();
  }

  /** Start the application */
  async start(): Promise<void> {
    await this.storeController.start();
    //await this.restaurantController.start();

    // Show the store screen first (or change as needed)
    this.storeController.show();
    this.layer.draw();
  }

  /** Implement screen switching */
  switchToScreen(screen: Screen): void {
    // Hide all screens first
    this.storeController.hide();
    //this.restaurantController.hide();

    // Show the requested screen
    switch (screen.type) {
      case "Store":
        this.storeController.show();
        break;

      // case "Restaurant":
      //   this.restaurantController.show();
      //   break;

      default:
        console.warn("Unknown screen type:", screen.type);
    }

    // Redraw layer
    this.layer.draw();
  }
}

// Initialize the app
const app = new App("container");
app.start();
