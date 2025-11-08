import Konva from "konva";
import type { Item } from "../../../types";
import {
  IMAGE_DIMENSIONS,
  STAGE_HEIGHT,
  STAGE_WIDTH,
} from "../../../constants";

type ItemClickHandler = (itemName: string) => void;

/**
 * View responsible for rendering the restaurant vocabulary scene.
 */
export class RestaurantMainView {
  private readonly group: Konva.Group;
  private readonly infoPanel: Konva.Rect;
  private readonly frenchText: Konva.Text;
  private readonly phoneticText: Konva.Text;
  private readonly englishText: Konva.Text;
  private readonly progressText: Konva.Text;
  private readonly switchButton: Konva.Group;
  private switchHandler?: () => void;
  private itemImages: Record<string, Konva.Image> = {};

  constructor() {
    this.group = new Konva.Group({ visible: false });

    const background = new Konva.Rect({
      x: 0,
      y: 0,
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
      fill: "#FFE4C4", // warm restaurant tone
    });
    this.group.add(background);

    const panelHeight = 130;
    this.infoPanel = new Konva.Rect({
      x: 140,
      y: STAGE_HEIGHT - panelHeight - 30,
      width: STAGE_WIDTH - 280,
      height: panelHeight,
      fill: "#FFFFFF",
      stroke: "#1B1B1B",
      strokeWidth: 2,
      cornerRadius: 16,
      shadowColor: "rgba(0,0,0,0.2)",
      shadowBlur: 10,
      shadowOffsetY: 4,
    });
    this.group.add(this.infoPanel);

    this.frenchText = new Konva.Text({
      x: this.infoPanel.x() + 24,
      y: this.infoPanel.y() + 16,
      width: this.infoPanel.width() - 48,
      align: "center",
      fontSize: 26,
      fontFamily: "Arial",
      fontStyle: "bold",
      fill: "#1D3557",
      text: "",
    });
    this.group.add(this.frenchText);

    this.phoneticText = new Konva.Text({
      x: this.infoPanel.x() + 24,
      y: this.infoPanel.y() + 58,
      width: this.infoPanel.width() - 48,
      align: "center",
      fontSize: 22,
      fontFamily: "Arial",
      fontStyle: "italic",
      fill: "#475569",
      text: "",
    });
    this.group.add(this.phoneticText);

    this.englishText = new Konva.Text({
      x: this.infoPanel.x() + 24,
      y: this.infoPanel.y() + 94,
      width: this.infoPanel.width() - 48,
      align: "center",
      fontSize: 24,
      fontFamily: "Arial",
      fill: "#0F172A",
      text: "Click a dish to learn its word.",
    });
    this.group.add(this.englishText);

    this.progressText = new Konva.Text({
      x: STAGE_WIDTH - 200,
      y: 24,
      width: 170,
      align: "right",
      fontSize: 22,
      fontFamily: "Arial",
      fill: "#0F172A",
      text: "0 / 0 found",
    });
    this.group.add(this.progressText);

    this.switchButton = this.createButton("Switch to Classroom", STAGE_WIDTH - 220, 24, () => {
      this.switchHandler?.();
    });
    this.group.add(this.switchButton);
  }

  getGroup(): Konva.Group {
    return this.group;
  }

  show(): void {
    this.group.visible(true);
  }

  hide(): void {
    this.group.visible(false);
  }

  addItems(items: Item[], onItemClick: ItemClickHandler): void {
    items.forEach((item) => {
      Konva.Image.fromURL(item.image, (imageNode) => {
        imageNode.position({ x: item.x, y: item.y });
        imageNode.size({
          width: IMAGE_DIMENSIONS.width,
          height: IMAGE_DIMENSIONS.height,
        });
        imageNode.name(item.name);
        imageNode.on("mouseenter", () => {
          imageNode
            .getStage()
            ?.container()
            .style.setProperty("cursor", "pointer");
        });
        imageNode.on("mouseleave", () => {
          imageNode
            .getStage()
            ?.container()
            .style.setProperty("cursor", "default");
        });
        imageNode.on("click tap", () => onItemClick(item.name));
        this.itemImages[item.name] = imageNode;
        this.group.add(imageNode);
        this.group.getLayer()?.draw();
      });
    });
  }

  setOnSwitchToClassroom(handler: () => void): void {
    this.switchHandler = handler;
  }

  updatePanel(item: Item): void {
    this.englishText.text(item.english);
    this.frenchText.text(item.french);
    this.phoneticText.text(item.phonetic);
    this.group.getLayer()?.draw();
  }

  resetPanel(): void {
    this.englishText.text("Click a dish to learn its word.");
    this.frenchText.text("");
    this.phoneticText.text("");
    this.group.getLayer()?.draw();
  }

  updateProgress(found: number, total: number): void {
    this.progressText.text(`${found} / ${total} found`);
    this.group.getLayer()?.draw();
  }

  private createButton(
    label: string,
    x: number,
    y: number,
    onClick: () => void
  ): Konva.Group {
    const group = new Konva.Group({ x, y });
    const buttonRect = new Konva.Rect({
      width: 180,
      height: 36,
      cornerRadius: 12,
      fill: "#1D4ED8",
      stroke: "#0F172A",
      strokeWidth: 1,
      shadowColor: "rgba(0,0,0,0.2)",
      shadowBlur: 8,
      shadowOffsetY: 3,
    });
    const buttonText = new Konva.Text({
      text: label,
      fontSize: 16,
      fontFamily: "Arial",
      fill: "#FFFFFF",
      width: buttonRect.width(),
      height: buttonRect.height(),
      align: "center",
      verticalAlign: "middle",
    });
    group.add(buttonRect);
    group.add(buttonText);
    group.on("mouseenter", () => {
      group.getStage()?.container().style.setProperty("cursor", "pointer");
    });
    group.on("mouseleave", () => {
      group.getStage()?.container().style.setProperty("cursor", "default");
    });
    group.on("click tap", onClick);
    return group;
  }
}
