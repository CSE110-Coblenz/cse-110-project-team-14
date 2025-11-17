import Konva from "konva";
import type { Group } from "konva/lib/Group";
import type { Layer } from "konva/lib/Layer";
import type { Image as KonvaImage } from "konva/lib/shapes/Image";
import type { Stage } from "konva/lib/Stage";
import { IMAGE_DIMENSIONS } from "../../../constants";
import type { Item } from "../../../types";

const MINIGAME_BG = "/Background/classroomMinigame.png";

export class ClassroomMinigameView {
  private stage: Stage;
  private layer: Layer;
  private group: Group;

  private itemNodes: KonvaImage[] = [];
  private baskets: Konva.Rect[] = [];

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

  async renderScene(items: Item[], basketNames: string[], onItemClick: (item: Item) => void) {
    this.clearScene();

    // Render baskets
    const spacing = this.stage.width() / (basketNames.length + 1);
    const basketY = this.stage.height() - 200;
    this.baskets = basketNames.map((name, i) => {
      const basket = new Konva.Rect({
        x: spacing * (i + 1) - 60,
        y: basketY,
        width: 120,
        height: 120,
        fill: "#FFD700",
        cornerRadius: 16,
        stroke: "#1B1B1B",
        strokeWidth: 2,
      });
      this.group.add(basket);
      return basket;
    });

    // Render items
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
        const basket = this.baskets.find(b =>
          node.x() + node.width() / 2 > b.x() &&
          node.x() + node.width() / 2 < b.x() + b.width() &&
          node.y() + node.height() / 2 > b.y() &&
          node.y() + node.height() / 2 < b.y() + b.height()
        );
        if (basket) {
          // Snap to basket center
          node.position({
            x: basket.x() + basket.width() / 2 - node.width() / 2,
            y: basket.y() + basket.height() / 2 - node.height() / 2,
          });
          onItemClick(item);
        }
      });

      this.group.add(node);
      this.itemNodes.push(node);
    });

    await Promise.all(promises);
    this.layer.batchDraw();
  }

  private clearScene() {
    this.itemNodes.forEach(node => node.destroy());
    this.itemNodes = [];
    this.baskets.forEach(b => b.destroy());
    this.baskets = [];
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
