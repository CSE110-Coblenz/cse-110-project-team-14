import Konva from "konva";
import { STAGE_HEIGHT, STAGE_WIDTH } from "../../../constants";
import type { MCProblem, TypingProblem } from '../../../types';

export class RestaurantAssessmentView {
  private group = new Konva.Group({ visible: false });
  private typingText?: Konva.Text;
  private progressText: Konva.Text;
  private onRestaurant: () => void;
  private onIntro: () => void;

  constructor(onRestaurant: () => void, onIntro: () => void) {
    this.onRestaurant = onRestaurant;
    this.onIntro = onIntro;

    const bg = new Konva.Rect({
      x: 0, y: 0, width: STAGE_WIDTH, height: STAGE_HEIGHT,
      fill: "#f5f1e6"
    });
    this.group.add(bg);

    this.progressText = new Konva.Text({
      x: 40, y: 30, fontSize: 26,
      fill: "#1b1b1b",
      fontFamily: "Arial",
      text: "",
    });

    this.group.add(this.progressText);
  }

  updateProgress(current: number, total: number, score: number) {
    this.progressText.text(`Question ${current} / ${total}   Score: ${score}`);
    this.redraw();
  }

  showMCQ(problem: MCProblem, callback: (picked: number) => void): void {
    this.clearExceptProgress();
    this.group.add(this.createQuestion(problem.question));

    problem.options.forEach((opt, i) => {
      const group = new Konva.Group({ x: 120, y: 200 + i * 90 });

      const rect = new Konva.Rect({
        width: STAGE_WIDTH - 240, height: 70,
        fill: "#ece2d0", cornerRadius: 12,
        stroke: "#6b4e14", strokeWidth: 2,
        shadowColor: "rgba(0,0,0,0.25)",
        shadowBlur: 8, shadowOffsetY: 4,
      });

      const text = new Konva.Text({
        width: STAGE_WIDTH - 240, height: 70,
        text: opt, align: "center", verticalAlign: "middle",
        fontSize: 24, fontFamily: "Arial", listening: false
      });

      group.add(rect, text);
      group.on("click tap", () => callback(i));
      this.cursor(group);
      this.group.add(group);
    });

    this.redraw();
  }

  showTyping(problem: TypingProblem, typed: string): void {
    this.clearExceptProgress();

    this.group.add(this.createQuestion(problem.question));

    this.typingText = new Konva.Text({
      x: 120, y: 240, width: STAGE_WIDTH - 240,
      fontSize: 32, fill: "#004aad",
      text: typed
    });

    this.group.add(this.typingText);
    this.redraw();
  }

  updateTypingText(text: string) {
    if (!this.typingText) return;
    this.typingText.text(text);
    this.redraw();
  }

  showFeedback(correct: boolean): void {
    this.clearExceptProgress();
    const msg = new Konva.Text({
      x: 0, y: STAGE_HEIGHT / 2 - 40,
      width: STAGE_WIDTH, align: "center",
      fontSize: 48, fontFamily: "Arial",
      fill: correct ? "#2e7d32" : "#c62828",
      text: correct ? "Correct!" : "Wrong!",
    });
    this.group.add(msg);
    this.redraw();
  }

  showResults(score: number, total: number): void {
    this.clearExceptProgress();

    const txt = new Konva.Text({
      x: 0, y: STAGE_HEIGHT / 2 - 100,
      width: STAGE_WIDTH, align: "center",
      fontSize: 42, text: `Final Score: ${score} / ${total}`,
      fontFamily: "Arial"
    });

    this.group.add(txt);

    this.group.add(this.makeGreenButton("Back to Restaurant", () => this.onRestaurant(), -80));
    this.group.add(this.makeGreenButton("Continue Learning", () => this.onIntro(), 10));

    this.redraw();
  }

  // Helpers ------------------------------------------------------

  private createQuestion(text: string): Konva.Text {
    return new Konva.Text({
      x: 0, y: 120, width: STAGE_WIDTH,
      align: "center", fontSize: 32,
      text, fontFamily: "Arial",
    });
  }

  private makeGreenButton(label: string, handler: () => void, offsetY: number): Konva.Group {
    const width = 340, height = 70;
    const group = new Konva.Group({
      x: STAGE_WIDTH / 2 - width / 2,
      y: STAGE_HEIGHT / 2 + offsetY,
    });

    const rect = new Konva.Rect({
      width, height, fill: "#4CAF50",
      stroke: "#2E7D32", strokeWidth: 3,
      cornerRadius: 18,
      shadowColor: "rgba(0,0,0,0.35)",
      shadowBlur: 12, shadowOffsetY: 5,
    });

    const text = new Konva.Text({
      width, height, align: "center",
      verticalAlign: "middle",
      text: label, fontSize: 24,
      fontFamily: "Arial", fill: "white", listening: false
    });

    group.add(rect, text);
    group.on("click tap", handler);
    this.cursor(group);
    return group;
  }

  private cursor(node: Konva.Node) {
    node.on("mouseenter", () => document.body.style.cursor = "pointer");
    node.on("mouseleave", () => document.body.style.cursor = "default");
  }

  private clearExceptProgress() {
    const keep = this.progressText;
    this.group.destroyChildren();
    this.group.add(new Konva.Rect({ x: 0, y: 0, width: STAGE_WIDTH, height: STAGE_HEIGHT, fill: "#f5f1e6" }));
    this.group.add(keep);
  }

  private redraw() {
    this.group.getLayer()?.batchDraw();
  }

  show() { this.group.visible(true); this.redraw(); }
  hide() { this.group.visible(false); this.redraw(); }
  getGroup() { return this.group; }
}
