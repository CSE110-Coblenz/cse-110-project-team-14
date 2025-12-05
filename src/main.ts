import Konva from "konva";
import { STAGE_HEIGHT, STAGE_WIDTH } from "./constants.js";
import type { Screen, ScreenSwitcher } from "./types";

// Controllers
import { ClassroomAssessmentController } from "./Screens/Classroom/ClassroomAssessment/ClassroomAssessmentController";
import { ClassroomMinigameController } from "./Screens/Classroom/ClassroomMinigame/ClassroomMinigameController";
import { ProgressTracker } from "./utils/ProgressTracker";
import { IntroScreenController } from "./Screens/Intro/IntroScreenController";
import { RestaurantAssessmentController } from "./Screens/Restaurant/RestaurantAssessment/RestaurantAssessmentController";
import { RestaurantMainController } from "./Screens/Restaurant/RestaurantMain/RestaurantMainController";
import { StoreMainController } from "./Screens/Store/StoreMain/StoreMainController";

export class App implements ScreenSwitcher {
  private stage: Konva.Stage;
  private layer: Konva.Layer;

  private introController: IntroScreenController;
  private storeController: StoreMainController;
  private restaurantController: RestaurantMainController;
  private restaurantAssessmentController: RestaurantAssessmentController;
  private classroomController: ClassroomAssessmentController;
  private minigameController: ClassroomMinigameController;
  private progressTracker: ProgressTracker;

  constructor(container: string) {
    this.stage = new Konva.Stage({
      container,
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
    });
    this.layer = new Konva.Layer();
    this.stage.add(this.layer);

    this.progressTracker = new ProgressTracker();

    // --- Initialize controllers ---
    this.introController = new IntroScreenController(this);
    this.storeController = new StoreMainController(this, this.progressTracker);
    this.restaurantController = new RestaurantMainController(
      this,
      this.progressTracker
    );
    this.restaurantAssessmentController = new RestaurantAssessmentController(
      this,
      this.progressTracker
    );
    this.classroomController = new ClassroomAssessmentController(
      this.stage,
      this.layer,
      this,
      this.progressTracker
    );
    this.minigameController = {} as ClassroomMinigameController; // placeholder, initialized after classroom items are loaded

    this.initScreens();
  }

  private async initScreens() {
    // --- Intro Screen ---
    this.layer.add(this.introController.getView().getGroup());
    await this.introController.start();
    this.introController
      .getView()
      .loadBackground("Public/Background/intro.webp");
    this.layer.draw();

    // --- Store ---
    await this.storeController.start();
    this.layer.add(this.storeController.getView().getGroup());
    this.storeController.hide();
    // --- Restaurant ---
    await this.restaurantController.start();
    this.layer.add(this.restaurantController.getView().getGroup());
    this.restaurantController.hide();
    // --- Restaurant Assessment ---
    await this.restaurantAssessmentController.start();
    this.layer.add(this.restaurantAssessmentController.getView().getGroup());
    this.restaurantAssessmentController.hide();
    // --- Classroom ---
    await this.classroomController.start();
    this.layer.add(this.classroomController.getView().getGroup());
    this.classroomController.hide();
    // --- Minigame (after classroom items loaded) ---
    const classroomItems = this.classroomController.getItems();
    this.minigameController = new ClassroomMinigameController(
      this.stage,
      this.layer,
      classroomItems,
      this,
      this.progressTracker
    );
    await this.minigameController.start();
    this.layer.add(this.minigameController.getView().getGroup());
    this.minigameController.hide();
    // --- Start with Intro Screen ---
    this.switchToScreen({ type: "Intro" });
    //this.layer.draw();
  }

  switchToScreen(screenName: Screen): void {
    // --- Hide all screens first ---
    this.introController.hide();
    this.storeController.hide();
    this.restaurantController.hide();
    this.restaurantAssessmentController.hide();
    this.classroomController.hide();
    this.minigameController.hide();

    // --- Show selected screen ---
    switch (screenName.type) {
      case "Intro":
        console.log("Showing intro screen");
        this.introController.show();
        break;
      case "Store":
        this.storeController.show();
        break;
      case "Restaurant":
        this.restaurantController.show();
        break;
      case "RestaurantAssessment":
        this.restaurantAssessmentController.show();
        break;
      case "Classroom":
        this.classroomController.show();
        break;
      case "ClassroomMinigame":
        this.minigameController.show();
        break;
    }
    this.layer.draw();
  }
}

// Launch the app
new App("container");
