import Konva from "konva";
import { ClassroomAssessmentController } from "./Screens/Classroom/ClassroomAssessment/ClassroomAssessmentController";
import { ClassroomMinigameController } from "./Screens/Classroom/ClassroomMinigame/ClassroomMinigameController";
import { RestaurantMainController } from "./Screens/Restaurant/RestaurantMain/RestaurantMainController";
import { StoreMainController } from "./Screens/Store/StoreMain/StoreMainController";
import { STAGE_HEIGHT, STAGE_WIDTH } from "./constants.js";
import type { Screen, ScreenSwitcher } from "./types";

class App implements ScreenSwitcher {
  private stage: Konva.Stage;
  private layer: Konva.Layer;

  private storeController: StoreMainController;
  private restaurantController: RestaurantMainController;
  private classroomController: ClassroomAssessmentController;
  private minigameController: ClassroomMinigameController;

  constructor(container: string) {
    this.stage = new Konva.Stage({
      container,
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
    });

    this.layer = new Konva.Layer();
    this.stage.add(this.layer);

    // --- Initialize non-minigame controllers first ---
    this.storeController = new StoreMainController(this);
    this.restaurantController = new RestaurantMainController(this);
    this.classroomController = new ClassroomAssessmentController(
      this.stage,
      this.layer,
      this
    );
    this.minigameController = {} as ClassroomMinigameController; // placeholder

    this.initScreens();
  }

  private async initScreens() {
    // --- Start Store ---
    await this.storeController.start();
    this.layer.add(this.storeController.getView().getGroup());

    // --- Start Restaurant ---
    await this.restaurantController.start();
    this.layer.add(this.restaurantController.getView().getGroup());

    // --- Start Classroom ---
    await this.classroomController.start();
    this.layer.add(this.classroomController.getView().getGroup());

    // --- Initialize Minigame AFTER classroom items are loaded ---
    const classroomItems = this.classroomController.getItems(); // public getter
    this.minigameController = new ClassroomMinigameController(
      this.stage,
      this.layer,
      classroomItems
    );
    await this.minigameController.start();
    this.layer.add(this.minigameController.getView().getGroup());

    // --- Start with default screen ---
    this.switchToScreen({ type: "Store" });

    // Draw layer
    this.layer.draw();
  }

  switchToScreen(screenName: Screen): void {
    // --- Hide all screens first ---
    this.storeController.hide();
    this.restaurantController.hide();
    this.classroomController.hide();
    this.minigameController.hide();

    // --- Show selected screen ---
    switch (screenName.type) {
      case "Store":
        this.storeController.show();
        break;
      case "Restaurant":
        this.restaurantController.show();
        break;
      case "Classroom":
        this.classroomController.show();
        break;
      case "ClassroomMinigame":
        this.minigameController.show();
        break;
    }
  }
}

// Launch the app
new App("container");
