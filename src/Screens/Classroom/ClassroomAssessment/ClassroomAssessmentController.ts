import type { Layer } from "konva/lib/Layer";
import type { Stage } from "konva/lib/Stage";
import type { Item } from "../../../types";
import { ProgressTracker } from "../../../utils/ProgressTracker";
import { ClassroomAssessmentModel } from "./ClassroomAssessmentModel";
import { ClassroomAssessmentView } from "./ClassroomAssessmentView";

/**
 * Controller: wires the classroom model and view together while sharing progress
 * with the rest of the app via ProgressTracker.
 */
export class ClassroomAssessmentController {
  private readonly model = new ClassroomAssessmentModel();
  private readonly view: ClassroomAssessmentView;
  private readonly tracker: ProgressTracker;
  private readonly switchToRestaurant?: () => void;
  private readonly switchToMinigame?: () => void;
  private unsubscribeProgress?: () => void;

  constructor(
    stage: Stage,
    layer: Layer,
    tracker: ProgressTracker,
    switchToRestaurant?: () => void
    , switchToMinigame?: () => void
  ) {
    this.view = new ClassroomAssessmentView(stage, layer);
    this.tracker = tracker;
    this.switchToRestaurant = switchToRestaurant;
    this.switchToMinigame = switchToMinigame;
  }

async start(): Promise<void> {
  await this.model.loadScene();
  const items = this.model.getItems();
  const person = this.model.getPerson();

  const ids = items.map((item) => `classroom:${item.name}`);
  this.tracker.registerItems(ids);

  this.view.renderScene(items, person, (item) => this.handleItemClick(item));

  // Existing handlers
  this.view.setOnSwitchToRestaurant(() => this.switchToRestaurant?.());
  this.view.setOnReset(() => this.handleReset());

  // --- New handler for minigame ---
  this.view.setOnSwitchToMinigame(() => this.switchToMinigame?.());
  // ----------------------------------

  this.unsubscribeProgress = this.tracker.onChange(({ found, total }) => {
    this.view.updateProgress(found, total);
  });

  this.view.resetPanel();
  this.view.show();
}

  getView(): ClassroomAssessmentView {
    return this.view;
  }

  private handleItemClick(item: Item): void {
    this.model.selectItem(item.name);
    const selected = this.model.getSelectedItem();
    if (!selected) {
      return;
    }

    this.tracker.markFound(`classroom:${item.name}`);
    this.view.updatePanel(selected);
  }

  private handleReset(): void {
    this.tracker.reset();
    this.view.resetPanel();
  }
}
