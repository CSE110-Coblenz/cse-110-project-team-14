import Konva from "konva";
import { RestaurantMainController } from "./Screens/Restaurant/RestaurantMain/RestaurantMainController.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "./constants.ts";

async function main() {
  const stage = new Konva.Stage({
    container: 'container',
    width: 800,
    height: 600
  });

  const layer = new Konva.Layer();
  stage.add(layer);

  // Create controller (dummy switcher)
  const restaurantScreen = new RestaurantMainController({
    switchToScreen: () => console.log("Screen switching skipped for test."),
  } as any);

  await restaurantScreen.start();

  // Add to stage
  layer.add(restaurantScreen.getView().getGroup());
  layer.draw();

  console.log("Restaurant loaded and drawn to Konva canvas (no HTML required).");
}

main();
