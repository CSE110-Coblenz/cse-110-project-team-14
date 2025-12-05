import Konva from "konva";
import type { Group } from "konva/lib/Group";
import type { Layer } from "konva/lib/Layer";
import type { Image as KonvaImage } from "konva/lib/shapes/Image";
import type { Stage } from "konva/lib/Stage";
import { IMAGE_DIMENSIONS, STAGE_HEIGHT, STAGE_WIDTH } from "../../../constants";
import type { Item } from "../../../types";
import { View } from "../../../types";
import type { ProgressCounts } from "../../../utils/ProgressTracker";

const MINIGAME_BG = "/Background/ClassMinigame.jpg";

interface BasketData {
  name: string;
  imageSrc: string;
}

/** Helper to shuffle array for random basket placement */
function shuffleArray<T>(array: T[]): T[] {
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

export class ClassroomMinigameView implements View {
  private stage: Stage;
  private layer: Layer;
  private group: Group;

  private itemNodes: KonvaImage[] = [];
  private baskets: KonvaImage[] = [];
  private basketLabels: Konva.Text[] = [];
  private _feedbackGroup?: Konva.Group;
  private _titleNode?: Konva.Text;
  private exitButton: Konva.Group;
  private exitHandler?: () => void;
  private progressText: Konva.Text;

  constructor(stage: Stage, layer: Layer) {
    this.stage = stage;
    this.layer = layer;
    this.group = new Konva.Group({ visible: false });
    this.addBackground();
    this.exitButton = this.createExitButton();
    this.group.add(this.exitButton);
    this.progressText = new Konva.Text({
      x: 40,
      y: 30,
      fontSize: 20,
      fontFamily: "Arial",
      fill: "#FFFFFF",
      text: "Items 0 / 0 | People 0 / 0 | Minigame 0 / 0",
    });
    this.group.add(this.progressText);
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

  setOnExit(handler: () => void): void {
    this.exitHandler = handler;
  }

  updateProgress(counts: ProgressCounts) {
    const { items, people, minigames } = counts;
    this.progressText.text(
      `Items ${items.found} / ${items.total} | People ${people.found} / ${people.total} | Minigame ${minigames.found} / ${minigames.total}`
    );
    this.layer.batchDraw();
  }

  /** Render all items and baskets */
  async renderScene(
    items: Item[],
    baskets: BasketData[],
    onItemDrop: (item: Item, basketName: string) => void
  ) {
    this.clearScene();

    // --- Add title ---
    this.addTitle("Put the items in the right Basket");

    // --- Randomize baskets ---
    const randomizedBaskets = shuffleArray(baskets);

    // --- Basket sizing & spacing ---
    const basketWidth = IMAGE_DIMENSIONS.width * 0.8;   // slightly smaller than items
    const basketHeight = IMAGE_DIMENSIONS.height * 0.8;
    const basketSpacing = STAGE_WIDTH / (randomizedBaskets.length + 1);
    const basketY = STAGE_HEIGHT - basketHeight - 150; // moved up for spacing

    // Render baskets
    for (let i = 0; i < randomizedBaskets.length; i++) {
      const basketData = randomizedBaskets[i];
      const img = await this.loadImage(basketData.imageSrc);

      const basketNode = new Konva.Image({
        x: basketSpacing * (i + 1) - basketWidth / 2,
        y: basketY,
        width: basketWidth,
        height: basketHeight,
        image: img,
      });
      this.group.add(basketNode);
      this.baskets.push(basketNode);

      const labelNode = new Konva.Text({
        x: basketNode.x(),
        y: basketNode.y() + basketHeight + 5,
        width: basketWidth,
        align: "center",
        text: basketData.name,
        fontSize: 30,
        fontFamily: "Times New Roman",
        fill: "#000",
      });
      this.group.add(labelNode);
      this.basketLabels.push(labelNode);
    }

    // --- Item sizing & spacing ---
    const itemWidth = IMAGE_DIMENSIONS.width;
    const itemHeight = IMAGE_DIMENSIONS.height;
    const itemSpacing = STAGE_WIDTH / (items.length + 1);
    const itemY = 170;

    // Render draggable items
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

        // Drag & drop logic
        node.on("dragend", () => {
          const basketIndex = this.baskets.findIndex(
            (b) =>
              node.x() + node.width() / 2 > b.x() &&
              node.x() + node.width() / 2 < b.x() + b.width() &&
              node.y() + node.height() / 2 > b.y() &&
              node.y() + node.height() / 2 < b.y() + b.height()
          );

          if (basketIndex !== -1) {
            const basketName = randomizedBaskets[basketIndex].name;
            // Snap to basket
            node.position({
              x: this.baskets[basketIndex].x() + this.baskets[basketIndex].width() / 2 - node.width() / 2,
              y: this.baskets[basketIndex].y() + this.baskets[basketIndex].height() / 2 - node.height() / 2,
            });
            onItemDrop(item, basketName);
          }
        });

        this.group.add(node);
        this.itemNodes.push(node);
      })
    );

    this.layer.batchDraw();
  }

  /** Destroy previous scene nodes */
  private clearScene() {
    this.itemNodes.forEach((n) => n.destroy());
    this.itemNodes = [];

    this.baskets.forEach((b) => b.destroy());
    this.baskets = [];

    this.basketLabels.forEach((t) => t.destroy());
    this.basketLabels = [];

    if (this._feedbackGroup) {
      this._feedbackGroup.destroy();
      this._feedbackGroup = undefined;
    }

    if (this._titleNode) {
      this._titleNode.destroy();
      this._titleNode = undefined;
    }
  }

  /** Add background image */
  private addBackground() {
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

  /** Load image from URL */
  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  }

  /** Add title text at the top */
  private addTitle(text: string) {
    if (this._titleNode) {
      this._titleNode.destroy();
      this._titleNode = undefined;
    }

    const titleNode = new Konva.Text({
      text,
      fontSize: 50,
      fontFamily: "Times New Roman",
      fill: "#000000ff",
      width: STAGE_WIDTH,
      align: "center",
      y: 75,
    });

    this.group.add(titleNode);
    this._titleNode = titleNode;
  }

  /** Show feedback cloud */
  showFeedback(message: string, correct: boolean) {
    if (this._feedbackGroup) {
      this._feedbackGroup.destroy();
      this._feedbackGroup = undefined;
    }

    const group = new Konva.Group();
    const padding = 20;

    const rect = new Konva.Rect({
      x: STAGE_WIDTH / 2,
      y: STAGE_HEIGHT / 2 - 50,
      width: 0,
      height: 60,
      fill: correct ? "rgba(0,200,0,0.85)" : "rgba(200,0,0,0.85)",
      cornerRadius: 20,
      opacity: 0,
    });

    const text = new Konva.Text({
      text: message,
      fontSize: 28,
      fontFamily: "Calibri",
      fill: "#fff",
      align: "center",
      opacity: 0,
    });

    text.x(STAGE_WIDTH / 2 - text.width() / 2);
    text.y(rect.y() + (rect.height() - text.height()) / 2);

    rect.width(text.width() + padding * 2);
    rect.x(STAGE_WIDTH / 2 - rect.width() / 2);

    group.add(rect);
    group.add(text);
    this.layer.add(group);
    this._feedbackGroup = group;
    this.layer.draw();

    rect.to({ opacity: 1, duration: 0.25 });
    text.to({ opacity: 1, duration: 0.25 });

    setTimeout(() => {
      rect.to({
        opacity: 0,
        duration: 0.25,
        onFinish: () => {
          group.destroy();
          this._feedbackGroup = undefined;
          this.layer.draw();
        },
      });
      text.to({ opacity: 0, duration: 0.25 });
    }, 700);
  }

  private createExitButton(): Konva.Group {
    const group = new Konva.Group({
      x: STAGE_WIDTH - 190,
      y: 40,
    });
    const rect = new Konva.Rect({
      width: 150,
      height: 44,
      cornerRadius: 12,
      fill: "#1D4ED8",
      stroke: "#0F172A",
      strokeWidth: 1,
      shadowColor: "rgba(0,0,0,0.2)",
      shadowBlur: 8,
      shadowOffsetY: 3,
    });
    const text = new Konva.Text({
      width: rect.width(),
      height: rect.height(),
      align: "center",
      verticalAlign: "middle",
      text: "Exit Minigame",
      fontSize: 18,
      fontFamily: "Arial",
      fill: "#FFFFFF",
      listening: false,
    });
    group.add(rect, text);
    group.on("click tap", () => this.exitHandler?.());
    group.on("mouseenter", () => this.stage.container().style.cursor = "pointer");
    group.on("mouseleave", () => this.stage.container().style.cursor = "default");
    return group;
  }
}
