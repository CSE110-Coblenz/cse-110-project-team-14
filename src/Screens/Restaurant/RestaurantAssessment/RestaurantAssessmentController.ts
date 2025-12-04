import { globals } from "../../../constants.js";
import { ScreenController } from "../../../types";
import type { ScreenSwitcher } from "../../../types.ts";
import { RestaurantAssessmentModel } from './RestaurantAssessmentModel';
import { RestaurantAssessmentView } from './RestaurantAssessmentView';

export class RestaurantAssessmentController extends ScreenController {
  private model: RestaurantAssessmentModel;
  private view: RestaurantAssessmentView;
  private screenSwitcher: ScreenSwitcher;
  private typingBuffer = "";

  constructor(screenSwitcher: ScreenSwitcher) {
    super();
    this.screenSwitcher = screenSwitcher;
    this.model = new RestaurantAssessmentModel();

    this.view = new RestaurantAssessmentView(
      () => this.switchToRestaurant(),
      () => this.switchToIntro()                     // NEW CONTINUE BUTTON
    );

    this.setupTypingHandler();
  }

  async start(): Promise<void> {
    await this.model.load_questions("/ItemImage/Restaurant/questions.json");
    this.view.show();
    this.showQuestionHandler();
  }

  private showQuestionHandler(): void {
    const problem = this.model.getCurrentQuestion();
    if (!problem) return;

    this.view.updateProgress(
      this.model.getIndex() + 1,
      this.model.getTotal(),
      this.model.getScore()
    );

    if (problem.type === "mcq") {
      this.view.showMCQ(problem, (picked) => this.handleMCQ(picked));
    } else {
      this.typingBuffer = "";
      this.view.showTyping(problem, this.typingBuffer);
    }
  }

  private handleMCQ(answerIndex: number): void {
    const correct = this.model.answerMC(answerIndex);
    this.updateProgress(correct);
  }

  private updateProgress(correct: boolean) {
    if (correct) globals.progress.assessmentScore++;

    this.view.showFeedback(correct);
    setTimeout(() => this.advance(), 1200);
  }

  private setupTypingHandler(): void {
    window.addEventListener("keydown", (e) => {
      const problem = this.model.getCurrentQuestion();
      if (!problem || problem.type !== "type") return;

      if (e.key === "Enter") {
        const correct = this.model.answerTyping(this.typingBuffer);
        this.updateProgress(correct);
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
      this.view.showResults(
        this.model.getScore(),
        this.model.getTotal()
      );
      return;
    }
    this.showQuestionHandler();
  }

  private switchToRestaurant(): void {
    this.screenSwitcher.switchToScreen({ type: "Restaurant" });
  }

  private switchToIntro(): void {         // NEW BUTTON CALLBACK
    this.screenSwitcher.switchToScreen({ type: "Intro" });
  }

  getView(): RestaurantAssessmentView { return this.view; }
  show(): void { this.view.show(); }
  hide(): void { this.view.hide(); }
}
