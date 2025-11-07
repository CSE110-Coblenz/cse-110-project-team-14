import Konva from "konva";
import { StoreMainController } from "./Screens/Store/StoreMain/StoreMainController";
import { STAGE_WIDTH, STAGE_HEIGHT } from "./constants";

async function main() {
  const stage = new Konva.Stage({
    container: 'container',
    width: 800,
    height: 600
  });

  const layer = new Konva.Layer();
  stage.add(layer);

  // Create controller (dummy switcher)
  const storeScreen = new StoreMainController({
    switchToScreen: () => console.log("Screen switching skipped for test."),
  } as any);

  await storeScreen.start();

  // Add to stage
  layer.add(storeScreen.getView().getGroup());
  layer.draw();

  console.log("Store loaded and drawn to Konva canvas (no HTML required).");
}

main();