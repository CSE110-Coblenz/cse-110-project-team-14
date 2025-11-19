import type { Layer } from "konva/lib/Layer";
import type { Stage } from "konva/lib/Stage";
import type { Item } from "../../../types";
import { ScreenController } from "../../../types";
import { ClassroomMinigameModel } from "./ClassroomMinigameModel";
import { ClassroomMinigameView } from "./ClassroomMinigameView";

interface BasketData {
  name: string;       // French label
  imageSrc: string;
}

export class ClassroomMinigameController extends ScreenController {
  private model: ClassroomMinigameModel;
  private view: ClassroomMinigameView;

  private baskets: BasketData[] = [
    { name: "Le crayon", imageSrc: "ItemImage/Classroom/basket.png" },
    { name: "La table", imageSrc: "ItemImage/Classroom/basket.png" },
    { name: "Le livre", imageSrc: "ItemImage/Classroom/basket.png" },
  ];

  private onComplete?: () => void;

  constructor(stage: Stage, layer: Layer, items: Item[]) {
    super();
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

  /** -----------------------------------------------------
   * DROPPING LOGIC — cleaned up & modular
   * ----------------------------------------------------- */
  private handleItemDrop(item: Item, basketName: string) {
    const isCorrect = this.model.placeItemInBasket(item.name, basketName);

    this.showFeedback(item, basketName, isCorrect);

    if (this.model.allItemsPlaced()) {
      this.finishGame();
    }
  }

  /** Creates nice fade-out popup instead of blocking alerts */
  private showFeedback(item: Item, basketName: string, correct: boolean) {
    const message = correct
      ? `✔ Correct! ${item.french} goes in ${basketName}.`
      : `✖ Oops! ${item.french} doesn’t go in ${basketName}.`;

    this.view.showFeedback(message, correct);
  }

  /** Called when all items placed */
  private finishGame() {
    if (this.onComplete) {
      this.onComplete();
    }
  }

  setOnComplete(handler: () => void) {
    this.onComplete = handler;
  }
}
