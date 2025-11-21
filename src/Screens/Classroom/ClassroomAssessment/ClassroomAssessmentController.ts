import type { Item } from "../../../types";
import { ScreenController, ScreenSwitcher } from "../../../types";
import { ProgressTracker } from "../../../utils/ProgressTracker";
import { ClassroomAssessmentModel } from "./ClassroomAssessmentModel";
import { ClassroomAssessmentView } from "./ClassroomAssessmentView";
import Konva from "konva";

/**
 * Controller: connects model ↔ view and communicates progress
 * with other game areas using a shared ScreenSwitcher.
 */
export class ClassroomAssessmentController extends ScreenController {
  private readonly model: ClassroomAssessmentModel;
  private readonly view: ClassroomAssessmentView;
  private readonly tracker: ProgressTracker;
  private readonly screenSwitcher: ScreenSwitcher;
  private unsubscribeProgress?: () => void;

  constructor(stage: Konva.Stage, layer: Konva.Layer, screenSwitcher: ScreenSwitcher) {
    super();
    this.screenSwitcher = screenSwitcher;

    this.model = new ClassroomAssessmentModel();
    this.view = new ClassroomAssessmentView(stage, layer); // <-- pass stage + layer
    this.tracker = new ProgressTracker();
  }

  /**
   * Start the scene: load assets, connect click handlers, show UI
   */
  async start(): Promise<void> {
    await this.model.loadScene();

    const items = this.model.getItems();
    const person = this.model.getPerson();

    // Register progress IDs (classroom:itemname)
    const ids = items.map((item) => `classroom:${item.name}`);
    this.tracker.registerItems(ids);

    // Render scene into View
    this.view.renderScene(items, person, (item) => this.handleItemClick(item));

    // Wire top buttons
    this.view.setOnSwitchToRestaurant(() => this.screenSwitcher.switchToScreen({ type: "Restaurant" }));
    this.view.setOnReset(() => this.handleReset());
    this.view.setOnSwitchToMinigame(() => this.screenSwitcher.switchToScreen({ type: "ClassroomMinigame" }));

    // Update progress text whenever tracker changes
    this.unsubscribeProgress = this.tracker.onChange(({ found, total }) => {
      this.view.updateProgress(found, total);
    });

    // Initialize panel
    this.view.resetPanel();

    // Finally show the view
    this.view.show();
  }

  /**
   * Expose the view to parent controller (scene manager)
   */
  getView(): ClassroomAssessmentView {
    return this.view;
  }

  /**
   * When an item is tapped
   */
  private handleItemClick(item: Item): void {
    this.model.selectItem(item.name);
    const selected = this.model.getSelectedItem();
    if (!selected) return;

    // mark as found
    this.tracker.markFound(`classroom:${item.name}`);

    // update info panel
    this.view.updatePanel(selected);
  }

  getItems(): Item[] {
    return this.model.getItems();
  }

  /**
   * Reset room progress
   */
  private handleReset(): void {
    this.tracker.reset();
    this.view.resetPanel();
  }
}
