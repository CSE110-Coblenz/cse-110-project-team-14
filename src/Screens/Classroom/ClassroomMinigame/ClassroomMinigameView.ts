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
  private _returnButton?: Konva.Group;

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

    if (this._returnButton) {
      this._returnButton.destroy();
      this._returnButton = undefined;
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
    if (this._feedbackGroup) {
      this._feedbackGroup.destroy();
      this._feedbackGroup = undefined;
    }

    const group = new Konva.Group();
    const padding = 20;

    const text = new Konva.Text({
      text: message,
      fontSize: 28,
      fontFamily: "Calibri",
      fill: "#fff",
      align: "center",
    });

    const rect = new Konva.Rect({
      width: text.width() + padding * 2,
      height: text.height() + padding,
      fill: correct ? "rgba(0,200,0,0.85)" : "rgba(200,0,0,0.85)",
      cornerRadius: 20,
      x: this.stage.width() / 2 - (text.width() + padding * 2) / 2,
      y: this.stage.height() / 2 - (text.height() + padding) / 2 - 20,
      opacity: 0,
    });

    text.x(rect.x() + padding);
    text.y(rect.y() + (rect.height() - text.height()) / 2);

    group.add(rect);
    group.add(text);

    this.layer.add(group);
    this._feedbackGroup = group;
    this.layer.draw();

    // Animate fade in
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

  /** -----------------------------------
   * Add Return Button
   * ----------------------------------- */
  addReturnButton(onClick: () => void) {
    if (this._returnButton) {
      this._returnButton.destroy();
    }

    const group = new Konva.Group({ x: 20, y: 20 });

    const rect = new Konva.Rect({
      width: 120,
      height: 50,
      fill: "#3498db",
      cornerRadius: 10,
      shadowColor: "black",
      shadowBlur: 4,
      shadowOffset: { x: 2, y: 2 },
      shadowOpacity: 0.4,
      cursor: "pointer",
    });

    const text = new Konva.Text({
      text: "Return",
      fontSize: 20,
      fontFamily: "Arial",
      fill: "#fff",
      width: rect.width(),
      height: rect.height(),
      align: "center",
      verticalAlign: "middle",
    });

    group.add(rect);
    group.add(text);

    // Hover effect
    group.on("mouseover", () => rect.fill("#2980b9"));
    group.on("mouseout", () => rect.fill("#3498db"));
    group.on("click", onClick);

    // Add button to the layer and bring to top
    this.layer.add(group);
    group.moveToTop(); // <<< Ensure button is on top of everything
    this._returnButton = group;
    this.layer.draw();
}

}
