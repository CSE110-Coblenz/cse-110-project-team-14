import type { Layer } from "konva/lib/Layer";
import type { Stage } from "konva/lib/Stage";
import type { Item } from "../../../types";
import { ClassroomMinigameModel } from "./ClassroomMinigameModel";
import { ClassroomMinigameView } from "./ClassroomMinigameView";

interface BasketData {
  name: string;       // French label
  imageSrc: string;
}

export class ClassroomMinigameController {
  private model: ClassroomMinigameModel;
  private view: ClassroomMinigameView;
  private baskets: BasketData[] = [
    { name: "Le crayon", imageSrc: "ItemImage/Classroom/basket.png" },
    { name: "La table", imageSrc: "ItemImage/Classroom/basket.png" },
    { name: "Le livre", imageSrc: "ItemImage/Classroom/basket.png" },
  ];
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
      this.baskets,
      (item, basketName) => this.handleItemDrop(item, basketName)
    );
    this.view.show();
  }

  private handleItemDrop(item: Item, basketName: string) {
    const correct = this.model.placeItemInBasket(item.name, basketName);

    // Visual feedback
    if (correct) {
      alert(`✅ Correct! ${item.french} goes in ${basketName}.`);
    } else {
      alert(`❌ Oops! ${item.french} doesn’t go in ${basketName}.`);
    }

    if (this.model.allItemsPlaced() && this.onComplete) {
      this.onComplete();
    }
  }

  setOnComplete(handler: () => void) {
    this.onComplete = handler;
  }
}
