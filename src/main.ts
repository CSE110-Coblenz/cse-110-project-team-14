import Konva from "konva";
import { STAGE_HEIGHT, STAGE_WIDTH } from "./constants";
import { ClassroomAssessmentController } from "./Screens/Classroom/ClassroomAssessment/ClassroomAssessmentController";
import { ClassroomMinigameController } from "./Screens/Classroom/ClassroomMinigame/ClassroomMinigameController";
import { RestaurantMainController } from "./Screens/Restaurant/RestaurantMain/RestaurantMainController";
import { StoreMainController } from "./Screens/Store/StoreMain/StoreMainController";
import { Screen, ScreenSwitcher } from "./types";
import { ProgressTracker } from "./utils/ProgressTracker";



class App implements ScreenSwitcher {
  private stage: Konva.Stage
  private layer: Konva.Layer
  private tracker: ProgressTracker
  private storeController: StoreMainController
  private restaurantController: RestaurantMainController
  private classroomController: ClassroomAssessmentController
  private minigameController: ClassroomMinigameController

  constructor(container: string) {
    this.stage = new Konva.Stage({
      container,
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
    });

    this.layer = new Konva.Layer();
    this.stage.add(this.layer);
    this.tracker = new ProgressTracker();

  //Initialize all screen controllers
  this.storeController = new StoreMainController(this);
  this.restaurantController = new RestaurantMainController(this);
  this.classroomController = new ClassroomAssessmentController(this);
  this.minigameController = new ClassroomMinigameController(this);

  this.la

}

	/**
	 * Switch to a different screen
	 *
	 * This method implements screen management by:
	 * 1. Hiding all screens (setting their Groups to invisible)
	 * 2. Showing only the requested screen
	 *
	 * This pattern ensures only one screen is visible at a time.
	 */
	switchToScreen(screenName: Screen): void {
		// Hide all screens first by setting their Groups to invisible
		this.minigameController.hide();
		this.classroomController.hide();
		this.restaurantController.hide();
    this.storeController.hide();

		// Show the requested screen based on the screen type
		switch (screen.type) {
			case "menu":
				this.menuController.show();
				break;

			case "game":
				// Start the game (which also shows the game screen)
				this.gameController.startGame();
				break;

			case "result":
				// Show results with the final score
				this.resultsController.showResults(screen.score);
				break;
		}
	}
}


new App("container");







// async function main() {
//   // --- Stage and Layer ---
//   const stage = new Konva.Stage({
//     container: "container",
//     width: STAGE_WIDTH,
//     height: STAGE_HEIGHT,
//   });
//   const layer = new Konva.Layer();
//   stage.add(layer);

//   const tracker = new ProgressTracker();

//   // --- STORE ---
//   const storeController = new StoreMainController({
//     switchToScreen: (screen: string) => console.log("Switch screen skipped for test:", screen),
//   } as any);
//   await storeController.start();
//   const storeGroup = storeController.getView().getGroup();
//   layer.add(storeGroup);
//   storeGroup.hide();

//   // --- RESTAURANT ---
//   const restaurantController = new RestaurantMainController(
//     tracker,
//     () => switchScene("classroom")
//   );
//   await restaurantController.start();
//   const restaurantGroup = restaurantController.getView().getGroup();
//   layer.add(restaurantGroup);
//   restaurantGroup.hide();

//   // --- CLASSROOM ---
//   const classroomController = new ClassroomAssessmentController(
//     stage,
//     layer,
//     tracker,
//     () => switchScene("restaurant"),
//     () => switchScene("minigame")
//   );
//   await classroomController.start();
//   const classroomGroup = classroomController.getView().getGroup();
//   layer.add(classroomGroup);
//   classroomGroup.hide();

//   // --- MINIGAME ---
//   const minigameController = new ClassroomMinigameController(
//     stage,
//     layer,
//     classroomController["model"].getItems() as Item[]
//   );
//   await minigameController.start();
//   const minigameGroup = minigameController.getView().getGroup();
//   layer.add(minigameGroup);
//   minigameGroup.hide();

//   layer.draw();

//   // --- Scene Switcher ---
//   function switchScene(target: "store" | "restaurant" | "classroom" | "minigame" | "assessment") {
//     storeGroup.visible(target === "store");
//     restaurantGroup.visible(target === "restaurant");
//     classroomGroup.visible(target === "classroom");
//     minigameGroup.visible(target === "minigame");
//     layer.batchDraw();
//   }

//   // --- Start with STORE ---
//   switchScene("classroom");
// }

// main().catch(err => console.error("Failed to start scenes:", err));
