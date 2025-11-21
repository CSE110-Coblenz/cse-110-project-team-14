import Konva from "konva";
import { STAGE_HEIGHT, STAGE_WIDTH } from "../../../constants";
import type { Item } from '../../../types';

export class RestaurantMainView {
  private group: Konva.Group;
  private dockGroup: Konva.Group;
  private itemImages: Record<string, Konva.Image> = {};
  private dockText: Konva.Text;
  private dockPhonetic: Konva.Text;
  private background: Konva.Rect;
  private onAssessment: () => void;

  constructor(
    onItemClick: (itemName: string) => void,
    onAssessment: () => void
  ) {
    this.group = new Konva.Group({ visible: false });
    this.dockGroup = new Konva.Group();
    this.onAssessment = onAssessment;

    // Background
    this.background = new Konva.Rect({
      x: 0,
      y: 0,
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
      fill: "#d3eaf5ff",
    });
    this.group.add(this.background);

    // Dock
    const dockHeight = 100;
    const dock = new Konva.Rect({
      x: 200,
      y: STAGE_HEIGHT - dockHeight,
      width: STAGE_WIDTH / 2,
      height: dockHeight,
      fill: "#5c471dff",
      stroke: "black",
      strokeWidth: 2,
    });
    this.dockGroup.add(dock);

    this.dockText = new Konva.Text({
      x: 300,
      y: STAGE_HEIGHT - dockHeight + 20,
      fontSize: 24,
      fontFamily: "Arial",
      fill: "black",
      text: "Click an item",
    });
    this.dockGroup.add(this.dockText);

    this.dockPhonetic = new Konva.Text({
      x: 350,
      y: STAGE_HEIGHT - dockHeight + 55,
      fontSize: 20,
      fontFamily: "Arial",
      fill: "black",
    });
    this.dockGroup.add(this.dockPhonetic);

    this.group.add(this.dockGroup);

    // Assessment button
    const buttonWidth = 180;
    const buttonHeight = 50;
    const buttonX = STAGE_WIDTH - buttonWidth - 40;
    const buttonY = 40;

    const button = new Konva.Rect({
      x: buttonX,
      y: buttonY,
      width: buttonWidth,
      height: buttonHeight,
      fill: "#8bc34aff",
      cornerRadius: 10,
      stroke: "black",
      strokeWidth: 2,
    });

    const buttonText = new Konva.Text({
      x: buttonX + 20,
      y: buttonY + 12,
      text: "Start Assessment",
      fontSize: 18,
      fontFamily: "Arial",
      fill: "black",
    });

    const handler = () => this.onAssessment();
    button.on("click", handler);
    buttonText.on("click", handler);

    this.group.add(button, buttonText);
  }

  addItems(items: Item[], onItemClick: (itemName: string) => void): void {
    items.forEach((item) => {
      Konva.Image.fromURL(item.image, (imgNode) => {
        imgNode.setAttrs({
          x: item.x,
          y: item.y,
          width: 200,
          height: 200,
          name: item.name,
          image: imgNode.image()
        });
        imgNode.on("click", () => onItemClick(item.name));
        this.itemImages[item.name] = imgNode;
        this.group.add(imgNode);
        this.group.getLayer()?.batchDraw();
      });
    });
  }

  updateDock(item: Item): void {
    this.dockText.text(`${item.english} / ${item.french}`);
    this.dockPhonetic.text(`${item.phonetic}`);
    this.group.getLayer()?.batchDraw();
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
