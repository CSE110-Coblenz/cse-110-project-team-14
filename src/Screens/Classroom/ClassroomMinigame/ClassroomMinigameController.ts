import type { Layer } from "konva/lib/Layer";
import type { Stage } from "konva/lib/Stage";
import type { Item } from "../../../types";
import { ClassroomMinigameModel } from "./ClassroomMinigameModel";
import { ClassroomMinigameView } from "./ClassroomMinigameView";

export class ClassroomMinigameController {
  private model: ClassroomMinigameModel;
  private view: ClassroomMinigameView;
  private basketNames = ["Basket A", "Basket B", "Basket C"];
  private onComplete?: () => void;

  constructor(stage: Stage, layer: Layer, items: Item[]) {
    this.model = new ClassroomMinigameModel(items);
    this.view = new ClassroomMinigameView(stage, layer);
  }

  getView(): ClassroomMinigameView {
    return this.view;
  }

  async start(): Promise<void> {
    await this.view.renderScene(
      this.model.getItems(),
      this.basketNames,
      (item) => this.handleItemDrop(item)
    );
    this.view.show();
  }

  private handleItemDrop(item: Item) {
    // For now, just mark item as placed
    this.model.selectItem(item.name);

    // Optionally, detect if all items placed and call onComplete
    const allPlaced = this.model.getItems().every(i => i.name === this.model.getSelectedItem()?.name);
    if (allPlaced && this.onComplete) this.onComplete();
  }

  setOnComplete(handler: () => void) {
    this.onComplete = handler;
  }
}
