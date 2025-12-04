import Konva from "konva";
import type { Group } from "konva/lib/Group";
import type { Layer } from "konva/lib/Layer";
import type { Image as KonvaImage } from "konva/lib/shapes/Image";
import type { Stage } from "konva/lib/Stage";
import { IMAGE_DIMENSIONS, STAGE_HEIGHT, STAGE_WIDTH } from "../../../constants";
import type { Item, View } from "../../../types";

const MINIGAME_BG = "/Background/ClassMinigame.jpg";

interface BasketData {
  name: string;
  imageSrc: string;
}

/** Simple shuffle helper */
function shuffleArray<T>(array: T[]): T[] {
  return array
    .map((v) => ({ v, r: Math.random() }))
    .sort((a, b) => a.r - b.r)
    .map((o) => o.v);
}

export class ClassroomMinigameView implements View {
  private stage: Stage;
  private layer: Layer;
  private group: Group;

  private itemNodes: KonvaImage[] = [];
  private basketNodes: KonvaImage[] = [];
  private basketLabels: Konva.Text[] = [];

  private titleNode?: Konva.Text;
  private resultGroup?: Konva.Group;
  private backButtonGroup?: Konva.Group;

  private onBackToClassroom: () => void = () => {};

  constructor(stage: Stage, layer: Layer) {
    this.stage = stage;
    this.layer = layer;
    this.group = new Konva.Group({ visible: false });

    this.addBackground();
  }

  getGroup(): Group {
    return this.group;
  }

  show(): void {
    this.group.visible(true);
    this.layer.batchDraw();
  }

  hide(): void {
    this.group.visible(false);
    this.layer.batchDraw();
  }

  /** Allow controller to attach a back-to-classroom handler */
  setOnBackToClassroom(handler: () => void): void {
    this.onBackToClassroom = handler;
    if (this.backButtonGroup) {
      this.backButtonGroup.off("click tap");
      this.backButtonGroup.on("click tap", this.onBackToClassroom);
    }
  }

  /** Main render function */
  async renderScene(
    items: Item[],
    baskets: BasketData[],
    onItemDrop: (item: Item, basketName: string) => void
  ): Promise<void> {
    this.clearScene();
    this.addBackground();
    this.addTitle();
    this.addBackButton();

    const shuffledBaskets = shuffleArray(baskets);

    // --- BASKETS ---
    const basketWidth = IMAGE_DIMENSIONS.width * 0.9;
    const basketHeight = IMAGE_DIMENSIONS.height * 0.9;
    const basketY = STAGE_HEIGHT - basketHeight - 140;
    const basketSpacing = STAGE_WIDTH / (shuffledBaskets.length + 1);

    for (let i = 0; i < shuffledBaskets.length; i++) {
      const basketData = shuffledBaskets[i];
      const img = await this.loadImage(basketData.imageSrc);

      const basket = new Konva.Image({
        x: basketSpacing * (i + 1) - basketWidth / 2,
        y: basketY,
        width: basketWidth,
        height: basketHeight,
        image: img,
        listening: false,
      });

      const label = new Konva.Text({
        x: basket.x(),
        y: basket.y() + basketHeight + 8,
        width: basketWidth,
        align: "center",
        text: basketData.name,
        fontSize: 28,
        fontFamily: "Times New Roman",
        fill: "#000",
        listening: false,
      });

      this.group.add(basket, label);
      this.basketNodes.push(basket);
      this.basketLabels.push(label);
    }

    // --- ITEMS ---
    const itemWidth = IMAGE_DIMENSIONS.width;
    const itemHeight = IMAGE_DIMENSIONS.height;
    const itemSpacing = STAGE_WIDTH / (items.length + 1);
    const itemY = 160;

    await Promise.all(
      items.map(async (item, idx) => {
        const img = await this.loadImage(item.image);
        const node = new Konva.Image({
          x: itemSpacing * (idx + 1) - itemWidth / 2,
          y: itemY,
          width: itemWidth,
          height: itemHeight,
          image: img,
          draggable: true,
        });

        node.on("dragend", () => {
          const centerX = node.x() + node.width() / 2;
          const centerY = node.y() + node.height() / 2;

          const hitIndex = this.basketNodes.findIndex((b) => {
            return (
              centerX > b.x() &&
              centerX < b.x() + b.width() &&
              centerY > b.y() &&
              centerY < b.y() + b.height()
            );
          });

          if (hitIndex !== -1) {
            const basketName = shuffledBaskets[hitIndex].name;

            // Snap item into the center of the basket
            node.position({
              x: this.basketNodes[hitIndex].x() +
                this.basketNodes[hitIndex].width() / 2 -
                node.width() / 2,
              y: this.basketNodes[hitIndex].y() +
                this.basketNodes[hitIndex].height() / 2 -
                node.height() / 2,
            });

            onItemDrop(item, basketName);
          }

          this.layer.batchDraw();
        });

        node.on("mouseenter", () => this.setCursor("pointer"));
        node.on("mouseleave", () => this.setCursor("default"));

        this.group.add(node);
        this.itemNodes.push(node);
      })
    );

    this.layer.batchDraw();
  }

