import Konva from "konva";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants";
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
  private background: Konva.Rect;
  private titleText: Konva.Text;
  private elapsedText: Konva.Text;
  private wordsText: Konva.Text;
  private minigameText: Konva.Text;
  private assessmentText: Konva.Text;
  private onBack: () => void;

  constructor(onBack: () => void) {
    this.group = new Konva.Group({ visible: false });
    this.onBack = onBack;

    this.background = new Konva.Rect({
      x: 0,
      y: 0,
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
      fill: "#f7f7f7",
    });
    this.group.add(this.background);

    this.titleText = new Konva.Text({
      x: 0,
      y: 50,
      width: STAGE_WIDTH,
      align: "center",
      text: "Session Summary",
      fontSize: 36,
      fontFamily: "Arial",
      fontStyle: "bold",
      fill: "#000",
    });
    this.group.add(this.titleText);

    const baseY = 150;
    const gap = 60;

    this.elapsedText = new Konva.Text({
      x: 100,
      y: baseY,
      width: STAGE_WIDTH - 200,
      align: "left",
      text: "Time: 0s",
      fontSize: 24,
      fontFamily: "Arial",
      fill: "#111",
    });
    this.wordsText = new Konva.Text({
      x: 100,
      y: baseY + gap,
      width: STAGE_WIDTH - 200,
      align: "left",
      text: "Words learned: 0",
      fontSize: 24,
      fontFamily: "Arial",
      fill: "#111",
    });
    this.minigameText = new Konva.Text({
      x: 100,
      y: baseY + gap * 2,
      width: STAGE_WIDTH - 200,
      align: "left",
      text: "Minigame score: 0/0",
      fontSize: 24,
      fontFamily: "Arial",
      fill: "#111",
    });
    this.assessmentText = new Konva.Text({
      x: 100,
      y: baseY + gap * 3,
      width: STAGE_WIDTH - 200,
      align: "left",
      text: "Assessment score: 0/0",
      fontSize: 24,
      fontFamily: "Arial",
      fill: "#111",
    });

    this.group.add(
      this.elapsedText,
      this.wordsText,
      this.minigameText,
      this.assessmentText
    );

    // Note: no Back button here per request; navigation handled by controller
  }

  update(stats: SessionStats) {
    const seconds = Math.round(stats.elapsedMs / 1000);
    this.elapsedText.text(`Time: ${seconds}s`);
    this.wordsText.text(`Words learned: ${stats.wordsLearned}`);
    this.minigameText.text(`Minigame score: ${stats.minigameScore}/${stats.minigameTotal}`);
    this.assessmentText.text(`Assessment score: ${stats.assessmentScore}/${stats.assessmentTotal}`);
    this.group.getLayer()?.batchDraw();
  }

  private createButton(text: string, x: number, y: number, onClick: () => void): Konva.Group {
    const buttonGroup = new Konva.Group();

    const rect = new Konva.Rect({
      x,
      y,
      width: 180,
      height: 48,
      fill: "#ffffff",
      stroke: "#000",
      strokeWidth: 2,
      cornerRadius: 8,
    });

    const label = new Konva.Text({
      x,
      y: y + 12,
      width: 180,
      align: "center",
      text,
      fontSize: 18,
      fontFamily: "Arial",
      fill: "#000",
    });

    rect.on("click", onClick);
    label.on("click", onClick);

    buttonGroup.add(rect, label);
    return buttonGroup;
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
