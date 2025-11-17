import Konva from "konva";
import type { Group } from "konva/lib/Group";
import type { Layer } from "konva/lib/Layer";
import type { Image as KonvaImage } from "konva/lib/shapes/Image";
import type { Stage } from "konva/lib/Stage";
import { IMAGE_DIMENSIONS } from "../../../constants";
import type { Item } from "../../../types";

const MINIGAME_BG = "/Background/ClassMinigame.jpg";

export interface BasketData {
  name: string;       // French label
  imageSrc: string;   // Basket image URL
}

export class ClassroomMinigameView {
  private stage: Stage;
  private layer: Layer;
  private group: Group;

  private itemNodes: KonvaImage[] = [];
  private baskets: KonvaImage[] = [];
  private basketLabels: Konva.Text[] = [];

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

    // --- Render baskets ---
    const spacing = this.stage.width() / (baskets.length + 1);
    const basketY = this.stage.height() - 200;

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

      // French label below basket
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

    // --- Render draggable items ---
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

      node.on("dragend", () => {
        const basket = this.baskets.find(
          (b) =>
            node.x() + node.width() / 2 > b.x() &&
            node.x() + node.width() / 2 < b.x() + b.width() &&
            node.y() + node.height() / 2 > b.y() &&
            node.y() + node.height() / 2 < b.y() + b.height()
        );
        if (basket) {
          const basketName = baskets[this.baskets.indexOf(basket)].name;

          node.position({
            x: basket.x() + basket.width() / 2 - node.width() / 2,
            y: basket.y() + basket.height() / 2 - node.height() / 2,
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
}
