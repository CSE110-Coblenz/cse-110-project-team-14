import Konva from "konva";
import { RestaurantMainController } from "./Screens/Restaurant/RestaurantMain/RestaurantMainController";
import { STAGE_WIDTH, STAGE_HEIGHT } from "./constants";
import { RestaurantAssessmentController } from "./Screens/Restaurant/RestaurantAssessment/RestaurantAssessmentController";
import { StoreMainController } from "./Screens/Store/StoreMain/StoreMainController";
import type { ScreenSwitcher, Screen } from "./types.ts";

class App implements ScreenSwitcher {
  private stage: Konva.Stage;
  private layer: Konva.Layer;

  private RestaurantController: RestaurantMainController;
  private RestaurantAssessment: RestaurantAssessmentController;

  constructor(container: string){
    this.stage = new Konva.Stage({
      container,
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
    });

    this.layer = new Konva.Layer();
    this.stage.add(this.layer);

    this.RestaurantController = new RestaurantMainController(this);
    this.RestaurantAssessment = new RestaurantAssessmentController(this);

    this.layer.add(this.RestaurantController.getView().getGroup());
    this.layer.add(this.RestaurantAssessment.getView().getGroup());

    this.RestaurantController.hide();
    this.RestaurantAssessment.hide();
  }

  async start(): Promise<void> {
    await this.RestaurantController.start();

    this.RestaurantController.show();
    this.layer.draw();
  }

  switchToScreen(screen: Screen): void {
    this.RestaurantController.hide();
    this.RestaurantAssessment.hide();

    switch(screen.type){
      case "Restaurant":
        this.RestaurantController.show();
        break;
      case "RestaurantAssessment":
        this.RestaurantAssessment.start();
        break;
    }
  }
}

const app = new App("container");
app.start();