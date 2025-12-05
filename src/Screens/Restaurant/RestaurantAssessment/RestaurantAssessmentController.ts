import type { ScreenSwitcher } from "../../../types";
import { ScreenController } from "../../../types";
import { RestaurantAssessmentModel } from "./RestaurantAssessmentModel";
import { RestaurantAssessmentView } from "./RestaurantAssessmentView";
import { ProgressTracker } from "../../../utils/ProgressTracker";

export class RestaurantAssessmentController extends ScreenController {
  private model = new RestaurantAssessmentModel();
  private view: RestaurantAssessmentView;
  private screenSwitcher: ScreenSwitcher;
  private typingBuffer = "";
  private tracker: ProgressTracker;
  private assessmentRegistered = false;
  private unsubscribeProgress?: () => void;

  constructor(screenSwitcher: ScreenSwitcher, tracker: ProgressTracker) {
    super();
    this.screenSwitcher = screenSwitcher;
    this.tracker = tracker;

    this.view = new RestaurantAssessmentView(
      () => this.switchToRestaurant(),
      () => this.restart()
    );

    this.unsubscribeProgress = this.tracker.onChange((counts) => {
      this.view.updateTotalProgress(counts.total.found, counts.total.total);
    });

    this.setupTyping();
  }

  async start(): Promise<void> {
    await this.model.load_questions("/ItemImage/Restaurant/questions.json");
    if (!this.assessmentRegistered) {
      this.tracker.registerItems("assessments", ["restaurant:assessment"]);
      this.assessmentRegistered = true;
    }
    this.showQuestionHandler();
    this.view.show();
  }

  private showQuestionHandler(): void {
    const problem = this.model.getCurrentQuestion();
    if (!problem) return;

    const score = this.model.getCurrentScore();
    const total = this.model.getTotalCount();

    if (problem.type === "mcq") {
      this.view.showMCQ(problem, score, total, (choice) =>
        this.handleMCQ(choice)
      );
    } else {
      this.typingBuffer = "";
      this.view.showTyping(problem, this.typingBuffer, score, total);
    }
  }

  private handleMCQ(choice: number): void {
    const correct = this.model.answerMC(choice);
    this.view.showFeedback(correct);
    setTimeout(() => this.advance(), 1200);
  }

  private setupTyping(): void {
    window.addEventListener("keydown", (e) => {
      const q = this.model.getCurrentQuestion();
      if (!q || q.type !== "type") return;

      if (e.key === "Enter") {
        const correct = this.model.answerTyping(this.typingBuffer);
        this.view.showFeedback(correct);
        setTimeout(() => this.advance(), 1200);
        return;
      }

      if (e.key === "Backspace") {
        this.typingBuffer = this.typingBuffer.slice(0, -1);
      } else if (e.key.length === 1) {
        this.typingBuffer += e.key;
      }

      this.view.updateTypingText(this.typingBuffer);
    });
  }

  private advance(): void {
    this.model.next();

    if (this.model.isFinished()) {
      this.model.updateBestScore();
      this.tracker.markFound("assessments", "restaurant:assessment");
      this.view.showResults(
        this.model.getCurrentScore(),
        this.model.getTotalCount(),
        this.model.getBestScore()
      );
      return;
    }

    this.showQuestionHandler();
  }

  private switchToRestaurant(): void {
    this.screenSwitcher.switchToScreen({ type: "Restaurant" });
  }

  restart(): void {
    this.model.reset();
    this.start(); // reloads questions & starts again
  }

  getView() {
    return this.view;
  }
}
