import Konva from "konva";
import { STAGE_HEIGHT, STAGE_WIDTH } from "./constants";
import { ClassroomAssessmentController } from "./Screens/Classroom/ClassroomAssessment/ClassroomAssessmentController";
import { ClassroomMinigameController } from "./Screens/Classroom/ClassroomMinigame/ClassroomMinigameController";
import { RestaurantMainController } from "./Screens/Restaurant/RestaurantMain/RestaurantMainController";
import { StoreMainController } from "./Screens/Store/StoreMain/StoreMainController";
import type { Item } from "./types";
import { ProgressTracker } from "./utils/ProgressTracker";

async function main() {
  // --- Stage and Layer ---
  const stage = new Konva.Stage({
    container: "container",
    width: STAGE_WIDTH,
    height: STAGE_HEIGHT,
  });
  const layer = new Konva.Layer();
  stage.add(layer);

  const tracker = new ProgressTracker();

  // --- STORE ---
  const storeController = new StoreMainController({
    switchToScreen: (screen: string) => console.log("Switch screen skipped for test:", screen),
  } as any);
  await storeController.start();
  const storeGroup = storeController.getView().getGroup();
  layer.add(storeGroup);
  storeGroup.hide();

  // --- RESTAURANT ---
  const restaurantController = new RestaurantMainController(
    tracker,
    () => switchScene("classroom")
  );
  await restaurantController.start();
  const restaurantGroup = restaurantController.getView().getGroup();
  layer.add(restaurantGroup);
  restaurantGroup.hide();

  // --- CLASSROOM ---
  const classroomController = new ClassroomAssessmentController(
    stage,
    layer,
    tracker,
    () => switchScene("restaurant"),
    () => switchScene("minigame")
  );
  await classroomController.start();
  const classroomGroup = classroomController.getView().getGroup();
  layer.add(classroomGroup);
  classroomGroup.hide();

  // --- MINIGAME ---
  const minigameController = new ClassroomMinigameController(
    stage,
    layer,
    classroomController["model"].getItems() as Item[]
  );
  await minigameController.start();
  const minigameGroup = minigameController.getView().getGroup();
  layer.add(minigameGroup);
  minigameGroup.hide();

  layer.draw();

  // --- Scene Switcher ---
  function switchScene(target: "store" | "restaurant" | "classroom" | "minigame") {
    storeGroup.visible(target === "store");
    restaurantGroup.visible(target === "restaurant");
    classroomGroup.visible(target === "classroom");
    minigameGroup.visible(target === "minigame");
    layer.batchDraw();
  }

  // --- Start with STORE ---
  switchScene("classroom");
}

main().catch(err => console.error("Failed to start scenes:", err));
