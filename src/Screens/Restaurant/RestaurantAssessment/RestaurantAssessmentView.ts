import Konva from "konva";
import { STAGE_HEIGHT, STAGE_WIDTH } from "../../../constants";
import type { MCProblem, TypingProblem } from "../../../types";

export class RestaurantAssessmentView {
  private group: Konva.Group = new Konva.Group({ visible: false });

  // Background support
  private backgroundLayer: Konva.Rect;
  private backgroundImage?: Konva.Image;

  private typingText?: Konva.Text;
  private scoreText?: Konva.Text;
  private progressBarGroup!: Konva.Group;
  private progressBarBg!: Konva.Rect;
  private progressBarFill!: Konva.Rect;
  private progressHoverText!: Konva.Text;
  private progressTotals = { found: 0, total: 0 };
  private onRestaurant: () => void;
  private onRestart: () => void;

  constructor(onRestaurant: () => void, onRestart: () => void) {
    this.onRestaurant = onRestaurant;
    this.onRestart = onRestart;

    // Fallback background
    this.backgroundLayer = new Konva.Rect({
      x: 0,
      y: 0,
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
      fill: "#FFF8EB",
    });

    this.group.add(this.backgroundLayer);
    this.createProgressBar();
  }

  // ----------------- MCQ SCREEN --------------------

  showMCQ(
    problem: MCProblem,
    score: number,
    total: number,
    callback: (pickedIndex: number) => void
  ): void {
    this.clear();

    this.addScore(score, total);

    const question = new Konva.Text({
      x: 0,
      y: 120,
      text: problem.question,
      fontSize: 32,
      fill: "#1a1a1a",
      width: STAGE_WIDTH,
      align: "center",
    });
    this.group.add(question);

    problem.options.forEach((opt, i) => {
      const btn = this.makeButton(
        (STAGE_WIDTH - 700) / 2,
        260 + i * 100,
        700,
        80,
        opt,
        "#DCE5F2"
      );
      btn.rect.on("click", () => callback(i));
      btn.text.on("click", () => callback(i));
    });

    this.group.getLayer()?.draw();
  }

  // ----------------- TYPING SCREEN (UPDATED) --------------------

  showTyping(
    problem: TypingProblem,
    typed: string,
    score: number,
    total: number
  ): void {
    this.clear();

    this.addScore(score, total);

    // Centered question
    const q = new Konva.Text({
      x: 0,
      y: 140,
      text: problem.question,
      fontSize: 32,
      width: STAGE_WIDTH,
      align: "center",
      fill: "#1a1a1a",
    });
    this.group.add(q);

    const boxWidth = 600;
    const boxHeight = 70;
    const boxX = (STAGE_WIDTH - boxWidth) / 2;
    const boxY = 260;

    // Visible input box
    const inputBox = new Konva.Rect({
      x: boxX,
      y: boxY,
      width: boxWidth,
      height: boxHeight,
      fill: "#FFFFFF",
      stroke: "#004AAD",
      strokeWidth: 3,
      cornerRadius: 12,
    });
    this.group.add(inputBox);

    // Typing text inside box
    this.typingText = new Konva.Text({
      x: boxX + 12,
      y: boxY + 18,
      width: boxWidth - 24,
      text: typed,
      fontSize: 32,
      fill: "#004AAD",
      fontFamily: "Arial",
      align: "left",
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
      x: 0,
      y: 240,
      width: STAGE_WIDTH,
      align: "center",
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
      x: 0,
      y: 160,
      width: STAGE_WIDTH,
      align: "center",
      text: `Final Score: ${score} / ${total}`,
      fontSize: 46,
      fill: "#000",
    });
    this.group.add(title);

    const bestScore = new Konva.Text({
      x: 0,
      y: 240,
      width: STAGE_WIDTH,
      align: "center",
      text: `Best Score: ${best} / ${total}`,
      fontSize: 40,
      fill: "#444",
    });
    this.group.add(bestScore);

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

  // ----------------- HELPERS --------------------

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
      y: y + 24,
      width: w,
      align: "center",
      text: txt,
      fontSize: 28,
      fill: "#111",
      fontFamily: "Arial",
    });

    this.group.add(rect, text);
    return { rect, text };
  }

  private makeCenterButton(y: number, txt: string, color: string, cb: () => void) {
    const w = 340;
    const h = 70;
    const x = (STAGE_WIDTH - w) / 2;

    const { rect, text } = this.makeButton(x, y, w, h, txt, color);
    rect.on("click", cb);
    text.on("click", cb);
  }

  clear(): void {
    this.group.destroyChildren();

    this.group.add(this.backgroundLayer);
    if (this.backgroundImage) this.group.add(this.backgroundImage);

    this.createProgressBar();
    this.updateTotalProgress(this.progressTotals.found, this.progressTotals.total);
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

  updateTotalProgress(found: number, total: number): void {
    this.progressTotals = { found, total };
    const ratio = total === 0 ? 0 : found / total;
    this.progressBarFill.width(this.progressBarBg.width() * ratio);
    this.group.getLayer()?.draw();
  }

  // ----------------- PROGRESS BAR --------------------

  private createProgressBar(): void {
    const barWidth = 240;
    const barMargin = 80;

    this.progressBarGroup = new Konva.Group({
      x: STAGE_WIDTH - barWidth - barMargin,
      y: 20,
    });

    this.progressBarBg = new Konva.Rect({
      width: barWidth,
      height: 18,
      cornerRadius: 9,
      fill: "#1d4ed8",
      opacity: 0.25,
      listening: false,
    });

    this.progressBarFill = new Konva.Rect({
      width: 0,
      height: 18,
      cornerRadius: 9,
      fill: "#1d4ed8",
      listening: false,
    });

    this.progressHoverText = new Konva.Text({
      width: barWidth,
      height: 18,
      align: "center",
      verticalAlign: "middle",
      fontSize: 12,
      fill: "#0f172a",
      visible: false,
      listening: false,
    });

    this.progressBarGroup.add(
      this.progressBarBg,
      this.progressBarFill,
      this.progressHoverText
    );

    this.group.add(this.progressBarGroup);
    this.progressBarGroup.moveToTop();
  }

  // ----------------- BACKGROUND IMAGE SUPPORT --------------------

  loadBackground(imageUrl: string): void {
    Konva.Image.fromURL(imageUrl, (img) => {
      img.position({ x: 0, y: 0 });
      img.width(STAGE_WIDTH);
      img.height(STAGE_HEIGHT);

      if (this.backgroundImage) this.backgroundImage.destroy();
      this.backgroundImage = img;

      this.group.add(img);
      img.moveToBottom();
      this.backgroundLayer.moveToBottom();
      this.group.getLayer()?.draw();
    });
  }
}
