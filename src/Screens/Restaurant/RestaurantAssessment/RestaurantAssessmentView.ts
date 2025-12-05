import Konva from "konva";
import { STAGE_HEIGHT, STAGE_WIDTH } from "../../../constants";
import type { MCProblem, TypingProblem } from "../../../types";

export class RestaurantAssessmentView {
  private group: Konva.Group = new Konva.Group({ visible: false });
  private typingText?: Konva.Text;
  private scoreText?: Konva.Text;
  private onRestaurant: () => void;
  private onRestart: () => void;

  constructor(onRestaurant: () => void, onRestart: () => void) {
    this.onRestaurant = onRestaurant;
    this.onRestart = onRestart;

    const bg = new Konva.Rect({
      x: 0,
      y: 0,
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
      fill: "#FFF8EB",
    });
    this.group.add(bg);
  }

  // ----------------- QUESTION SCREENS --------------------

  showMCQ(
    problem: MCProblem,
    score: number,
    total: number,
    callback: (pickedIndex: number) => void
  ): void {
    this.clear();

    this.addScore(score, total);

    const question = new Konva.Text({
      x: 60,
      y: 120,
      text: problem.question,
      fontSize: 32,
      fill: "#1a1a1a",
      width: STAGE_WIDTH - 120,
    });
    this.group.add(question);

    problem.options.forEach((opt, i) => {
      const btn = this.makeButton(80, 240 + i * 90, 700, 70, opt, "#DCE5F2");
      btn.rect.on("click", () => callback(i));
      btn.text.on("click", () => callback(i));
    });

    this.group.getLayer()?.draw();
  }

  showTyping(
    problem: TypingProblem,
    typed: string,
    score: number,
    total: number
  ): void {
    this.clear();

    this.addScore(score, total);

    const q = new Konva.Text({
      x: 60,
      y: 120,
      text: problem.question,
      fontSize: 32,
      fill: "#1a1a1a",
      width: STAGE_WIDTH - 120,
    });
    this.group.add(q);

    this.typingText = new Konva.Text({
      x: 60,
      y: 240,
      text: typed,
      fontSize: 32,
      fill: "#004AAD",
    });
    this.group.add(this.typingText);

    this.group.getLayer()?.draw();
  }

  updateTypingText(text: string): void {
    if (this.typingText) {
      this.typingText.text(text);
      this.group.getLayer()?.draw();
    }
  }

  showFeedback(correct: boolean): void {
    this.clear();
    const msg = new Konva.Text({
      x: 60,
      y: 240,
      text: correct ? "Correct!" : "Wrong!",
      fontSize: 46,
      fill: correct ? "#20A020" : "#D02020",
    });
    this.group.add(msg);
  }

  // ----------------- RESULTS SCREEN --------------------

  showResults(score: number, total: number, best: number): void {
    this.clear();

    const title = new Konva.Text({
      x: 60,
      y: 160,
      text: `Final Score: ${score} / ${total}`,
      fontSize: 46,
      fill: "#000",
    });
    this.group.add(title);

    const bestScore = new Konva.Text({
      x: 60,
      y: 240,
      text: `Best Score: ${best} / ${total}`,
      fontSize: 40,
      fill: "#444",
    });
    this.group.add(bestScore);

    // Buttons positioned below score
    this.makeCenterButton(
      STAGE_HEIGHT - 220,
      "Retry Assessment",
      "#1D4ED8",
      this.onRestart
    );

    this.makeCenterButton(
      STAGE_HEIGHT - 140,
      "Continue Learning",
      "#22A853",
      this.onRestaurant
    );

    this.group.getLayer()?.draw();
  }

  // ----------------- UI Helpers --------------------

  private addScore(score: number, total: number) {
    this.scoreText = new Konva.Text({
      x: STAGE_WIDTH - 260,
      y: 40,
      text: `Score: ${score} / ${total}`,
      fontSize: 26,
      fill: "#0F172A",
    });
    this.group.add(this.scoreText);
  }

  private makeButton(x: number, y: number, w: number, h: number, txt: string, color: string) {
    const rect = new Konva.Rect({
      x,
      y,
      width: w,
      height: h,
      fill: color,
      cornerRadius: 12,
      stroke: "#222",
      strokeWidth: 2,
    });

    const text = new Konva.Text({
      x,
      y: y + 18,
      width: w,
      align: "center",
      text: txt,
      fontSize: 24,
      fontFamily: "Arial",
      fill: "#111",
    });

    this.group.add(rect, text);
    return { rect, text };
  }

  private makeCenterButton(y: number, txt: string, color: string, cb: () => void) {
    const w = 300;
    const h = 60;
    const x = (STAGE_WIDTH - w) / 2;

    const { rect, text } = this.makeButton(x, y, w, h, txt, color);
    rect.on("click", cb);
    text.on("click", cb);
  }

  clear(): void {
    this.group.destroyChildren();
    const bg = new Konva.Rect({
      x: 0,
      y: 0,
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
      fill: "#FFF8EB",
    });
    this.group.add(bg);
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
}
