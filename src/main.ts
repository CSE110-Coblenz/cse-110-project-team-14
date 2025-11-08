import Konva from "konva";
import { ClassroomAssessmentController } from "./Screens/Classroom/ClassroomAssessment/ClassroomAssessmentController";
import { RestaurantMainController } from "./Screens/Restaurant/RestaurantMain/RestaurantMainController";
import { ProgressTracker } from "./utils/ProgressTracker";
import { STAGE_HEIGHT, STAGE_WIDTH } from "./constants";

async function main() {
  const stage = new Konva.Stage({
    container: "container",
    width: STAGE_WIDTH,
    height: STAGE_HEIGHT,
  });

  const layer = new Konva.Layer();
  stage.add(layer);

  const tracker = new ProgressTracker();

  const restaurantController = new RestaurantMainController(tracker, () =>
    switchScene("classroom")
  );
  await restaurantController.start();
  const restaurantGroup = restaurantController.getView().getGroup();
  restaurantGroup.visible(false);
  layer.add(restaurantGroup);

  const classroomController = new ClassroomAssessmentController(
    stage,
    layer,
    tracker,
    () => switchScene("restaurant")
  );
  await classroomController.start();
  const classroomGroup = classroomController.getView().getGroup();
  layer.add(classroomGroup);

  layer.draw();

  function switchScene(target: "classroom" | "restaurant"): void {
    const isClassroom = target === "classroom";
    classroomGroup.visible(isClassroom);
    restaurantGroup.visible(!isClassroom);
    layer.batchDraw();
  }
}

main().catch((error) => {
  console.error("Failed to bootstrap scenes:", error);
});
