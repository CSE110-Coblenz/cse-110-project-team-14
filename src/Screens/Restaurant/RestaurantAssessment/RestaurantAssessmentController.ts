import type { ScreenSwitcher } from "../../../types";
import { ScreenController } from "../../../types";
import { globals } from "../../../constants";
import { RestaurantAssessmentModel } from "./RestaurantAssessmentModel";
import { RestaurantAssessmentView } from "./RestaurantAssessmentView";

export class RestaurantAssessmentController extends ScreenController {
  private model = new RestaurantAssessmentModel();
  private view: RestaurantAssessmentView;
  private screenSwitcher: ScreenSwitcher;
  private typingBuffer = "";

  constructor(screenSwitcher: ScreenSwitcher) {
    super();
    this.screenSwitcher = screenSwitcher;

    this.view = new RestaurantAssessmentView(
      () => this.switchToRestaurant(),
      () => this.restart()
    );

    this.setupTyping();
  }

  async start(): Promise<void> {
    await this.model.load_questions("/ItemImage/Restaurant/questions.json");
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
      this.view.showResults(
        this.model.getCurrentScore(),
        this.model.getTotalCount(),
        this.model.getBestScore()
      );
      // Update global assessment score for this session
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        globals.progress.assessmentScore += this.model.getCurrentScore();
        globals.progress.assessmentTotal += this.model.getTotalCount();
      } catch (e) {
        // ignore if globals not available
      }
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
