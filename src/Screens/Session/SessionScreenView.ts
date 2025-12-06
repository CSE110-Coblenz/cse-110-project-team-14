import Konva from "konva";
import { STAGE_HEIGHT, STAGE_WIDTH } from "../../constants";
import type { View } from "../../types";

export interface SessionStats {
  elapsedMs: number;
  wordsLearned: number;
  minigameScore: number;
  minigameTotal: number;
  assessmentScore: number;
  assessmentTotal: number;
}

export class SessionScreenView implements View {
  private group: Konva.Group;

  private backgroundLayer: Konva.Rect;
  private backgroundImage?: Konva.Image;

  private titleText: Konva.Text;
  private elapsedText: Konva.Text;
  private wordsText: Konva.Text;
  private minigameText: Konva.Text;
  private assessmentText: Konva.Text;

  constructor() {
    this.group = new Konva.Group({ visible: false });

    // Dark terminal-like background fallback
    this.backgroundLayer = new Konva.Rect({
      x: 0,
      y: 0,
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
      fill: "#111", // near-black theme
    });
    this.group.add(this.backgroundLayer);

    // === TITLE ===
    this.titleText = new Konva.Text({
      x: 0,
      y: 50,
      width: STAGE_WIDTH,
      align: "center",
      text: "SESSION SUMMARY",
      fontSize: 40,
      fontFamily: "Courier New, Consolas, monospace", // TERMINAL FONT
      fontStyle: "bold",
      fill: "#00FF00", // terminal green
      shadowColor: "black",
      shadowBlur: 6,
      shadowOpacity: 0.4,
    });
    this.group.add(this.titleText);

    // === METRICS ===
    const baseY = 200;
    const gap = 60;

    this.elapsedText = this.createStatText("TIME: 0s", baseY);
    this.wordsText = this.createStatText("WORDS LEARNED: 0", baseY + gap);
    this.minigameText = this.createStatText("MINIGAME SCORE: 0/0", baseY + gap * 2);
    this.assessmentText = this.createStatText("ASSESSMENT SCORE: 0/0", baseY + gap * 3);

    this.group.add(
      this.elapsedText,
      this.wordsText,
      this.minigameText,
      this.assessmentText
    );
  }

  private createStatText(text: string, y: number): Konva.Text {
    return new Konva.Text({
      x: 0,
      y,
      width: STAGE_WIDTH,
      align: "center",
      text,
      fontSize: 28,
      fontFamily: "Courier New, Consolas, monospace",
      fill: "#00FF00", // terminal green
      shadowColor: "black",
      shadowBlur: 4,
      shadowOpacity: 0.3,
    });
  }

  update(stats: SessionStats) {
    const seconds = Math.round(stats.elapsedMs / 1000);

    this.elapsedText.text(`TIME: ${seconds}s`);
    this.wordsText.text(`WORDS LEARNED: ${stats.wordsLearned}`);
    this.minigameText.text(`MINIGAME SCORE: ${stats.minigameScore}/${stats.minigameTotal}`);
    this.assessmentText.text(`ASSESSMENT SCORE: ${stats.assessmentScore}/${stats.assessmentTotal}`);

    this.group.getLayer()?.batchDraw();
  }

  // Background loader for custom theme
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
      this.group.getLayer()?.batchDraw();
    });
  }

  show(): void {
    this.group.visible(true);
    this.group.getLayer()?.batchDraw();
  }

  hide(): void {
    this.group.visible(false);
    this.group.getLayer()?.batchDraw();
  }

  getGroup(): Konva.Group {
    return this.group;
  }
}
