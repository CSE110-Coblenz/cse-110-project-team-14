import Konva from "konva";
import { STAGE_HEIGHT, STAGE_WIDTH } from "./constants";
import { ClassroomAssessmentController } from "./Screens/Classroom/ClassroomAssessment/ClassroomAssessmentController";
import { ClassroomMinigameController } from "./Screens/Classroom/ClassroomMinigame/ClassroomMinigameController";
import { RestaurantMainController } from "./Screens/Restaurant/RestaurantMain/RestaurantMainController";
import type { Item } from "./types";
import { ProgressTracker } from "./utils/ProgressTracker";

async function main() {
  const stage = new Konva.Stage({
    container: "container",
    width: STAGE_WIDTH,
    height: STAGE_HEIGHT,
  });

  const layer = new Konva.Layer();
  stage.add(layer);

  const tracker = new ProgressTracker();

  // ⬇️ RESTAURANT
  const restaurantController = new RestaurantMainController(
    tracker,
    () => switchScene("classroom")
  );
  await restaurantController.start();
  const restaurantGroup = restaurantController.getView().getGroup();
  restaurantGroup.hide();
  layer.add(restaurantGroup);

  // ⬇️ CLASSROOM
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

  // ⬇️ MINIGAME
  const minigameController = new ClassroomMinigameController(
    stage,
    layer,
    classroomController["model"].getItems() as Item[]
  );

  const minigameGroup = minigameController.getView().getGroup();
  layer.add(minigameGroup);
  await minigameController.start();
  minigameGroup.hide();

  layer.draw();

  function switchScene(target: "classroom" | "restaurant" | "minigame") {
    classroomGroup.visible(target === "classroom");
    restaurantGroup.visible(target === "restaurant");
    minigameGroup.visible(target === "minigame");
    layer.batchDraw();
  }
}

main().catch(err => console.error("Failed to start scenes:", err));