  /** Show end-of-game result: X out of Y correct */
  showFinalResult(correct: number, total: number): void {
    if (this.resultGroup) {
      this.resultGroup.destroy();
    }

    const allCorrect = correct === total;
    const title = allCorrect ? "Correct!" : "Wrong!";
    const color = allCorrect ? "#16a34a" : "#dc2626";

    const group = new Konva.Group();
    const boxWidth = 500;
    const boxHeight = 180;

    const rect = new Konva.Rect({
      x: STAGE_WIDTH / 2 - boxWidth / 2,
      y: STAGE_HEIGHT / 2 - boxHeight / 2,
      width: boxWidth,
      height: boxHeight,
      fill: "rgba(255,255,255,0.95)",
      stroke: "#111827",
      strokeWidth: 3,
      cornerRadius: 20,
      shadowColor: "rgba(0,0,0,0.25)",
      shadowBlur: 16,
      shadowOffsetY: 6,
    });

    const text = new Konva.Text({
      x: rect.x() + 20,
      y: rect.y() + 24,
      width: rect.width() - 40,
      align: "center",
      text: `${title}\nYou got ${correct} out of ${total} correct.`,
      fontSize: 28,
      fontFamily: "Arial",
      fill: color,
      lineHeight: 1.4,
    });

    const buttonWidth = 260;
    const buttonHeight = 50;
    const btnX = STAGE_WIDTH / 2 - buttonWidth / 2;
    const btnY = rect.y() + rect.height() - buttonHeight - 20;

    const button = new Konva.Rect({
      x: btnX,
      y: btnY,
      width: buttonWidth,
      height: buttonHeight,
      fill: "#1D4ED8",
      cornerRadius: 12,
      stroke: "#0F172A",
      strokeWidth: 2,
      shadowColor: "rgba(0,0,0,0.2)",
      shadowBlur: 10,
      shadowOffsetY: 4,
    });

    const btnText = new Konva.Text({
      x: btnX,
      y: btnY + 12,
      width: buttonWidth,
      align: "center",
      text: "Back to Classroom",
      fontSize: 20,
      fontFamily: "Arial",
      fill: "#FFFFFF",
      listening: false,
    });

    const clickHandler = () => this.onBackToClassroom();
    button.on("click tap", clickHandler);

    group.add(rect, text, button, btnText);
    this.group.add(group);
    this.resultGroup = group;

    this.layer.batchDraw();
  }

  // ----- Helpers -----

  private addBackground(): void {
    const img = new window.Image();
    img.onload = () => {
      const bg = new Konva.Image({
        image: img,
        x: 0,
        y: 0,
        width: STAGE_WIDTH,
        height: STAGE_HEIGHT,
        listening: false,
      });
      this.group.add(bg);
      bg.moveToBottom();
      this.layer.batchDraw();
    };
    img.src = MINIGAME_BG;
  }

  private async loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  }

  private addTitle(): void {
    if (this.titleNode) this.titleNode.destroy();

    this.titleNode = new Konva.Text({
      text: "🧺 Classroom Sorting Challenge 🧺",
      fontFamily: "Georgia",
      fontStyle: "bold",
      fontSize: 52,
      fill: "#1F2937",
      width: STAGE_WIDTH,
      align: "center",
      y: 60,
      shadowColor: "rgba(0,0,0,0.25)",
      shadowBlur: 10,
      shadowOffsetY: 4,
    });

    this.group.add(this.titleNode);
  }

  private addBackButton(): void {
    const width = 220;
    const height = 50;
    const x = 40;
    const y = 40;

    const group = new Konva.Group({ x, y });

    const rect = new Konva.Rect({
      width,
      height,
      cornerRadius: 12,
      fill: "#1D4ED8",
      stroke: "#0F172A",
      strokeWidth: 2,
      shadowColor: "rgba(0,0,0,0.2)",
      shadowBlur: 8,
      shadowOffsetY: 3,
    });

    const text = new Konva.Text({
      width,
      height,
      text: "← Back to Classroom",
      align: "center",
      verticalAlign: "middle",
      fontSize: 18,
      fontFamily: "Arial",
      fill: "#FFFFFF",
      listening: false,
    });

    group.add(rect, text);
    group.on("mouseenter", () => this.setCursor("pointer"));
    group.on("mouseleave", () => this.setCursor("default"));
    group.on("click tap", () => this.onBackToClassroom());

    this.group.add(group);
    this.backButtonGroup = group;
  }

  private clearScene(): void {
    this.itemNodes.forEach((n) => n.destroy());
    this.basketNodes.forEach((b) => b.destroy());
    this.basketLabels.forEach((l) => l.destroy());

    this.itemNodes = [];
    this.basketNodes = [];
    this.basketLabels = [];

    if (this.titleNode) {
      this.titleNode.destroy();
      this.titleNode = undefined;
    }
    if (this.resultGroup) {
      this.resultGroup.destroy();
      this.resultGroup = undefined;
    }
  }

  private setCursor(cursor: string): void {
    this.stage.container().style.cursor = cursor;
  }
}
