import type { Layer } from "konva/lib/Layer";
import type { Stage } from "konva/lib/Stage";
import type { Item, ScreenSwitcher } from "../../../types";
import { ScreenController } from "../../../types";
import { ClassroomMinigameModel } from "./ClassroomMinigameModel";
import { ClassroomMinigameView } from "./ClassroomMinigameView";
import { ProgressTracker } from "../../../utils/ProgressTracker";

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
  private screenSwitcher: ScreenSwitcher;
  private tracker: ProgressTracker;
  private unsubscribeProgress?: () => void;

  constructor(
    stage: Stage,
    layer: Layer,
    items: Item[],
    screenSwitcher: ScreenSwitcher,
    tracker: ProgressTracker
  ) {
    super();
    this.screenSwitcher = screenSwitcher;
    this.tracker = tracker;
    this.model = new ClassroomMinigameModel(items);
    this.view = new ClassroomMinigameView(stage, layer);

    // Dynamically create baskets from items (one basket per item's French name)
    this.baskets = items.map(item => ({
      name: item.french,
      imageSrc: "ItemImage/Classroom/basket.png" // could be customized per item
    }));
    this.tracker.registerItems(["classroom:minigame"], "minigames");
  }

  /** Return the view for scene layering */
  getView(): ClassroomMinigameView {
    return this.view;
  }

  getItems(): Item[] {
    return this.model.getItems();
  }

  /** Start the minigame by rendering items and baskets */
  async start(): Promise<void> {
    await this.view.renderScene(
      this.model.getItems(),
      this.baskets,
      (item, basketName) => this.handleItemDrop(item, basketName)
    );
    this.unsubscribeProgress = this.tracker.onChange((counts) => {
      this.view.updateProgress(counts);
    });
    this.view.setOnExit(() => this.exitMinigame());
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
    this.tracker.markFound("classroom:minigame", "minigames");
    if (this.onComplete) this.onComplete();
  }

  private exitMinigame(): void {
    this.hide();
    this.screenSwitcher.switchToScreen({ type: "Classroom" });
  }

  /** Allow external code to attach a completion handler */
  setOnComplete(handler: () => void) {
    this.onComplete = handler;
  }
}
