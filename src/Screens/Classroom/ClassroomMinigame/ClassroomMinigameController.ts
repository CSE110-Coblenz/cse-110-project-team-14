import type { Layer } from "konva/lib/Layer";
import type { Stage } from "konva/lib/Stage";
import type { Item } from "../../../types";
import { ScreenController } from "../../../types";
import { ClassroomMinigameModel } from "./ClassroomMinigameModel";
import { ClassroomMinigameView } from "./ClassroomMinigameView";

/**
 * Represents a visual basket in the minigame.
 */
interface BasketData {
  name: string;       // French label or English name
  imageSrc: string;   // Basket image
}

/**
 * Controller for the Classroom Minigame.
 * - Manages interactions between the model and view
 * - Handles item drops, feedback, and game completion
 */
export class ClassroomMinigameController extends ScreenController {
  private model: ClassroomMinigameModel;
  private view: ClassroomMinigameView;
  private baskets: BasketData[] = [];  // dynamically generated from items
  private onComplete?: () => void;

  constructor(stage: Stage, layer: Layer, items: Item[]) {
    super();
    this.model = new ClassroomMinigameModel(items);
    this.view = new ClassroomMinigameView(stage, layer);

    // Dynamically create baskets from items (one basket per item's French name)
    this.baskets = items.map(item => ({
      name: item.french,
      imageSrc: "ItemImage/Classroom/basket.png" // could be customized per item
    }));
  }

  /** Return the view for scene layering */
  getView(): ClassroomMinigameView {
    return this.view;
  }

  /** Start the minigame by rendering items and baskets */
  async start(): Promise<void> {
    await this.view.renderScene(
      this.model.getItems(),
      this.baskets,
      (item, basketName) => this.handleItemDrop(item, basketName)
    );
    this.view.show();
  }

  /** Handle logic when an item is dropped onto a basket */
  private handleItemDrop(item: Item, basketName: string) {
    const isCorrect = this.model.placeItemInBasket(item.name, basketName);

    this.showFeedback(item, basketName, isCorrect);

    if (this.model.allItemsPlaced()) {
      this.finishGame();
    }
  }

  /** Show a floating feedback cloud with correctness info */
  private showFeedback(item: Item, basketName: string, correct: boolean) {
    const message = correct
      ? `✔ Correct! ${item.french} goes in ${basketName}.`
      : `✖ Oops! ${item.french} doesn’t go in ${basketName}.`;

    this.view.showFeedback(message, correct);
  }

  /** Trigger when all items have been placed correctly */
  private finishGame() {
    if (this.onComplete) this.onComplete();
  }

  /** Allow external code to attach a completion handler */
  setOnComplete(handler: () => void) {
    this.onComplete = handler;
  }
}
