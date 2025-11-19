import Konva from "konva";
import type { Group } from "konva/lib/Group";
import type { Layer } from "konva/lib/Layer";
import type { Image as KonvaImage } from "konva/lib/shapes/Image";
import type { Stage } from "konva/lib/Stage";
import { IMAGE_DIMENSIONS } from "../../../constants";
import type { Item } from "../../../types";
import { View } from "../../../types";

const MINIGAME_BG = "/Background/ClassMinigame.jpg";

interface BasketData {
  name: string;       // French label
  imageSrc: string;   // Basket image URL
}

export class ClassroomMinigameView implements View {
  private stage: Stage;
  private layer: Layer;
  private group: Group;

  private itemNodes: KonvaImage[] = [];
  private baskets: KonvaImage[] = [];
  private basketLabels: Konva.Text[] = [];

  private _feedbackGroup?: Konva.Group;

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

  async renderScene(
    items: Item[],
    baskets: BasketData[],
    onItemDrop: (item: Item, basketName: string) => void
  ) {
    this.clearScene();

    const spacing = this.stage.width() / (baskets.length + 1);
    const basketY = this.stage.height() - 200;

    // Render baskets + labels
    for (let i = 0; i < baskets.length; i++) {
      const basketData = baskets[i];
      const img = await this.loadImage(basketData.imageSrc);

      const basketNode = new Konva.Image({
        x: spacing * (i + 1) - 60,
        y: basketY,
        width: 120,
        height: 120,
        image: img,
      });
      this.group.add(basketNode);
      this.baskets.push(basketNode);

      const labelNode = new Konva.Text({
        x: basketNode.x(),
        y: basketNode.y() + 125,
        width: 120,
        align: "center",
        text: basketData.name,
        fontSize: 18,
        fontFamily: "Arial",
        fill: "#000",
      });
      this.group.add(labelNode);
      this.basketLabels.push(labelNode);
    }

    // Render draggable items
    const itemSpacing = this.stage.width() / (items.length + 1);
    const itemY = 100;

    const promises = items.map(async (item, idx) => {
      const img = await this.loadImage(item.image);
      const node = new Konva.Image({
        x: itemSpacing * (idx + 1) - IMAGE_DIMENSIONS.width / 2,
        y: itemY,
        width: IMAGE_DIMENSIONS.width,
        height: IMAGE_DIMENSIONS.height,
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
          const basketName = baskets[basketIndex].name;
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
    });

    await Promise.all(promises);
    this.layer.batchDraw();
  }

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
  }

  private addBackground() {
    const img = new window.Image();
    img.onload = () => {
      const bg = new Konva.Image({
        image: img,
        x: 0,
        y: 0,
        width: this.stage.width(),
        height: this.stage.height(),
        listening: false,
      });
      this.group.add(bg);
      bg.moveToBottom();
      this.layer.batchDraw();
    };
    img.src = MINIGAME_BG;
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  }

  /** -----------------------------------
   * Show floating feedback message in a cloud
   * ----------------------------------- */
  showFeedback(message: string, correct: boolean) {
    // Remove previous feedback
    if (this._feedbackGroup) {
      this._feedbackGroup.destroy();
      this._feedbackGroup = undefined;
    }

    const group = new Konva.Group();

    // Create background rectangle (cloud)
    const padding = 20;
    const rect = new Konva.Rect({
      x: this.stage.width() / 2,
      y: this.stage.height() / 2 - 50,
      width: 0, // will adjust later
      height: 60,
      fill: correct ? "rgba(0,200,0,0.85)" : "rgba(200,0,0,0.85)",
      cornerRadius: 20,
      opacity: 0,
    });

    // Create text
    const text = new Konva.Text({
      text: message,
      fontSize: 28,
      fontFamily: "Calibri",
      fill: "#fff",
      align: "center",
      opacity: 0,
    });

    text.x(this.stage.width() / 2 - text.width() / 2);
    text.y(rect.y() + (rect.height() - text.height()) / 2);

    // Adjust rectangle width to fit text
    rect.width(text.width() + padding * 2);
    rect.x(this.stage.width() / 2 - rect.width() / 2);

    group.add(rect);
    group.add(text);
    this.layer.add(group);
    this._feedbackGroup = group;
    this.layer.draw();

    // Animate fade in
    rect.to({ opacity: 1, duration: 0.25 });
    text.to({ opacity: 1, duration: 0.25 });

    // Fade out after 700ms
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
}
