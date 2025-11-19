import Konva from "konva";
import type {MCProblem, TypingProblem} from '../../../types';
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../../constants";

/**
 * Renders the Restaurant Assessment UI w/ Konva
 */
export class RestaurantAssessmentView {
  private group: Konva.Group = new Konva.Group({ visible: false });
  private typingTest?: Konva.Text;

  constructor() {
    // Background
    const background = new Konva.Rect({
      x: 0,
      y: 0,
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
      fill: '#f7f3e9',
    });
    this.group.add(background);
  }

  showMCQ(problem: MCProblem, callback: (pickedIndex: number) => void): void {
    this.clear();

    const question = new Konva.Text({
      x: 50,
      y: 100,
      text: problem.question,
      fontSize: 30,
      fill: "black",
    });
    this.group.add(question);

    problem.options.forEach((opt, i) => {
      const optBackground = new Konva.Rect({
        x: 80,
        y: 200 + i * 80,
        width: 600,
        height: 60,
        fill: "#d8c5c5ff",
        cornerRadius: 10,
        stroke: "black",
      });

      const text = new Konva.Text({
        x: 100,
        y: 220 + i * 80,
        text: opt,
        fontSize: 24,
      });

      optBackground.on("click", () => callback(i));
      text.on("click", () => callback(i));

      this.group.add(optBackground);
      this.group.add(text);
    });

    this.group.getLayer()?.draw();
  }

  showTyping(problem: TypingProblem, typed: string): void {
    this.clear();

    const problemText = new Konva.Text({
      x: 50,
      y: 100,
      text: problem.question,
      fontSize: 30,
      fill: "black",
    });
    this.group.add(problemText);

    this.typingTest = new Konva.Text({
      x: 50,
      y: 200,
      text: typed,
      fontSize: 28,
      fill: "blue",
    });
    this.group.add(this.typingTest);

    this.group.getLayer()?.draw();
  }

  updateTypingText(typed: string): void {
    if (this.typingTest) {
      this.typingTest.text(typed);
      this.group.getLayer()?.draw();
    }
  }

  showFeedback(correct: boolean): void {
    this.clear();
    const text = new Konva.Text({
      x: 50,
      y: 200,
      text: correct ? "Correct!" : "Wrong!",
      fontSize: 40,
      fill: correct ? "green" : "red",
    });
    this.group.add(text);
    this.group.getLayer()?.draw();
  }

  showResults(score: number, total: number): void {
    this.clear();
    const text = new Konva.Text({
      x: 50,
      y: 200,
      text: `Final Score: ${score} / ${total}`,
      fontSize: 40,
      fill: "black",
    });
    this.group.add(text);
    this.group.getLayer()?.draw();
  }

  show(): void {
    this.group.visible(true);
  }

  hide(): void {
    this.group.visible(false);
  }

  getGroup(): Konva.Group {
    return this.group;
  }

  clear(): void {
    this.group.destroyChildren();
    this.group.getLayer()?.draw();
  }

  
}
