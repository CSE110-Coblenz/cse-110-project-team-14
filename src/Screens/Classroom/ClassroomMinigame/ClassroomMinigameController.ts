import type { Layer, Stage } from "konva";
import type { Item } from "../../../types";
import { ClassroomMinigameModel } from "./ClassroomMinigameModel";
import { BasketData, ClassroomMinigameView } from "./ClassroomMinigameView";

export class ClassroomMinigameController {
  private model: ClassroomMinigameModel;
  private view: ClassroomMinigameView;
  private baskets: BasketData[] = [
    { name: "Le Crayon", imageSrc: "/ItemImage/Classroom/basket.png" },
    { name: "Le Livre", imageSrc: "/ItemImage/Classroom/basket.png" },
    { name: "La Table", imageSrc: "/ItemImage/Classroom/basket.png" },
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

    if (correct) {
      alert(`Correct! ${item.french} goes in ${basketName}.`);
    } else {
      alert(`Oops! ${item.french} doesn’t go in ${basketName}. Try again.`);
    }

    const allPlaced = this.model.getItems().every((i) => i.placed);
    if (allPlaced && this.onComplete) this.onComplete();
  }

  setOnComplete(handler: () => void) {
    this.onComplete = handler;
  }
}
