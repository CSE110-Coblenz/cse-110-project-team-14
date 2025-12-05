import type { Layer } from "konva/lib/Layer";
import type { Stage } from "konva/lib/Stage";
import type { Item, ScreenSwitcher } from "../../../types";
import { ScreenController } from "../../../types";
import { globals } from "../../../constants";
import { ClassroomMinigameModel } from "./ClassroomMinigameModel";
import { ClassroomMinigameView } from "./ClassroomMinigameView";
import { ProgressTracker } from "../../../utils/ProgressTracker";

/**
 * Controller for the Classroom Minigame.
 */
interface BasketData {
  name: string;
  imageSrc: string;
}

export class ClassroomMinigameController extends ScreenController {
  private model: ClassroomMinigameModel;
  private view: ClassroomMinigameView;
  private baskets: BasketData[] = [];
  private screenSwitcher: ScreenSwitcher;
  private tracker: ProgressTracker;
  private minigameMarked = false;
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

    // one basket per unique French word
    const uniqueFrench = Array.from(new Set(items.map((i) => i.french)));
    this.baskets = uniqueFrench.map((fr) => ({
      name: fr,
      imageSrc: "ItemImage/Classroom/basket.png",
    }));

    this.tracker.registerItems("minigame", ["classroom:minigame"]);

    // wire back button
    this.view.setOnBackToClassroom(() => {
      this.model.reset();
      this.screenSwitcher.switchToScreen({ type: "Classroom" });
    });

    this.view.setOnResetGame(() => this.resetGame());

    this.unsubscribeProgress = this.tracker.onChange((counts) => {
      this.view.updateTotalProgress(counts.total.found, counts.total.total);
    });
  }

  private async resetGame(): Promise<void> {
    this.model.reset();
    await this.view.renderScene(
      this.model.getItems(),
      this.baskets,
      (item, basketName) => this.handleItemDrop(item, basketName)
    );
  }

  getView(): ClassroomMinigameView {
    return this.view;
  }

  getItems(): Item[] {
    return this.model.getItems();
  }

  async start(): Promise<void> {
    await this.view.renderScene(
      this.model.getItems(),
      this.baskets,
      (item, basketName) => this.handleItemDrop(item, basketName)
    );
    this.view.show();
  }

  private handleItemDrop(item: Item, basketName: string): void {
    this.model.placeItem(item.name, basketName);

    if (this.model.allItemsPlaced()) {
      this.markMinigameComplete();
      const correct = this.model.getCorrectCount();
      const total = this.model.getTotal();
      this.view.showFinalResult(correct, total);
      // Update global minigame score
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        globals.progress.minigameScore += correct;
        globals.progress.minigameTotal += total;
      } catch (e) {
        // ignore if globals not available in this module
      }
    }
  }

  hide(): void {
    this.view.hide();
  }

  show(): void {
    this.view.show();
  }

  private markMinigameComplete(): void {
    if (this.minigameMarked) return;
    this.minigameMarked = true;
    this.tracker.markFound("minigame", "classroom:minigame");
  }
}
